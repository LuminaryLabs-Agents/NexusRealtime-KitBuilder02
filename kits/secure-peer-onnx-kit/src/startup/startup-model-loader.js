import { validateModelManifests } from '../validation/model-manifest-validator.js';
import { normalizeStartupModelsConfig, selectStartupModels } from './startup-model-selector.js';
import { chooseProvider } from './provider-preflight.js';
import { runTestVectors } from './test-vector-runner.js';

export async function loadOneModelWithFallback({ manifest, runtime, cache, ledger, startupConfig }) {
  const providerOrder = startupConfig.fallbackProviderOrder;
  const provider = chooseProvider(manifest, { providerOrder, supportedProviders: runtime?.supportedProviders });
  if (!provider) {
    const result = { status: 'failed', modelId: manifest.modelId, reason: 'provider_unsupported' };
    await ledger?.append?.({ type: 'model.load.failed', subjectId: manifest.modelId, payload: result });
    return result;
  }
  await ledger?.append?.({ type: 'model.load.started', subjectId: manifest.modelId, payload: { provider } });
  try {
    const session = runtime?.createSession
      ? await runtime.createSession(manifest, { provider, cache })
      : { provider, manifest, runTestVector: async () => ({ ok: true }) };
    const test = await runTestVectors({ manifest, session, requireTestVector: startupConfig.requireTestVector });
    if (!test.ok) throw new Error(test.reason);
    const warm = { status: 'warm', modelId: manifest.modelId, provider, modelHash: manifest.sha256, session };
    await ledger?.append?.({ type: 'model.warm', subjectId: manifest.modelId, payload: { provider, modelHash: manifest.sha256 } });
    return warm;
  } catch (error) {
    const result = { status: 'failed', modelId: manifest.modelId, provider, reason: error.message };
    await ledger?.append?.({ type: 'model.load.failed', subjectId: manifest.modelId, payload: result });
    return result;
  }
}

export async function loadStartupModels({ manifests, startupModels = {}, runtime = {}, cache = null, ledger = null } = {}) {
  const startupConfig = normalizeStartupModelsConfig(startupModels);
  const valid = validateModelManifests(manifests ?? [], { memoryBudgetMb: startupConfig.memoryBudgetMb });
  const selected = selectStartupModels(valid, startupConfig);
  const results = [];
  for (const manifest of selected) {
    const result = await loadOneModelWithFallback({ manifest, runtime, cache, ledger, startupConfig });
    results.push(result);
    const warmCount = results.filter(entry => entry.status === 'warm').length;
    if (startupConfig.mode === 'exact' && result.status !== 'warm') {
      const error = new Error(`startup model failed: ${manifest.modelId}`);
      error.code = 'model.startup.insufficient';
      error.results = results;
      throw error;
    }
    if (startupConfig.mode === 'exact' && warmCount === startupConfig.count) break;
  }
  if (startupConfig.mode === 'exact' && results.filter(entry => entry.status === 'warm').length !== startupConfig.count) {
    const error = new Error('startup model count insufficient');
    error.code = 'model.startup.insufficient';
    error.results = results;
    throw error;
  }
  return {
    requested: startupConfig.count,
    selected: selected.map(model => model.modelId),
    warm: results.filter(entry => entry.status === 'warm'),
    failed: results.filter(entry => entry.status === 'failed'),
    skipped: valid.filter(model => !selected.includes(model)).map(model => ({ status: 'skipped', modelId: model.modelId, reason: 'startup_count_reached' }))
  };
}
