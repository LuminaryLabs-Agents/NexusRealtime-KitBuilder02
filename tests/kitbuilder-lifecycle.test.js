import test from 'node:test';
import assert from 'node:assert/strict';
import { KIT_STATES, REQUIRED_EXAMPLES, parseArgs, stateAtIndex, stateIndex } from '../scripts/kitbuilder-core.mjs';

await test('kit lifecycle has exactly twenty ordered states', () => {
  assert.equal(KIT_STATES.length, 20);
  assert.equal(KIT_STATES[0], 'idea_captured');
  assert.equal(KIT_STATES[19], 'promotion_ready');
  assert.equal(stateIndex('quality_gated'), 18);
  assert.equal(stateAtIndex(16), 'example_3_live_or_edge');
});

await test('required kit examples are stable', () => {
  assert.deepEqual(REQUIRED_EXAMPLES, ['local-basic', 'hosted-integration', 'live-or-edge']);
});

await test('kitbuilder CLI arg parser handles flags and positionals', () => {
  const args = parseArgs(['new', '--title', 'My Kit', '--strict']);
  assert.deepEqual(args._, ['new']);
  assert.equal(args.title, 'My Kit');
  assert.equal(args.strict, true);
});
