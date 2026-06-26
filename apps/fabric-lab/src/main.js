import { PeerJsRoomKit } from '../../../kits/peerjs-room-kit/src/index.js';
import { PeerJsHostLayerKit } from '../../../kits/peerjs-hostlayer-kit/src/index.js';
import { SecurePeerOnnxKit, FakeOnnxRuntime } from '../../../kits/secure-peer-onnx-kit/src/index.js';

const rootRoom = await PeerJsRoomKit.join({
  roomId: 'room/root',
  identity: { identityKey: 'local:fabric-lab-controller', trust: 'self' },
  capabilities: { maxJobs: 2, models: [] }
});

const hostlayer = PeerJsHostLayerKit.create({
  parentRoom: rootRoom,
  childRooms: ['room/model/embed-mini-v1/shard/0001']
});

hostlayer.upsertRouteSummary({
  roomId: 'room/model/embed-mini-v1/shard/0001',
  warmModels: ['embed-mini-v1'],
  queueDepth: 0,
  avgLatencyMs: 40,
  trustedPeers: 1,
  peerTrustLevels: ['self'],
  bestPeer: 'local:fabric-lab-worker'
});

const mesh = await SecurePeerOnnxKit.join({
  roomFabric: hostlayer,
  identity: { identityKey: 'local:fabric-lab-controller' },
  runtime: new FakeOnnxRuntime({ supportedProviders: ['wasm'] }),
  modelManifests: [{
    modelId: 'embed-mini-v1',
    version: '0.1.0',
    url: '/models/embed-mini-v1.onnx',
    sha256: 'sha256:demo',
    sizeBytes: 1024,
    priority: 100,
    executionProviders: ['wasm'],
    testVectors: [{ name: 'smoke', input: 'hello', outputHash: 'sha256:demo' }]
  }],
  startupModels: { count: 1, mode: 'exact', strategy: 'priority', requireTestVector: true }
});

console.log(JSON.stringify({ room: rootRoom.getHealth(), mesh: mesh.getHealth() }, null, 2));
