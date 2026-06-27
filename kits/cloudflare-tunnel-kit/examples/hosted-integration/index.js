import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { writeRuntimeManifest } from '../../src/index.js';

const runtimeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kitbuilder-tunnel-'));
const result = await writeRuntimeManifest({
  runtimeDir,
  manifest: {
    mode: 'quick',
    localUrl: 'http://127.0.0.1:8787',
    publicUrl: 'https://abc-def.trycloudflare.com',
    pid: process.pid
  }
});

console.log(JSON.stringify(result.manifest, null, 2));
