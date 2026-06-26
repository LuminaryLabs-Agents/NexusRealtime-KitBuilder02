import { isObject, requireNumber, requireString, ValidationError } from '../../../../shared/utils/validation.js';

export function validateJobResult(result, { job, claim, seenOutputHashes = new Set() } = {}) {
  if (!isObject(result)) throw new ValidationError('job result must be an object');
  const jobId = requireString(result.jobId, 'result.jobId', { maxLength: 128 });
  if (job && job.jobId !== jobId) throw new ValidationError('result jobId mismatch', { expected: job.jobId, actual: jobId });
  const modelId = requireString(result.modelId, 'result.modelId', { maxLength: 128 });
  if (job && job.modelId !== modelId) throw new ValidationError('result modelId mismatch', { expected: job.modelId, actual: modelId });
  const modelHash = requireString(result.modelHash, 'result.modelHash', { maxLength: 128 });
  const inputHash = requireString(result.inputHash, 'result.inputHash', { maxLength: 128 });
  const outputHash = requireString(result.outputHash, 'result.outputHash', { maxLength: 128 });
  const workerIdentity = requireString(result.workerIdentity, 'result.workerIdentity', { maxLength: 512 });
  if (claim && claim.workerIdentity !== workerIdentity) throw new ValidationError('result worker does not own active claim', { expected: claim.workerIdentity, actual: workerIdentity });
  if (seenOutputHashes.has(outputHash)) throw new ValidationError('duplicate result outputHash', { outputHash });
  if (!isObject(result.runtime)) throw new ValidationError('result.runtime must be an object');
  requireString(result.runtime.executionProvider, 'result.runtime.executionProvider', { maxLength: 64 });
  requireNumber(result.runtime.latencyMs, 'result.runtime.latencyMs', { min: 0 });
  return { ...result, jobId, modelId, modelHash, inputHash, outputHash, workerIdentity };
}

export function validateVectorOutput(vector, { dims, epsilon = 1e-3 } = {}) {
  if (!Array.isArray(vector) && !(vector instanceof Float32Array)) throw new ValidationError('vector output must be an array or Float32Array');
  if (dims !== undefined && vector.length !== dims) throw new ValidationError('vector dimension mismatch', { expected: dims, actual: vector.length });
  for (const value of vector) {
    if (!Number.isFinite(value)) throw new ValidationError('vector output contains non-finite value');
    if (Math.abs(value) > 1 / epsilon) throw new ValidationError('vector output value exceeds tolerance guard');
  }
  return true;
}
