import { requireArray, ValidationError } from '../../../../shared/utils/validation.js';
import { validateRoomId } from '../../../peerjs-room-kit/src/validation/room-id-validator.js';

export function validateRoutePath(path, { maxHopCount = 8 } = {}) {
  const rooms = requireArray(path, 'route.path', { minLength: 1, maxLength: maxHopCount }).map(validateRoomId);
  const unique = new Set(rooms);
  if (unique.size !== rooms.length) throw new ValidationError('route path contains a cycle', { path: rooms });
  return rooms;
}
