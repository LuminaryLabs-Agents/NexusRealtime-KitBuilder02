import { computeRetryDelays, DEFAULT_RETRY_POLICY } from '../../../shared/utils/retry-policy.js';

export class PacketAckTracker {
  constructor({ retryPolicy = DEFAULT_RETRY_POLICY, now = Date.now } = {}) {
    this.retryPolicy = retryPolicy;
    this.now = now;
    this.pending = new Map();
  }

  track(packet) {
    const delays = computeRetryDelays(this.retryPolicy);
    const state = { packet, attempts: 0, delays, createdAt: this.now(), ack: null, nack: null };
    this.pending.set(packet.packetId, state);
    return state;
  }

  ack(packetId, ack) {
    const state = this.pending.get(packetId);
    if (state) {
      state.ack = ack;
      this.pending.delete(packetId);
    }
    return state;
  }

  nack(packetId, nack) {
    const state = this.pending.get(packetId);
    if (state) {
      state.nack = nack;
      this.pending.delete(packetId);
    }
    return state;
  }

  nextRetry(packetId) {
    const state = this.pending.get(packetId);
    if (!state) return null;
    if (state.attempts >= state.delays.length) {
      this.pending.delete(packetId);
      return { status: 'failed-closed', reason: 'ack_timeout', packet: state.packet };
    }
    const delayMs = state.delays[state.attempts];
    state.attempts += 1;
    return { status: 'retry', delayMs, attempt: state.attempts, packet: state.packet };
  }
}
