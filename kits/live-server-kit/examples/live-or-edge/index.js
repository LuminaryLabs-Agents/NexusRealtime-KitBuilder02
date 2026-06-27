import { createLiveServer, LiveServerClient } from '../../src/index.js';

const server = createLiveServer({ port: 0 });
await server.start();
const { port } = server.server.address();
const client = new LiveServerClient({ baseUrl: `http://127.0.0.1:${port}` });

await client.relay({ targetIdentity: 'identity-b', roomId: 'room/root', payload: { reason: 'direct-link-failed' } });
const drained = await client.drainRelay('identity-b');
console.log(JSON.stringify(drained, null, 2));

await server.stop();
