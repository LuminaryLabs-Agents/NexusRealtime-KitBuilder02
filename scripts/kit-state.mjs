#!/usr/bin/env node
import { computeGates, highestPassedState, KIT_STATES, listKitIds, parseArgs, readProject, rebuildProjectIndex } from './kitbuilder-core.mjs';

const args = parseArgs();
const ids = args.id ? [args.id] : await listKitIds();
let failed = false;

for (const kitId of ids) {
  const project = await readProject(kitId);
  const computed = await highestPassedState(kitId);
  const gates = await computeGates(kitId);
  const missing = KIT_STATES.filter(state => !gates[state]);
  const bar = `${'#'.repeat(computed.stateIndex)}${'-'.repeat(KIT_STATES.length - computed.stateIndex)}`;
  console.log(`${kitId}`);
  console.log(`[${bar}] ${computed.stateIndex}/${KIT_STATES.length}`);
  console.log(`declared: ${project.currentState} | computed: ${computed.state}`);
  console.log(`kind: ${project.kind} | status: ${project.status}`);
  if (missing.length) {
    console.log('missing:');
    for (const state of missing.slice(0, 8)) console.log(`  - ${state}`);
  }
  console.log('');
  if (args.strict && missing.length) failed = true;
}

await rebuildProjectIndex();
if (failed) process.exit(1);
