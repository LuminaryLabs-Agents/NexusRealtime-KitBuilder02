#!/usr/bin/env node
import { resolveCloudflared } from '../../kits/cloudflare-tunnel-kit/src/index.js';

const cloudflared = resolveCloudflared();
const checks = {
  node: process.version,
  cloudflared: cloudflared ?? null,
  liveServerDefaultUrl: 'http://127.0.0.1:8787',
  runtimeDir: '.runtime',
  scripts: ['live:server', 'live:tunnel', 'live:fabric', 'live:doctor']
};

console.log(JSON.stringify({ ok: Boolean(cloudflared), checks }, null, 2));
if (!cloudflared) {
  console.log('cloudflared is optional for local tests, but required for public quick tunnels.');
  console.log('Install it or set CLOUDFLARED_BIN=/path/to/cloudflared.');
}
