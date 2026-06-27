import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseCloudflaredTunnelUrl, toPublicWsUrl, writeRuntimeManifest } from '../kits/cloudflare-tunnel-kit/src/index.js';

await test('parses trycloudflare quick tunnel URL', () => {
  const text = 'Your quick Tunnel has been created! Visit it at https://abc-def.trycloudflare.com';
  assert.equal(parseCloudflaredTunnelUrl(text), 'https://abc-def.trycloudflare.com');
  assert.equal(toPublicWsUrl('https://abc-def.trycloudflare.com'), 'wss://abc-def.trycloudflare.com/ws');
});

await test('writes tunnel runtime manifest', async () => {
  const runtimeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tunnel-manifest-'));
  const result = await writeRuntimeManifest({
    runtimeDir,
    manifest: {
      mode: 'quick',
      localUrl: 'http://127.0.0.1:8787',
      publicUrl: 'https://abc-def.trycloudflare.com',
      pid: 123
    }
  });
  const text = await fs.readFile(result.path, 'utf8');
  const parsed = JSON.parse(text);
  assert.equal(parsed.publicWsUrl, 'wss://abc-def.trycloudflare.com/ws');
  assert.equal(parsed.health, 'online');
});
