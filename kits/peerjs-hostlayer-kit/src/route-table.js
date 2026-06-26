import { validateRoomId } from '../../peerjs-room-kit/src/validation/room-id-validator.js';

export class RouteTable {
  constructor({ now = Date.now, summaryTtlMs = 15000 } = {}) {
    this.now = now;
    this.summaryTtlMs = summaryTtlMs;
    this.rooms = new Map();
  }

  upsertSummary(summary) {
    const roomId = validateRoomId(summary.roomId);
    const stored = { ...summary, roomId, updatedAt: this.now(), expiresAt: this.now() + (summary.ttlMs ?? this.summaryTtlMs) };
    this.rooms.set(roomId, stored);
    return stored;
  }

  listFresh() {
    const current = this.now();
    for (const [roomId, summary] of this.rooms) {
      if (summary.expiresAt < current) this.rooms.delete(roomId);
    }
    return [...this.rooms.values()];
  }

  findCandidates({ modelId, trust = 'public' } = {}) {
    const trustRank = { public: 0, invited: 1, verified: 2, self: 3 };
    const requiredTrust = trustRank[trust] ?? 0;
    return this.listFresh().filter(summary => {
      const hasModel = !modelId || (summary.warmModels ?? []).includes(modelId);
      const summaryTrust = Math.max(...(summary.peerTrustLevels ?? ['public']).map(level => trustRank[level] ?? 0));
      return hasModel && summaryTrust >= requiredTrust;
    });
  }
}
