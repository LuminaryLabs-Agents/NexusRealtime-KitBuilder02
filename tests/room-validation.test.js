import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRoomId, PeerJsRoomKit, electHosts } from '../kits/peerjs-room-kit/src/index.js';

await test('room ids are canonical and reject traversal', () => {
  assert.equal(validateRoomId('Room/Root'), 'room/root');
  assert.throws(() => validateRoomId('../../admin'));
  assert.throws(() => validateRoomId('room/root?inject=true'));
});

await test('room join creates presence and ledger state', async () => {
  const room = await PeerJsRoomKit.join({
    roomId: 'room/root',
    identity: { identityKey: 'local:test' },
    capabilities: { maxJobs: 1 }
  });
  assert.equal(room.presence.listActive().length, 1);
  assert.equal(room.ledger.replay()[0].type, 'room.join');
});

await test('host election uses trust and deterministic tiebreak', () => {
  const election = electHosts([
    { identityKey: 'local:b', trust: 'public', maxJobs: 10 },
    { identityKey: 'local:a', trust: 'self', maxJobs: 1 }
  ], { term: 1 });
  assert.equal(election.primary, 'local:a');
});
