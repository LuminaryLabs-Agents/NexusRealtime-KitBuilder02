import { isObject, requireNumber, requireString, ValidationError } from '../../../../shared/utils/validation.js';
import { sha256Ref } from '../../../../shared/utils/hash.js';
import { validateRoomId } from './room-id-validator.js';

const DEFAULT_ALLOWED_TYPES = new Set([
  'room.join',
  'room.leave',
  'presence.heartbeat',
  'capability.advertise',
  'queue.status',
  'ledger.heads',
  'direct-link.request',
  'direct-link.accepted',
  'packet.ack',
  'packet.nack',
  'route.request',
  'route.offer',
  'route.failed',
  'job.request',
  'job.claim',
  'job.progress',
  'job.result',
  'job.failed',
  'job.retry'
]);

export async function validatePacketEnvelope(packet, {
  now = Date.now,
  clockSkewMs = 120000,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  nonceStore,
  requireSignature = false
} = {}) {
  if (!isObject(packet)) throw new ValidationError('packet must be an object');
  const v = requireNumber(packet.v, 'packet.v', { integer: true, min: 1, max: 1 });
  const packetId = requireString(packet.packetId, 'packet.packetId', { maxLength: 128 });
  const type = requireString(packet.type, 'packet.type', { maxLength: 128 });
  if (!allowedTypes.has(type)) throw new ValidationError('unknown packet type', { type });
  const roomId = validateRoomId(packet.roomId);
  if (!isObject(packet.from)) throw new ValidationError('packet.from must be an object');
  requireString(packet.from.transportId, 'packet.from.transportId', { maxLength: 256 });
  requireString(packet.from.identityKey, 'packet.from.identityKey', { maxLength: 512 });
  const seq = requireNumber(packet.seq, 'packet.seq', { integer: true, min: 0 });
  const nonce = requireString(packet.nonce, 'packet.nonce', { maxLength: 256 });
  const createdAt = requireNumber(packet.createdAt, 'packet.createdAt', { integer: true, min: 0 });
  const expiresAt = requireNumber(packet.expiresAt, 'packet.expiresAt', { integer: true, min: createdAt });
  const current = now();
  if (createdAt > current + clockSkewMs) throw new ValidationError('packet createdAt is too far in the future', { createdAt, current });
  if (expiresAt < current - clockSkewMs) throw new ValidationError('packet expired', { expiresAt, current });
  if (nonceStore && !nonceStore.assertFresh(nonce)) throw new ValidationError('packet nonce replayed', { nonce });
  const actualPayloadHash = await sha256Ref(packet.payload ?? {});
  if (packet.payloadHash !== actualPayloadHash) {
    throw new ValidationError('packet payloadHash mismatch', { expected: packet.payloadHash, actual: actualPayloadHash });
  }
  if (requireSignature && !packet.signature) throw new ValidationError('packet signature required');
  return { v, packetId, type, roomId, seq, nonce, createdAt, expiresAt, payload: packet.payload ?? {} };
}

export { DEFAULT_ALLOWED_TYPES };
