import { PeerJsRoomKit } from '../../../peerjs-room-kit/src/index.js';
import { PeerJsHostLayerKit } from '../../src/index.js';

let now = 1000;
const rootRoom = await PeerJsRoomKit.join({ roomId: 'room/root', identity: { identityKey: 'local:edge-controller' }, now: () => now });
const hostlayer = PeerJsHostLayerKit.create({
  parentRoom: rootRoom,
  childRooms: ['room/model/demo/shard/0001', 'room/model/demo/shard/0002'],
  now: () => now
});

hostlayer.upsertRouteSummary({ roomId: 'room/model/demo/shard/0001', warmModels: ['demo-model'], queueDepth: 99, bestPeer: 'local:busy' });
hostlayer.upsertRouteSummary({ roomId: 'room/model/demo/shard/0002', warmModels: ['demo-model'], queueDepth: 0, bestPeer: 'local:healthy' });

const route = await hostlayer.findRoute({ modelId: 'demo-model' });
console.log(JSON.stringify({ selected: route.targetPeer, route }, null, 2));
