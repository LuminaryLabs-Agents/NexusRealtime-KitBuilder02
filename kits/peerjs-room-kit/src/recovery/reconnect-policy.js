import { computeRetryDelays, DEFAULT_RETRY_POLICY } from '../../../shared/utils/retry-policy.js';

export function createReconnectPlan(policy = DEFAULT_RETRY_POLICY) {
  return computeRetryDelays(policy).map((delayMs, index) => ({ attempt: index + 1, delayMs }));
}
