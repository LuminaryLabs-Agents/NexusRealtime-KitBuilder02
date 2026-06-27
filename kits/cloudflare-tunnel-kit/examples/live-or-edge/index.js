import { resolveCloudflared } from '../../src/index.js';

const cloudflared = resolveCloudflared();
const status = cloudflared
  ? { mode: 'quick-tunnel-ready', cloudflared }
  : { mode: 'local-only-fallback', hint: 'Install cloudflared or set CLOUDFLARED_BIN to enable public quick tunnels.' };

console.log(JSON.stringify(status, null, 2));
