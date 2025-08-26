import axios from 'axios';
import { setTimeout as delay } from 'timers/promises';

// Simple per-host token-bucket rate limiter + retry/backoff
class TokenBucket {
  constructor({ ratePerSecond = 2, burst = 5 } = {}) {
    this.capacity = burst;
    this.tokens = burst;
    this.refillRate = ratePerSecond; // tokens per second
    this.lastRefill = Date.now();
  }
  _refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const add = elapsed * this.refillRate;
    if (add > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + add);
      this.lastRefill = now;
    }
  }
  async acquire() {
    // Wait until a token is available
    // Enforce minimum 1 token per request
    // Avoid tight loop
    for (;;) {
      this._refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      await delay(50);
    }
  }
}

class CircuitBreaker {
  constructor({ failuresThreshold = 5, cooldownMs = 30000 } = {}) {
    this.failures = 0;
    this.threshold = failuresThreshold;
    this.cooldownMs = cooldownMs;
    this.openUntil = 0;
  }
  recordSuccess() {
    this.failures = 0;
  }
  recordFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.openUntil = Date.now() + this.cooldownMs;
    }
  }
  async ensureClosed() {
    if (Date.now() < this.openUntil) {
      const waitMs = this.openUntil - Date.now();
      throw new Error(`Circuit open, retry after ${waitMs}ms`);
    }
  }
}

function hostFromUrl(url) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export class SafeHttpClient {
  constructor({ perHostRps = 2, perHostBurst = 5, timeoutMs = 15000, retries = 3 } = {}) {
    this.buckets = new Map(); // host -> TokenBucket
    this.breakers = new Map(); // host -> CircuitBreaker
    this.perHostRps = perHostRps;
    this.perHostBurst = perHostBurst;
    this.timeoutMs = timeoutMs;
    this.retries = Math.max(0, retries);
    this.instance = axios.create({ timeout: this.timeoutMs, validateStatus: () => true });
  }

  _getBucket(host) {
    if (!this.buckets.has(host)) {
      this.buckets.set(host, new TokenBucket({ ratePerSecond: this.perHostRps, burst: this.perHostBurst }));
    }
    return this.buckets.get(host);
  }

  _getBreaker(host) {
    if (!this.breakers.has(host)) {
      this.breakers.set(host, new CircuitBreaker({ failuresThreshold: 6, cooldownMs: 60000 }));
    }
    return this.breakers.get(host);
  }

  async request(config) {
    const url = config.url || (config.baseURL ? new URL(config.baseURL + (config.path || '')).toString() : null);
    const host = hostFromUrl(url);
    if (!host) throw new Error('Invalid URL for request');

    // Staging allowlist enforcement
    const allowCsv = process.env.STAGING_ALLOWLIST || '';
    const allow = allowCsv.split(',').map(s => s.trim()).filter(Boolean);
    if (!allow.includes(host)) {
      throw new Error(`Target host '${host}' not in STAGING_ALLOWLIST. Refusing to run.`);
    }

    const bucket = this._getBucket(host);
    const breaker = this._getBreaker(host);

    let attempt = 0;
    let lastErr;
    while (attempt <= this.retries) {
      await breaker.ensureClosed();
      await bucket.acquire();
      try {
        const res = await this.instance.request(config);
        // Retry on 429/5xx with backoff
        if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
          const retryAfterSec = parseInt(res.headers['retry-after'] || '0', 10) || 0;
          const backoff = retryAfterSec > 0 ? retryAfterSec * 1000 : Math.min(1000 * Math.pow(2, attempt), 8000);
          attempt++;
          if (attempt > this.retries) {
            breaker.recordFailure();
            return res; // return last response for reporting
          }
          await delay(backoff);
          continue;
        }
        breaker.recordSuccess();
        return res;
      } catch (err) {
        lastErr = err;
        breaker.recordFailure();
        attempt++;
        if (attempt > this.retries) throw err;
        const backoff = Math.min(1000 * Math.pow(2, attempt), 8000);
        await delay(backoff);
      }
    }
    if (lastErr) throw lastErr;
  }
}

export function jsonlLogger(stream = process.stdout) {
  return (event) => {
    try {
      stream.write(JSON.stringify({ ts: new Date().toISOString(), ...event }) + '\n');
    } catch {
      // noop
    }
  };
}
