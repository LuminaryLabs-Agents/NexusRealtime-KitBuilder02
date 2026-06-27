#!/usr/bin/env node
import fs from 'node:fs/promises';
import { createLiveServer } from '../../kits/live-server-kit/src/index.js';
import { startQuickTunnel, resolveCloudflared, writeLiveServerManifest } from '../../kits/cloudflare-tunnel-kit/src/index.js';

async function readConfig(path = 'kitbuilder.live.json') {
  try {
    return JSON.parse(await fs.readFile(path, 'utf8'));
  } catch {
    return {};
  }
}

const config = await readConfig();
const liveConfig = config.liveServer ?? {};
const tunnelConfig = config.tunnel ?? {};
const runtimeDir = config.runtimeDir ?? '.runtime';
const host = liveConfig.host ?? '127.0.0.1';
const port = Number(liveConfig.port ?? 8787);
const localUrl = tunnelConfig.localUrl ?? `http://${host}:${port}`;

const server = createLiveServer({ host, port, security: config.security ?? {} });
await server.start();
console.log(`[live-server] listening ${server.getLocalUrl()}`);
await writeLiveServerManifest({ runtimeDir, manifest: { localUrl: server.getLocalUrl(), host, port, pid: process.pid } });
console.log(`[manifest] wrote ${runtimeDir}/live-server.json`);

let tunnel = null;
const cloudflared = resolveCloudflared();
if (tunnelConfig.enabled === false) {
  console.log('[tunnel] disabled by config');
} else if (!cloudflared) {
  console.log('[tunnel] cloudflared not found. Live server is running locally only.');
  console.log('[tunnel] install cloudflared or set CLOUDFLARED_BIN, then rerun npm run live:fabric');
} else {
  console.log(`[tunnel] spawning cloudflared tunnel --url ${localUrl}`);
  tunnel = startQuickTunnel({ localUrl, runtimeDir, cloudflaredPath: cloudflared });
  tunnel.on('log', text => process.stdout.write(`[cloudflared] ${text}`));
  tunnel.on('url', manifest => {
    console.log(`[tunnel] public URL ${manifest.publicUrl}`);
    console.log(`[mesh] public WebSocket ${manifest.publicWsUrl}`);
    console.log(`[manifest] wrote ${runtimeDir}/tunnel.json`);
  });
  tunnel.on('exit', info => console.log(`[tunnel] exited code=${info.code} signal=${info.signal ?? ''}`));
  tunnel.on('error', error => console.error(`[tunnel] ${error.message}`));
}

const stop = async signal => {
  console.log(`[runner] stopping ${signal}`);
  tunnel?.stop?.();
  await server.stop();
  process.exit(0);
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
