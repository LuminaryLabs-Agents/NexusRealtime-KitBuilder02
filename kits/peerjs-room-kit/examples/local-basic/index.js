import { PeerJsRoomKit } from '../../src/index.js';

const room = await PeerJsRoomKit.join({
  roomId: 'room/root',
  identity: { identityKey: 'local:room-example', trust: 'self' },
  capabilities: { maxJobs: 1, models: [] }
});

console.log(JSON.stringify(room.getHealth(), null, 2));
