export function completed(value, traceId) {
  return { ok: true, status: 'completed', value, traceId };
}

export function degraded({ fallbackUsed, value, traceId, reason }) {
  return { ok: false, status: 'degraded', fallbackUsed, value, traceId, reason };
}

export function failedClosed(reason, traceId, details = {}) {
  return { ok: false, status: 'failed-closed', reason, traceId, details };
}
