export function scoreHostCandidate(candidate) {
  const trust = { self: 400, verified: 300, invited: 150, public: 10 }[candidate.trust ?? 'public'] ?? 0;
  const uptime = Math.min(candidate.uptimeMs ?? 0, 3600000) / 10000;
  const latency = Math.max(0, 200 - (candidate.latencyMs ?? 200));
  const battery = candidate.batteryCharging === false ? -25 : 25;
  const capacity = (candidate.maxJobs ?? 1) * 10;
  const stable = candidate.visibilityState === 'hidden' ? -30 : 30;
  return trust + uptime + latency + battery + capacity + stable;
}

export function electHosts(candidates, { term = 0 } = {}) {
  const ranked = [...candidates].sort((a, b) => {
    const delta = scoreHostCandidate(b) - scoreHostCandidate(a);
    if (delta !== 0) return delta;
    return String(a.identityKey).localeCompare(String(b.identityKey));
  });
  return {
    term,
    primary: ranked[0]?.identityKey ?? null,
    backup: ranked[1]?.identityKey ?? null,
    observer: ranked[2]?.identityKey ?? null,
    ranked
  };
}

export function resolveHostConflict(a, b) {
  if (a.term !== b.term) return a.term > b.term ? a : b;
  return String(a.primary).localeCompare(String(b.primary)) <= 0 ? a : b;
}
