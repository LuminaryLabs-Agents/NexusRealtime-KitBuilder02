#!/usr/bin/env node
import { highestPassedState, KIT_STATES, parseArgs, readProject, saveProject, stateAtIndex, stateIndex } from './kitbuilder-core.mjs';

const args = parseArgs();
const kitId = args.id;
if (!kitId) {
  console.error('usage: npm run kit:advance -- --id <kit-id> [--auto]');
  process.exit(1);
}

const project = await readProject(kitId);
const computed = await highestPassedState(kitId);
const currentIdx = stateIndex(project.currentState);
const targetIdx = args.auto ? computed.stateIndex : Math.min(currentIdx + 1, computed.stateIndex);

if (targetIdx <= currentIdx) {
  console.log(`${kitId} remains at ${project.currentState} (${currentIdx}/${KIT_STATES.length}).`);
  console.log(`computed highest passed state: ${computed.state} (${computed.stateIndex}/${KIT_STATES.length})`);
  const nextState = stateAtIndex(currentIdx + 1);
  if (nextState) console.log(`next gate not passed: ${nextState}`);
  process.exit(0);
}

project.currentState = stateAtIndex(targetIdx);
project.stateIndex = targetIdx;
project.gates = computed.gates;
await saveProject(project, `Advanced to ${project.currentState}.`);
console.log(`${kitId} advanced to ${project.currentState} (${targetIdx}/${KIT_STATES.length}).`);
