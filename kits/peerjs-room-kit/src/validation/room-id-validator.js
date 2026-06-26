import { requireString, ValidationError } from '../../../../shared/utils/validation.js';

export const ROOM_ID_PATTERN = /^room\/[a-z0-9][a-z0-9-_]*(\/[a-z0-9][a-z0-9-_]*){0,8}$/;

export function normalizeRoomId(roomId) {
  return requireString(roomId, 'roomId', { maxLength: 192 }).trim().toLowerCase().replace(/\/+$/g, '');
}

export function validateRoomId(roomId) {
  const normalized = normalizeRoomId(roomId);
  if (!ROOM_ID_PATTERN.test(normalized)) {
    throw new ValidationError('invalid roomId', {
      roomId,
      normalized,
      pattern: String(ROOM_ID_PATTERN)
    });
  }
  if (normalized.includes('..') || normalized.includes('?') || normalized.includes('#')) {
    throw new ValidationError('roomId contains forbidden path/control characters', { roomId });
  }
  return normalized;
}
