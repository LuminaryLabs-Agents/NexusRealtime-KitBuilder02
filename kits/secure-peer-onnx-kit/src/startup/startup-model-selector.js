import { DEFAULT_STARTUP_MODELS } from '../models/model-manifest.schema.js';
import { ValidationError } from '../../../../shared/utils/validation.js';

export function normalizeStartupModelsConfig(config = {}) {
  const normalized = { ...DEFAULT_STARTUP_MODELS, ...config };
  if (!Number.isInteger(normalized.count) || normalized.count < 0) throw new ValidationError('startupModels.count must be a non-negative integer');
  if (!['exact', 'up-to'].includes(normalized.mode)) throw new ValidationError('startupModels.mode must be exact or up-to');
  if (!['priority', 'smallest', 'fit-memory', 'explicit'].includes(normalized.strategy)) throw new ValidationError('startupModels.strategy is invalid');
  if (normalized.strategy === 'explicit' && normalized.mode === 'exact' && normalized.explicitModelIds.length !== normalized.count) {
    throw new ValidationError('explicit exact startup requires explicitModelIds.length === count');
  }
  return normalized;
}

export function selectStartupModels(manifests, startupModels = {}) {
  const config = normalizeStartupModelsConfig(startupModels);
  if (config.count === 0) return [];
  let candidates = [...manifests];
  if (config.strategy === 'explicit') {
    const wanted = new Set(config.explicitModelIds);
    candidates = candidates.filter(manifest => wanted.has(manifest.modelId));
  } else if (config.strategy === 'smallest') {
    candidates.sort((a, b) => a.sizeBytes - b.sizeBytes || b.priority - a.priority);
  } else if (config.strategy === 'fit-memory') {
    candidates.sort((a, b) => (b.priority / Math.max(1, b.estimatedMemoryMb)) - (a.priority / Math.max(1, a.estimatedMemoryMb)));
  } else {
    candidates.sort((a, b) => b.priority - a.priority || a.sizeBytes - b.sizeBytes);
  }
  const selected = [];
  let usedMemory = 0;
  for (const manifest of candidates) {
    if (selected.length >= config.count) break;
    if (config.strategy === 'fit-memory' && usedMemory + manifest.estimatedMemoryMb > config.memoryBudgetMb) continue;
    selected.push(manifest);
    usedMemory += manifest.estimatedMemoryMb;
  }
  if (config.mode === 'exact' && selected.length !== config.count) {
    throw new ValidationError('not enough models selected for exact startup', { requested: config.count, selected: selected.length });
  }
  return selected;
}
