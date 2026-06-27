import { PeerJsRoomKit } from '../../src/index.js';

const engine = { services: {} };
engine.services.peerRoom = await PeerJsRoomKit.join({
  roomId: 'room/hosted-demo',
  identity: { identityKey: 'local:hosted-room', trust: 'self' },
  capabilities: { maxJobs: 2, models: ['demo-model'] }
});

console.log(JSON.stringify({ peerRoom: engine.services.peerRoom.getHealth() }, null, 2));
