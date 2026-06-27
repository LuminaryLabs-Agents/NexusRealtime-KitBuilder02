#!/usr/bin/env node
import { hasExample, listKitIds, parseArgs, REQUIRED_EXAMPLES } from './kitbuilder-core.mjs';

const args = parseArgs();
const ids = args.id ? [args.id] : await listKitIds();
let failed = false;

for (const kitId of ids) {
  const results = [];
  for (const exampleId of REQUIRED_EXAMPLES) {
    results.push({ exampleId, ok: await hasExample(kitId, exampleId) });
  }
  const done = results.filter(result => result.ok).length;
  console.log(`${kitId}: ${done}/${REQUIRED_EXAMPLES.length} required examples`);
  for (const result of results) console.log(`  ${result.ok ? 'ok' : 'missing'} ${result.exampleId}`);
  if (done !== REQUIRED_EXAMPLES.length) failed = true;
}

if (failed && args.strict) process.exit(1);
