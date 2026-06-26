import { TinyEventEmitter } from '../../../shared/utils/event-emitter.js';
import { makeId } from '../../../shared/utils/ids.js';
import { createPacketEnvelope } from '../../../shared/signed-packet/packet-envelope.js';
import { NonceStore } from '../../../shared/signed-packet/nonce-store.js';
import { AppendLedger } from '../../../shared/append-ledger/append-ledger.js';
import { completed, failedClosed } from '../../../shared/utils/outcome.js';
import { PresenceTable } from './presence-table.js';
import { PacketAckTracker } from './packet-ack-tracker.js';
import { validateRoomId } from './validation/room-id-validator.js';
import { validatePeerIdentity } from './validation/peer-identity-validator.js';
import { validatePacketEnvelope } from './validation/packet-envelope-validator.js';

export class PeerRoom extends TinyEventEmitter {
  constructor({ roomId, identity, capabilities = {}, transport = null, now = Date.now } = {}) {
    super();
    this.roomId = validateRoomId(roomId);
    this.identity = validatePeerIdentity(identity ?? { identityKey: `local:${makeId('identity')}` });
    this.capabilities = capabilities;
    this.transport = transport;
    this.now = now;
    this.transportId = transport?.id ?? makeId('peerjs');
    this.presence = new PresenceTable({ now });
    this.ledger = new AppendLedger({ roomId: this.roomId, now });
    this.nonces = new NonceStore({ now });
    this.acks = new PacketAckTracker({ now });
    this.sequence = 0;
  }

  static async join(options) {
    const room = new PeerRoom(options);
    await room.ledger.append({
      type: 'room.join',
      subjectId: room.identity.identityKey,
      payload: { roomId: room.roomId, transportId: room.transportId, capabilities: room.capabilities }
    });
    room.presence.upsert(room.createPresenceLease());
    if (room.transport?.on) {
      room.transport.on('packet', packet => room.receive(packet));
    }
    return room;
  }

  createPresenceLease({ leaseMs = 15000 } = {}) {
    return {
      type: 'presence.heartbeat',
      peerId: this.transportId,
      identity: this.identity.identityKey,
      roomId: this.roomId,
      seq: this.sequence,
      leaseMs,
      capabilityHash: JSON.stringify(this.capabilities),
      signedAt: this.now()
    };
  }

  async heartbeat() {
    this.sequence += 1;
    const lease = this.createPresenceLease();
    this.presence.upsert(lease);
    await this.ledger.append({ type: 'presence.heartbeat', subjectId: this.identity.identityKey, payload: lease });
    return lease;
  }

  async createPacket(type, payload = {}, { ttlMs = 30000 } = {}) {
    this.sequence += 1;
    return createPacketEnvelope({
      type,
      roomId: this.roomId,
      from: { transportId: this.transportId, identityKey: this.identity.identityKey },
      seq: this.sequence,
      ttlMs,
      payload
    });
  }

  async broadcast(type, payload = {}, options = {}) {
    const packet = await this.createPacket(type, payload, options);
    this.acks.track(packet);
    await this.ledger.append({ type, subjectId: packet.packetId, payload: { payloadHash: packet.payloadHash, payload } });
    this.transport?.broadcast?.(packet);
    this.emit('packet:sent', packet);
    return packet;
  }

  async receive(packet) {
    try {
      const validated = await validatePacketEnvelope(packet, { nonceStore: this.nonces, now: this.now });
      await this.ledger.append({ type: validated.type, subjectId: validated.packetId, payload: validated.payload });
      this.emit('packet:received', packet);
      if (packet.type === 'presence.heartbeat') this.presence.upsert(packet.payload);
      return completed(packet, packet.packetId);
    } catch (error) {
      this.emit('packet:rejected', { packet, error });
      return failedClosed(error.message, packet?.packetId ?? makeId('trace'), { error });
    }
  }

  async connectToPeer(peerId, options = {}) {
    if (!peerId) return failedClosed('peerId required', makeId('trace'));
    if (this.transport?.connect) {
      const link = await this.transport.connect(peerId, options);
      return completed(link, makeId('link'));
    }
    return failedClosed('transport does not support direct connect', makeId('trace'));
  }

  getHealth() {
    return {
      peerId: this.transportId,
      identity: this.identity.identityKey,
      rooms: [this.roomId],
      loadedModels: this.capabilities.models ?? [],
      warmModels: this.capabilities.warmModels ?? [],
      capacity: {
        maxJobs: this.capabilities.maxJobs ?? 1,
        activeJobs: this.capabilities.activeJobs ?? 0,
        queueDepth: this.capabilities.queueDepth ?? 0
      },
      ledger: { headCount: this.ledger.getHeads().length, conflicts: this.ledger.conflicts.length }
    };
  }
}
