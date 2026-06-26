import { AppendLedger } from '../../../shared/append-ledger/append-ledger.js';
import { makeId } from '../../../shared/utils/ids.js';
import { validateRoomId } from '../../peerjs-room-kit/src/validation/room-id-validator.js';
import { validateRouteOffer } from './validation/route-validator.js';
import { RouteTable } from './route-table.js';
import { selectBestRouteSummary, FALLBACK_LADDER } from './routing-policy.js';
import { DirectLinkNegotiator } from './direct-link-negotiator.js';

export class HostLayer {
  constructor({ hostLayerId = 'hostlayer/root', parentRoom, childRooms = [], routeTable, transport = null, now = Date.now } = {}) {
    this.hostLayerId = hostLayerId;
    this.parentRoom = parentRoom;
    this.childRooms = childRooms.map(validateRoomId);
    this.now = now;
    this.routeTable = routeTable ?? new RouteTable({ now });
    this.ledger = new AppendLedger({ roomId: parentRoom?.roomId ?? 'room/root', now });
    this.negotiator = new DirectLinkNegotiator({ transport, ledger: this.ledger, fallbackLadder: FALLBACK_LADDER });
  }

  static create(options) {
    return new HostLayer(options);
  }

  upsertRouteSummary(summary) {
    return this.routeTable.upsertSummary(summary);
  }

  async findRoute(request = {}) {
    const summary = selectBestRouteSummary(this.routeTable.findCandidates(request), request);
    if (!summary) return null;
    const fromRoom = this.parentRoom?.roomId ?? 'room/root';
    const toRoom = summary.roomId;
    const route = {
      routeId: makeId('route'),
      fromRoom,
      toRoom,
      path: [fromRoom, toRoom].filter(Boolean),
      targetPeer: summary.bestPeer ?? summary.hostPeer ?? 'unknown',
      capabilityHash: summary.capabilityHash,
      connectionModes: FALLBACK_LADDER,
      expiresAt: this.now() + 15000
    };
    const validated = validateRouteOffer(route, { now: this.now });
    await this.ledger.append({ type: 'route.selected', subjectId: validated.routeId, payload: { request, route: validated } });
    return validated;
  }

  async openDirectLink({ fromPeer, toPeer, route }) {
    const validated = validateRouteOffer(route, { now: this.now });
    return this.negotiator.open({ fromPeer, toPeer, route: validated });
  }
}
