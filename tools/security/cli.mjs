#!/usr/bin/env node
import { auditSecurityHeaders } from './headersAuditor.mjs';
import { SafeHttpClient, jsonlLogger } from './httpClient.mjs';

function printUsage() {
  console.error(`Usage:
  STAGING_ALLOWLIST=staging.example.com node tools/security/cli.mjs headers <url1> [url2 ...]

Notes:
- STAGING_ONLY: Tool refuses to run if target host is not in STAGING_ALLOWLIST (comma-separated hostnames).
- Outputs JSONL on stdout for easy ingestion.
`);
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const log = jsonlLogger(process.stdout);
  const client = new SafeHttpClient({ perHostRps: 2, perHostBurst: 5, retries: 3 });

  if (!cmd || cmd === '-h' || cmd === '--help') {
    printUsage();
    process.exit(1);
  }

  if (cmd === 'headers') {
    if (args.length === 0) {
      printUsage();
      process.exit(1);
    }
    const results = [];
    for (const url of args) {
      try {
        const out = await auditSecurityHeaders({ url, client, log });
        results.push({ url, ok: true, summary: out.summary });
      } catch (err) {
        log({ type: 'audit.error', url, error: String(err && err.message ? err.message : err) });
        results.push({ url, ok: false, error: String(err && err.message ? err.message : err) });
      }
    }
    // Final compact summary to stderr
    const scoreAvg = results.filter(r => r.ok).reduce((a, r) => a + (r.summary?.score || 0), 0) / Math.max(1, results.filter(r => r.ok).length);
    console.error(`[headers] Done. Targets=${results.length}, OK=${results.filter(r => r.ok).length}, AvgScore=${Number.isFinite(scoreAvg) ? scoreAvg.toFixed(1) : 'n/a'}`);
    return;
  }

  printUsage();
  process.exit(1);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
