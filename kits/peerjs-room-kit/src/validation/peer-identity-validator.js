import { isObject, requireString, ValidationError } from '../../../../shared/utils/validation.js';

export function validatePeerIdentity(identity) {
  if (!isObject(identity)) throw new ValidationError('identity must be an object');
  const identityKey = requireString(identity.identityKey, 'identity.identityKey', { maxLength: 512 });
  if (!identityKey.startsWith('did:key:') && !identityKey.startsWith('local:') && !identityKey.startsWith('peer:')) {
    throw new ValidationError('identityKey must use did:key:, local:, or peer: prefix', { identityKey });
  }
  return {
    identityKey,
    displayName: typeof identity.displayName === 'string' ? identity.displayName : undefined,
    trust: identity.trust ?? 'self'
  };
}
