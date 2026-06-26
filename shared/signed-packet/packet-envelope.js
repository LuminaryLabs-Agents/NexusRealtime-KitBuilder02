import { canonicalJson } from '../utils/canonical-json.js';
import { sha256Ref } from '../utils/hash.js';
import { makeId, nowMs } from '../utils/ids.js';

export async function createPacketEnvelope({
  type,
  roomId,
  from,
  payload = {},
  ttlMs = 30000,
  seq = 0,
  signature = null,
  createdAt = nowMs()
}) {
  const payloadHash = await sha256Ref(payload);
  return {
    v: 1,
    packetId: makeId('pkt'),
    type,
    roomId,
    from,
    seq,
    nonce: makeId('nonce'),
    createdAt,
    expiresAt: createdAt + ttlMs,
    payloadHash,
    payload,
    signature,
    canonical: canonicalJson({ type, roomId, from, seq, payloadHash, payload })
  };
}
