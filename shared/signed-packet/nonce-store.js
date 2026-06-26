export class NonceStore {
  constructor({ ttlMs = 120000, maxEntries = 5000, now = () => Date.now() } = {}) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.now = now;
    this.entries = new Map();
  }

  has(nonce) {
    this.prune();
    return this.entries.has(nonce);
  }

  remember(nonce) {
    this.prune();
    if (this.entries.size >= this.maxEntries) {
      const oldest = [...this.entries.entries()].sort((a, b) => a[1] - b[1])[0]?.[0];
      if (oldest) this.entries.delete(oldest);
    }
    this.entries.set(nonce, this.now());
  }

  assertFresh(nonce) {
    if (this.has(nonce)) return false;
    this.remember(nonce);
    return true;
  }

  prune() {
    const cutoff = this.now() - this.ttlMs;
    for (const [nonce, seenAt] of this.entries) {
      if (seenAt < cutoff) this.entries.delete(nonce);
    }
  }
}
