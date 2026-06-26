export { PeerRoom } from './room.js';
export { PresenceTable } from './presence-table.js';
export { PacketAckTracker } from './packet-ack-tracker.js';
export { electHosts, resolveHostConflict, scoreHostCandidate } from './host-election.js';
export { validateRoomId, normalizeRoomId } from './validation/room-id-validator.js';
export { validatePeerIdentity } from './validation/peer-identity-validator.js';
export { validatePresenceLease } from './validation/presence-lease-validator.js';
export { validatePacketEnvelope } from './validation/packet-envelope-validator.js';

import { PeerRoom } from './room.js';

export const PeerJsRoomKit = Object.freeze({
  join: options => PeerRoom.join(options)
});
