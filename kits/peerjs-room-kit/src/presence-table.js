import { validatePresenceLease } from './validation/presence-lease-validator.js';

export class PresenceTable {
  constructor({ now = Date.now } = {}) {
    this.now = now;
    this.peers = new Map();
  }

  upsert(lease) {
    const validated = validatePresenceLease(lease, { now: this.now });
    const existing = this.peers.get(validated.identity);
    if (!existing || validated.seq >= existing.seq || validated.signedAt >= existing.signedAt) {
      this.peers.set(validated.identity, validated);
    }
    return this.peers.get(validated.identity);
  }

  markStale() {
    const stale = [];
    for (const [identity, lease] of this.peers) {
      if (lease.expiresAt < this.now()) {
        stale.push(lease);
        this.peers.delete(identity);
      }
    }
    return stale;
  }

  listActive() {
    this.markStale();
    return [...this.peers.values()];
  }

  get(identity) {
    this.markStale();
    return this.peers.get(identity);
  }
}
