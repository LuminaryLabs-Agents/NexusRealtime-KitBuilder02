import { createLiveServer, LiveServerClient } from '../../src/index.js';

const server = createLiveServer({ port: 0 });
await server.start();
const { port } = server.server.address();
const client = new LiveServerClient({ baseUrl: `http://127.0.0.1:${port}` });

await client.appendEvent({ roomId: 'room/root', type: 'room.join', subjectId: 'peer-a', payload: { ok: true } });
const snapshot = await client.snapshot('room/root');
console.log(JSON.stringify({ health: await client.health(), eventCount: snapshot.events.length }, null, 2));

await server.stop();
