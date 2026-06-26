import { isObject, requireArray, requireNumber, requireString, ValidationError } from '../../../../shared/utils/validation.js';
import { EXECUTION_PROVIDERS, MODEL_ID_PATTERN } from '../models/model-manifest.schema.js';

export function validateModelManifest(manifest, { memoryBudgetMb = Infinity } = {}) {
  if (!isObject(manifest)) throw new ValidationError('model manifest must be an object');
  const modelId = requireString(manifest.modelId, 'manifest.modelId', { maxLength: 128 }).toLowerCase();
  if (!MODEL_ID_PATTERN.test(modelId)) throw new ValidationError('invalid modelId', { modelId });
  const version = requireString(manifest.version ?? '0.0.0', 'manifest.version', { maxLength: 64 });
  const url = requireString(manifest.url, 'manifest.url', { maxLength: 1024 });
  if (url.includes('..')) throw new ValidationError('manifest url may not include path traversal', { url });
  const sha256 = requireString(manifest.sha256, 'manifest.sha256', { maxLength: 128 });
  if (!sha256.startsWith('sha256:')) throw new ValidationError('manifest sha256 must use sha256: prefix', { sha256 });
  const sizeBytes = requireNumber(manifest.sizeBytes ?? 0, 'manifest.sizeBytes', { min: 0 });
  const estimatedMemoryMb = manifest.estimatedMemoryMb ?? Math.ceil(sizeBytes / 1024 / 1024) * 2;
  if (estimatedMemoryMb > memoryBudgetMb) throw new ValidationError('model exceeds memory budget', { modelId, estimatedMemoryMb, memoryBudgetMb });
  const executionProviders = requireArray(manifest.executionProviders ?? ['wasm'], 'manifest.executionProviders', { minLength: 1 });
  for (const provider of executionProviders) {
    if (!EXECUTION_PROVIDERS.includes(provider)) throw new ValidationError('unsupported execution provider in manifest', { provider });
  }
  return {
    ...manifest,
    modelId,
    version,
    url,
    sha256,
    sizeBytes,
    estimatedMemoryMb,
    priority: manifest.priority ?? 0,
    families: manifest.families ?? [],
    executionProviders,
    fallbackExecutionProviders: manifest.fallbackExecutionProviders ?? ['wasm'],
    inputSchema: manifest.inputSchema ?? { kind: 'json' },
    outputSchema: manifest.outputSchema ?? { kind: 'json' },
    testVectors: manifest.testVectors ?? []
  };
}

export function validateModelManifests(manifests, options = {}) {
  return requireArray(manifests, 'modelManifests').map(manifest => validateModelManifest(manifest, options));
}
