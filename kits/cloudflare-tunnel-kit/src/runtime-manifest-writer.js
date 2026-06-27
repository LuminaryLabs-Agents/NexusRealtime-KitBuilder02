import fs from 'node:fs/promises';
import path from 'node:path';
import { toPublicWsUrl } from './tunnel-url-parser.js';

export async function writeRuntimeManifest({ runtimeDir = '.runtime', fileName = 'tunnel.json', manifest }) {
  await fs.mkdir(runtimeDir, { recursive: true });
  const publicWsUrl = manifest.publicWsUrl ?? toPublicWsUrl(manifest.publicUrl);
  const full = {
    mode: manifest.mode ?? 'quick',
    localUrl: manifest.localUrl,
    publicUrl: manifest.publicUrl ?? null,
    publicWsUrl,
    pid: manifest.pid ?? null,
    health: manifest.health ?? (manifest.publicUrl ? 'online' : 'degraded'),
    startedAt: manifest.startedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const outPath = path.join(runtimeDir, fileName);
  await fs.writeFile(outPath, `${JSON.stringify(full, null, 2)}\n`, 'utf8');
  return { path: outPath, manifest: full };
}

export async function writeLiveServerManifest({ runtimeDir = '.runtime', manifest }) {
  await fs.mkdir(runtimeDir, { recursive: true });
  const full = { kit: 'live-server-kit', health: 'online', startedAt: new Date().toISOString(), ...manifest, updatedAt: new Date().toISOString() };
  const outPath = path.join(runtimeDir, 'live-server.json');
  await fs.writeFile(outPath, `${JSON.stringify(full, null, 2)}\n`, 'utf8');
  return { path: outPath, manifest: full };
}
