import { makeId } from '../../../shared/utils/ids.js';

export class InMemoryLiveStore {
  constructor({ now = Date.now, maxEventsPerRoom = 5000 } = {}) {
    this.now = now;
    this.maxEventsPerRoom = maxEventsPerRoom;
    this.rooms = new Map();
    this.presence = new Map();
    this.routeSummaries = new Map();
    this.relayMailboxes = new Map();
  }

  ensureRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { roomId, events: [], heads: [], createdAt: this.now(), updatedAt: this.now() });
    }
    return this.rooms.get(roomId);
  }

  appendEvent(event) {
    const roomId = event.roomId ?? 'room/root';
    const room = this.ensureRoom(roomId);
    const normalized = {
      eventId: event.eventId ?? makeId('evt'),
      roomId,
      type: event.type ?? 'event.appended',
      subjectId: event.subjectId ?? event.packetId ?? makeId('subject'),
      payload: event.payload ?? {},
      signedBy: event.signedBy ?? event.identityKey ?? null,
      signature: event.signature ?? null,
      createdAt: event.createdAt ?? this.now()
    };
    room.events.push(normalized);
    if (room.events.length > this.maxEventsPerRoom) room.events.splice(0, room.events.length - this.maxEventsPerRoom);
    room.heads = [normalized.eventId];
    room.updatedAt = this.now();
    return normalized;
  }

  getSnapshot(roomId) {
    const room = this.ensureRoom(roomId);
    return {
      roomId,
      heads: room.heads,
      events: [...room.events],
      presence: [...this.presence.values()].filter(entry => entry.roomId === roomId),
      routeSummaries: [...this.routeSummaries.values()].filter(entry => entry.roomId === roomId),
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      snapshotAt: this.now()
    };
  }

  upsertPresence(lease) {
    const now = this.now();
    const entry = {
      roomId: lease.roomId ?? 'room/root',
      identityKey: lease.identityKey ?? lease.identity ?? lease.peerId ?? makeId('identity'),
      peerId: lease.peerId ?? lease.transportId ?? null,
      leaseMs: lease.leaseMs ?? 15000,
      capabilities: lease.capabilities ?? {},
      updatedAt: lease.updatedAt ?? now,
      expiresAt: lease.expiresAt ?? now + (lease.leaseMs ?? 15000)
    };
    this.presence.set(`${entry.roomId}:${entry.identityKey}`, entry);
    return entry;
  }

  reapStalePresence() {
    const now = this.now();
    const stale = [];
    for (const [key, entry] of this.presence.entries()) {
      if (entry.expiresAt <= now) {
        this.presence.delete(key);
        stale.push(entry);
      }
    }
    return stale;
  }

  upsertRouteSummary(summary) {
    const now = this.now();
    const entry = {
      roomId: summary.roomId,
      warmModels: summary.warmModels ?? [],
      queueDepth: summary.queueDepth ?? 0,
      avgLatencyMs: summary.avgLatencyMs ?? null,
      trustedPeers: summary.trustedPeers ?? 0,
      bestPeer: summary.bestPeer ?? null,
      updatedAt: summary.updatedAt ?? now,
      expiresAt: summary.expiresAt ?? now + (summary.ttlMs ?? 15000)
    };
    this.routeSummaries.set(entry.roomId, entry);
    return entry;
  }

  getFreshRouteSummaries() {
    const now = this.now();
    return [...this.routeSummaries.values()].filter(entry => entry.expiresAt > now);
  }

  enqueueRelay(packet) {
    const targetIdentity = packet.targetIdentity ?? packet.to ?? packet.target;
    if (!targetIdentity) throw new Error('relay packet missing targetIdentity');
    const relay = { relayId: packet.relayId ?? makeId('relay'), createdAt: this.now(), ...packet, targetIdentity };
    const mailbox = this.relayMailboxes.get(targetIdentity) ?? [];
    mailbox.push(relay);
    this.relayMailboxes.set(targetIdentity, mailbox);
    return relay;
  }

  drainRelay(targetIdentity) {
    const mailbox = this.relayMailboxes.get(targetIdentity) ?? [];
    this.relayMailboxes.set(targetIdentity, []);
    return mailbox;
  }
}
