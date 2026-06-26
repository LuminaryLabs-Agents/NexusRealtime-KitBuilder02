import test from 'node:test';
import assert from 'node:assert/strict';
import { createPacketEnvelope } from '../shared/signed-packet/packet-envelope.js';
import { validatePacketEnvelope } from '../kits/peerjs-room-kit/src/index.js';
import { NonceStore } from '../shared/signed-packet/nonce-store.js';

await test('packet envelope validates hash and rejects nonce replay', async () => {
  const nonceStore = new NonceStore();
  const packet = await createPacketEnvelope({
    type: 'room.join',
    roomId: 'room/root',
    from: { transportId: 'peer-a', identityKey: 'local:a' },
    payload: { ok: true }
  });
  await validatePacketEnvelope(packet, { nonceStore });
  await assert.rejects(() => validatePacketEnvelope(packet, { nonceStore }), /nonce replayed/);
});

await test('packet envelope rejects payload hash mismatch', async () => {
  const packet = await createPacketEnvelope({
    type: 'room.join',
    roomId: 'room/root',
    from: { transportId: 'peer-a', identityKey: 'local:a' },
    payload: { ok: true }
  });
  packet.payload.ok = false;
  await assert.rejects(() => validatePacketEnvelope(packet), /payloadHash mismatch/);
});
