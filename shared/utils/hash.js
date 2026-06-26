import { canonicalJson } from './canonical-json.js';

function bytesToHex(bytes) {
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function toBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (typeof value === 'string') return new TextEncoder().encode(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return new TextEncoder().encode(canonicalJson(value));
}

export async function sha256Hex(value) {
  const bytes = toBytes(value);
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return bytesToHex(new Uint8Array(digest));
  }
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(bytes).digest('hex');
}

export async function sha256Ref(value) {
  return `sha256:${await sha256Hex(value)}`;
}

export function stripSha256Prefix(hash) {
  return typeof hash === 'string' && hash.startsWith('sha256:') ? hash.slice(7) : hash;
}
