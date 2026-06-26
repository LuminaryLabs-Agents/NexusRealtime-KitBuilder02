import { isObject, requireNumber, requireString, ValidationError } from '../../../../shared/utils/validation.js';
import { validateRoomId } from '../../../peerjs-room-kit/src/validation/room-id-validator.js';
import { validateRoutePath } from './path-validator.js';

export function validateRouteOffer(route, { now = Date.now, maxHopCount = 8 } = {}) {
  if (!isObject(route)) throw new ValidationError('route must be an object');
  const routeId = requireString(route.routeId, 'route.routeId', { maxLength: 128 });
  const fromRoom = validateRoomId(route.fromRoom);
  const toRoom = validateRoomId(route.toRoom);
  const path = validateRoutePath(route.path, { maxHopCount });
  if (path[0] !== fromRoom) throw new ValidationError('route path does not start at fromRoom', { path, fromRoom });
  if (path.at(-1) !== toRoom) throw new ValidationError('route path does not end at toRoom', { path, toRoom });
  const targetPeer = requireString(route.targetPeer, 'route.targetPeer', { maxLength: 512 });
  const expiresAt = requireNumber(route.expiresAt, 'route.expiresAt', { integer: true, min: 0 });
  if (expiresAt < now()) throw new ValidationError('route offer expired', { expiresAt });
  return { ...route, routeId, fromRoom, toRoom, path, targetPeer, expiresAt };
}
