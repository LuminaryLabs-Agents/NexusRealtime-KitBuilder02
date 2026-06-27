#!/usr/bin/env node
import { computeGates, listKitIds, parseArgs, readKitManifest } from './kitbuilder-core.mjs';

const args = parseArgs();
const ids = args.id ? [args.id] : await listKitIds();
const errors = [];

for (const kitId of ids) {
  const manifest = await readKitManifest(kitId);
  if (!manifest) {
    errors.push(`${kitId}: missing kit.manifest.json`);
    continue;
  }
  if (manifest.id !== kitId) errors.push(`${kitId}: manifest id mismatch (${manifest.id})`);
  if (!manifest.entry) errors.push(`${kitId}: manifest entry missing`);
  if (!Array.isArray(manifest.exports)) errors.push(`${kitId}: manifest exports must be an array`);
  if (!manifest.kind) errors.push(`${kitId}: manifest kind missing`);
  const gates = await computeGates(kitId);
  if (!gates.implementation_started) errors.push(`${kitId}: missing src/index.js`);
  if (!gates.implementation_complete) errors.push(`${kitId}: declared exports are not all visible in entry`);
}

if (errors.length) {
  console.error('Kit validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${ids.length} kit manifest(s).`);
