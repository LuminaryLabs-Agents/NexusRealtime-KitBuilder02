import test from 'node:test';
import assert from 'node:assert/strict';
import { PeerJsRoomKit } from '../kits/peerjs-room-kit/src/index.js';
import { PeerJsHostLayerKit, validateRoutePath } from '../kits/peerjs-hostlayer-kit/src/index.js';

await test('route path validation rejects cycles', () => {
  assert.throws(() => validateRoutePath(['room/root', 'room/model', 'room/root']), /cycle/);
});

await test('host layer selects warm lowest-cost route', async () => {
  const room = await PeerJsRoomKit.join({ roomId: 'room/root', identity: { identityKey: 'local:host' } });
  const hostlayer = PeerJsHostLayerKit.create({ parentRoom: room, childRooms: ['room/model/embed/shard/0001'] });
  hostlayer.upsertRouteSummary({ roomId: 'room/model/embed/shard/0001', warmModels: ['embed'], queueDepth: 3, avgLatencyMs: 100, trustedPeers: 1, peerTrustLevels: ['self'], bestPeer: 'local:worker-1' });
  const route = await hostlayer.findRoute({ modelId: 'embed', trust: 'self' });
  assert.equal(route.targetPeer, 'local:worker-1');
});
