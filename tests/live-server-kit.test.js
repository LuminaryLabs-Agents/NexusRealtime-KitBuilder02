import test from 'node:test';
import assert from 'node:assert/strict';
import { createLiveServer, LiveServerClient } from '../kits/live-server-kit/src/index.js';

await test('live server mirrors events and snapshots', async () => {
  const server = createLiveServer({ port: 0 });
  await server.start();
  const address = server.server.address();
  const client = new LiveServerClient({ baseUrl: `http://127.0.0.1:${address.port}` });

  const health = await client.health();
  assert.equal(health.ok, true);

  await client.appendEvent({ roomId: 'room/root', type: 'room.join', subjectId: 'peer-a', payload: { ok: true } });
  const snapshot = await client.snapshot('room/root');
  assert.equal(snapshot.events.length, 1);
  assert.equal(snapshot.events[0].type, 'room.join');

  await server.stop();
});

await test('live server stores relay mailbox packets', async () => {
  const server = createLiveServer({ port: 0 });
  await server.start();
  const address = server.server.address();
  const client = new LiveServerClient({ baseUrl: `http://127.0.0.1:${address.port}` });

  await client.relay({ targetIdentity: 'identity-b', roomId: 'room/root', payload: { hello: 'world' } });
  const drained = await client.drainRelay('identity-b');
  assert.equal(drained.packets.length, 1);
  assert.equal(drained.packets[0].payload.hello, 'world');

  await server.stop();
});
