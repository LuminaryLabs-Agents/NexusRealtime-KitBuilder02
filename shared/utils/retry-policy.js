export const DEFAULT_RETRY_POLICY = Object.freeze({
  delaysMs: [250, 500, 1000, 2000],
  jitterRatio: 0.25
});

export function computeRetryDelays(policy = DEFAULT_RETRY_POLICY, random = Math.random) {
  return policy.delaysMs.map(delay => delay + Math.floor(random() * delay * (policy.jitterRatio ?? 0)));
}

export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function withTimeout(promise, timeoutMs, reason = 'timeout') {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(reason)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}
