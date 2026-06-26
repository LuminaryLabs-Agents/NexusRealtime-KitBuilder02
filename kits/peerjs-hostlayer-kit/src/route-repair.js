export function createRouteRepairPlan({ routeId, jobId, failedMode, reason }) {
  const ladder = ['direct-webrtc-reconnect', 'same-host-bridge', 'parent-host-bridge', 'relay-fallback'];
  return {
    type: 'route.failed',
    routeId,
    jobId,
    failedMode,
    reason,
    nextModes: ladder.slice(ladder.indexOf(failedMode) + 1).length ? ladder.slice(ladder.indexOf(failedMode) + 1) : ladder
  };
}
