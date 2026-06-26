export const FALLBACK_LADDER = Object.freeze([
  'direct-webrtc',
  'direct-webrtc-reconnect',
  'same-host-bridge',
  'parent-host-bridge',
  'relay-fallback'
]);

export function scoreRouteSummary(summary, request = {}) {
  const queueDepth = summary.queueDepth ?? 999;
  const latency = summary.avgLatencyMs ?? 999;
  const warmBonus = request.modelId && (summary.warmModels ?? []).includes(request.modelId) ? 500 : 0;
  const trustBonus = (summary.trustedPeers ?? 0) * 25;
  return warmBonus + trustBonus - queueDepth * 20 - latency;
}

export function selectBestRouteSummary(summaries, request = {}) {
  return [...summaries].sort((a, b) => scoreRouteSummary(b, request) - scoreRouteSummary(a, request))[0] ?? null;
}
