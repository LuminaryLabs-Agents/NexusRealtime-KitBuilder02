#!/usr/bin/env node
import { startQuickTunnel } from '../src/index.js';

function readArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : fallback;
}

const localUrl = readArg('url', process.env.LIVE_SERVER_URL ?? 'http://127.0.0.1:8787');
const runtimeDir = readArg('runtime-dir', process.env.RUNTIME_DIR ?? '.runtime');

const runner = startQuickTunnel({ localUrl, runtimeDir });
runner.on('log', text => process.stdout.write(`[cloudflared] ${text}`));
runner.on('url', manifest => {
  console.log(`[tunnel] public URL ${manifest.publicUrl}`);
  console.log(`[tunnel] public WebSocket ${manifest.publicWsUrl}`);
  console.log(`[manifest] wrote ${runtimeDir}/tunnel.json`);
});
runner.on('exit', info => {
  console.log(`[tunnel] exited code=${info.code} signal=${info.signal ?? ''}`);
  process.exit(info.code ?? 0);
});
runner.on('error', error => {
  console.error(`[tunnel] ${error.message}`);
});

const stop = signal => {
  console.log(`[tunnel] stopping ${signal}`);
  runner.stop();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
