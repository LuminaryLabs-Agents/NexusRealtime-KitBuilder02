import { makeId } from '../../../shared/utils/ids.js';
import { completed, degraded, failedClosed } from '../../../shared/utils/outcome.js';
import { FALLBACK_LADDER } from './routing-policy.js';

export class DirectLinkNegotiator {
  constructor({ transport = null, ledger = null, fallbackLadder = FALLBACK_LADDER } = {}) {
    this.transport = transport;
    this.ledger = ledger;
    this.fallbackLadder = fallbackLadder;
  }

  async open({ fromPeer, toPeer, route, timeoutMs = 10000 } = {}) {
    const traceId = makeId('route');
    for (const mode of this.fallbackLadder) {
      try {
        const link = await this.tryMode(mode, { fromPeer, toPeer, route, timeoutMs, traceId });
        await this.ledger?.append?.({ type: 'direct-link.opened', subjectId: traceId, payload: { mode, routeId: route?.routeId, fromPeer, toPeer } });
        return mode === 'direct-webrtc' ? completed(link, traceId) : degraded({ fallbackUsed: mode, value: link, traceId });
      } catch (error) {
        await this.ledger?.append?.({ type: 'route.mode.failed', subjectId: traceId, payload: { mode, reason: error.message } });
      }
    }
    await this.ledger?.append?.({ type: 'route.failed', subjectId: traceId, payload: { routeId: route?.routeId, fromPeer, toPeer } });
    return failedClosed('route.unreachable', traceId);
  }

  async tryMode(mode, context) {
    if (this.transport?.connectMode) return this.transport.connectMode(mode, context);
    if (mode === 'relay-fallback') return { mode, relay: true, route: context.route };
    throw new Error(`${mode} unavailable`);
  }
}
