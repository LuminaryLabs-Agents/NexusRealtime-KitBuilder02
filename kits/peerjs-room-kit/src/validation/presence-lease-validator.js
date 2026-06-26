import { isObject, requireNumber, requireString, ValidationError } from '../../../../shared/utils/validation.js';
import { validateRoomId } from './room-id-validator.js';

export function validatePresenceLease(lease, { now = Date.now, maxLeaseMs = 60000 } = {}) {
  if (!isObject(lease)) throw new ValidationError('presence lease must be an object');
  const peerId = requireString(lease.peerId, 'lease.peerId', { maxLength: 256 });
  const identity = requireString(lease.identity, 'lease.identity', { maxLength: 512 });
  const roomId = validateRoomId(lease.roomId);
  const seq = requireNumber(lease.seq, 'lease.seq', { integer: true, min: 0 });
  const leaseMs = requireNumber(lease.leaseMs, 'lease.leaseMs', { integer: true, min: 500, max: maxLeaseMs });
  const signedAt = requireNumber(lease.signedAt, 'lease.signedAt', { integer: true, min: 0 });
  const expiresAt = signedAt + leaseMs;
  return {
    peerId,
    identity,
    roomId,
    seq,
    leaseMs,
    signedAt,
    expiresAt,
    stale: expiresAt < now(),
    capabilityHash: lease.capabilityHash
  };
}
