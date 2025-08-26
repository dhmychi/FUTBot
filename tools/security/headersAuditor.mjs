import { SafeHttpClient, jsonlLogger } from './httpClient.mjs';

const REQUIRED = {
  'strict-transport-security': {
    desc: 'Enforce HTTPS with preload-ready HSTS',
    check: (v) => typeof v === 'string' && /max-age=\d+/.test(v) && /max-age=(\d{6,})/i.test(v) && /includeSubDomains/i.test(v),
    advice: 'Use: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload (staging may omit preload if not intended)'
  },
  'content-security-policy': {
    desc: 'Mitigate XSS/Clickjacking/Injection via CSP',
    check: (v) => typeof v === 'string' && /(default-src|script-src)/i.test(v),
    advice: "Define CSP with 'default-src' and strict 'script-src' (avoid unsafe-inline/eval). Use nonces/hashes."
  },
  'x-frame-options': {
    desc: 'Clickjacking mitigation',
    check: (v) => typeof v === 'string' && /(DENY|SAMEORIGIN)/i.test(v),
    advice: 'X-Frame-Options: DENY (or SAMEORIGIN if embedding needed)'
  },
  'referrer-policy': {
    desc: 'Limit referrer leakage',
    check: (v) => typeof v === 'string' && /(no-referrer|strict-origin-when-cross-origin)/i.test(v),
    advice: 'Referrer-Policy: no-referrer or strict-origin-when-cross-origin'
  },
  'cross-origin-opener-policy': {
    desc: 'Protect against cross-origin interactions (COOP)',
    check: (v) => typeof v === 'string' && /(same-origin|same-origin-allow-popups)/i.test(v),
    advice: 'Cross-Origin-Opener-Policy: same-origin'
  },
  'cross-origin-embedder-policy': {
    desc: 'Enable powerful features safely (COEP)',
    check: (v) => typeof v === 'string' && /require-corp/i.test(v),
    advice: 'Cross-Origin-Embedder-Policy: require-corp (if compatible)'
  },
  'cross-origin-resource-policy': {
    desc: 'Prevent cross-origin resource abuse (CORP)',
    check: (v) => typeof v === 'string' && /(same-site|same-origin)/i.test(v),
    advice: 'Cross-Origin-Resource-Policy: same-origin (or same-site)'
  },
  'permissions-policy': {
    desc: 'Restrict powerful browser features',
    check: (v) => typeof v === 'string' && v.length > 0,
    advice: 'Define Permissions-Policy to disable unneeded features (camera=(), geolocation=(), usb=(), etc.)'
  }
};

function normalizeHeaders(raw) {
  const map = {};
  for (const [k, v] of Object.entries(raw || {})) {
    map[String(k).toLowerCase()] = Array.isArray(v) ? v.join(', ') : v;
  }
  return map;
}

function evaluate(headers) {
  const findings = [];
  for (const [name, rule] of Object.entries(REQUIRED)) {
    const value = headers[name];
    const ok = rule.check(value);
    findings.push({
      header: name,
      present: typeof value !== 'undefined',
      valid: !!ok,
      value: value ?? null,
      desc: rule.desc,
      advice: ok ? null : rule.advice,
      severity: ok ? 'info' : (name === 'content-security-policy' || name === 'strict-transport-security' ? 'high' : 'medium')
    });
  }
  return findings;
}

export async function auditSecurityHeaders({ url, client, log = jsonlLogger() }) {
  if (!client) client = new SafeHttpClient();
  const res = await client.request({ url, method: 'GET' });
  const headers = normalizeHeaders(res.headers);
  const findings = evaluate(headers);

  const summary = {
    url,
    status: res.status,
    missing: findings.filter(f => !f.present).map(f => f.header),
    invalid: findings.filter(f => f.present && !f.valid).map(f => f.header),
    score: 100 - findings.filter(f => f.severity === 'high' && (!f.present || !f.valid)).length * 30 - findings.filter(f => f.severity === 'medium' && (!f.present || !f.valid)).length * 10
  };

  log({ type: 'audit.headers', url, status: res.status, headers });
  for (const f of findings) log({ type: 'audit.finding', url, ...f });
  log({ type: 'audit.summary', url, ...summary });

  return { res, headers, findings, summary };
}
