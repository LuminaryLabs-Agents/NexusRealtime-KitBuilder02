import { PeerJsRoomKit } from '../../src/index.js';

let now = 1000;
const room = await PeerJsRoomKit.join({
  roomId: 'room/edge-demo',
  identity: { identityKey: 'local:edge-room', trust: 'self' },
  capabilities: { maxJobs: 1 },
  now: () => now
});

now += 60000;
const stale = room.reapStalePeers?.() ?? [];
console.log(JSON.stringify({ health: room.getHealth(), stale }, null, 2));
