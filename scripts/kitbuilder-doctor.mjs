#!/usr/bin/env node
import { listKitIds, highestPassedState, listLocalIssues, readLessons, rebuildProjectIndex } from './kitbuilder-core.mjs';

const kits = [];
for (const kitId of await listKitIds()) {
  const state = await highestPassedState(kitId);
  kits.push({ kitId, state: state.state, stateIndex: state.stateIndex });
}
const openIssues = await listLocalIssues('open');
const closedIssues = await listLocalIssues('closed');
const lessons = await readLessons();
await rebuildProjectIndex();

console.log('KitBuilder02 Doctor');
console.log('');
console.log(`Kits: ${kits.length}`);
for (const kit of kits) console.log(`- ${kit.kitId.padEnd(28)} ${String(kit.stateIndex).padStart(2)}/20 ${kit.state}`);
console.log('');
console.log(`Open local issues: ${openIssues.length}`);
for (const issue of openIssues.slice(0, 10)) console.log(`- ${issue.issueId}: ${issue.title}`);
console.log(`Closed local issues: ${closedIssues.length}`);
console.log(`Agent-brain lessons: ${lessons.length}`);
console.log('');
console.log('Commands:');
console.log('  npm run kit:state');
console.log('  npm run kit:examples');
console.log('  npm run kit:issue -- new --title "..." --kit <kit-id>');
console.log('  npm run kit:lesson -- --title "..." --body "..."');
