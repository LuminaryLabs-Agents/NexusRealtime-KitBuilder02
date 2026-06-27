import { createLiveServer, LiveServerClient } from '../../src/index.js';

const server = createLiveServer({ port: 0 });
await server.start();
const { port } = server.server.address();
const engine = { services: { liveMesh: new LiveServerClient({ baseUrl: `http://127.0.0.1:${port}` }) } };

await engine.services.liveMesh.upsertRouteSummary({
  roomId: 'room/model/demo/shard/0001',
  warmModels: ['demo-model'],
  queueDepth: 0,
  bestPeer: 'local:worker'
});

console.log(JSON.stringify(await engine.services.liveMesh.health(), null, 2));
await server.stop();
