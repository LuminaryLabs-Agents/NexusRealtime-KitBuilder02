#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { listKitIds, PROJECT_ROOT, readKitManifest, writeJson } from './kitbuilder-core.mjs';

async function sha256(filePath) {
  const data = await fs.readFile(filePath);
  return `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;
}

const kits = {};
for (const kitId of await listKitIds()) {
  const manifest = await readKitManifest(kitId);
  if (!manifest) continue;
  const entryPath = path.join(PROJECT_ROOT, 'kits', kitId, manifest.entry ?? 'src/index.js');
  kits[kitId] = {
    version: manifest.version ?? '0.0.0',
    kind: manifest.kind ?? 'browser-runtime',
    status: manifest.status ?? 'experimental',
    entry: `kits/${kitId}/${manifest.entry ?? 'src/index.js'}`,
    latest: `latest/${kitId}.js`,
    browserSafe: Boolean(manifest.browserSafe),
    nodeSafe: Boolean(manifest.nodeSafe),
    lifecycle: manifest.lifecycle ?? null,
    checksum: await sha256(entryPath)
  };
}

const registry = {
  source: 'NexusRealtime-KitBuilder02',
  builtAt: new Date().toISOString(),
  version: '0.1.0',
  kits
};

await writeJson(path.join(PROJECT_ROOT, 'dist', 'kitbuilder.registry.json'), registry);
console.log(`Wrote dist/kitbuilder.registry.json with ${Object.keys(kits).length} kit(s).`);
