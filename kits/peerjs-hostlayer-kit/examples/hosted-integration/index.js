import { PeerJsRoomKit } from '../../../peerjs-room-kit/src/index.js';
import { PeerJsHostLayerKit } from '../../src/index.js';

const engine = { services: {} };
engine.services.rootRoom = await PeerJsRoomKit.join({
  roomId: 'room/hosted-root',
  identity: { identityKey: 'local:hosted-controller' }
});
engine.services.hostLayer = PeerJsHostLayerKit.create({
  parentRoom: engine.services.rootRoom,
  childRooms: ['room/model/demo/shard/0001']
});

engine.services.hostLayer.upsertRouteSummary({
  roomId: 'room/model/demo/shard/0001',
  warmModels: ['demo-model'],
  queueDepth: 1,
  bestPeer: 'local:hosted-worker'
});

console.log(JSON.stringify(await engine.services.hostLayer.findRoute({ modelId: 'demo-model' }), null, 2));
