import { PeerJsRoomKit } from '../../../peerjs-room-kit/src/index.js';
import { PeerJsHostLayerKit } from '../../src/index.js';

const rootRoom = await PeerJsRoomKit.join({
  roomId: 'room/root',
  identity: { identityKey: 'local:hostlayer-controller' }
});

const hostlayer = PeerJsHostLayerKit.create({
  parentRoom: rootRoom,
  childRooms: ['room/model/embed-mini-v1/shard/0001']
});

hostlayer.upsertRouteSummary({
  roomId: 'room/model/embed-mini-v1/shard/0001',
  warmModels: ['embed-mini-v1'],
  queueDepth: 0,
  bestPeer: 'local:worker-1'
});

const route = await hostlayer.findRoute({ modelId: 'embed-mini-v1' });
console.log(JSON.stringify(route, null, 2));
