import { isObject, requireNumber, requireString, ValidationError } from '../../../../shared/utils/validation.js';

export function validateJobRequest(job) {
  if (!isObject(job)) throw new ValidationError('job request must be an object');
  const jobId = requireString(job.jobId, 'job.jobId', { maxLength: 128 });
  const modelId = requireString(job.modelId, 'job.modelId', { maxLength: 128 });
  const inputRef = requireString(job.inputRef ?? 'inline', 'job.inputRef', { maxLength: 256 });
  const timeoutMs = requireNumber(job.timeoutMs ?? 10000, 'job.timeoutMs', { integer: true, min: 100, max: 300000 });
  const claimLeaseMs = requireNumber(job.claimLeaseMs ?? 5000, 'job.claimLeaseMs', { integer: true, min: 100, max: timeoutMs });
  const maxRetries = requireNumber(job.maxRetries ?? 3, 'job.maxRetries', { integer: true, min: 0, max: 20 });
  const redundancy = requireNumber(job.redundancy ?? 1, 'job.redundancy', { integer: true, min: 1, max: 5 });
  return { ...job, jobId, modelId, inputRef, timeoutMs, claimLeaseMs, maxRetries, redundancy, status: job.status ?? 'created' };
}
