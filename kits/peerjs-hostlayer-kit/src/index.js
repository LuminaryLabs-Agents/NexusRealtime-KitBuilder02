export { HostLayer } from './host-layer.js';
export { RouteTable } from './route-table.js';
export { DirectLinkNegotiator } from './direct-link-negotiator.js';
export { validateRoutePath } from './validation/path-validator.js';
export { validateRouteOffer } from './validation/route-validator.js';
export { scoreRouteSummary, selectBestRouteSummary, FALLBACK_LADDER } from './routing-policy.js';
export { createRouteRepairPlan } from './route-repair.js';

import { HostLayer } from './host-layer.js';

export const PeerJsHostLayerKit = Object.freeze({
  create: options => HostLayer.create(options)
});
