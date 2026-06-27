#!/usr/bin/env node
import { createLiveServer } from '../src/index.js';

function readArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : fallback;
}

const host = readArg('host', process.env.LIVE_SERVER_HOST ?? '127.0.0.1');
const port = Number(readArg('port', process.env.LIVE_SERVER_PORT ?? 8787));
const server = createLiveServer({ host, port });

await server.start();
console.log(`[live-server] listening ${server.getLocalUrl()}`);
console.log('[live-server] health ok');

const stop = async signal => {
  console.log(`[live-server] stopping ${signal}`);
  await server.stop();
  process.exit(0);
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
