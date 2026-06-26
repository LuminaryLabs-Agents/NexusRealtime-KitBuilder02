export function resolveDuplicatePeerIdentity(existing, incoming) {
  if (!existing) return { accepted: incoming, rejected: null };
  if ((incoming.seq ?? 0) > (existing.seq ?? 0)) return { accepted: incoming, rejected: existing };
  if ((incoming.signedAt ?? 0) > (existing.signedAt ?? 0)) return { accepted: incoming, rejected: existing };
  return { accepted: existing, rejected: incoming };
}
