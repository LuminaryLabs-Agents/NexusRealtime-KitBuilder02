export const EXECUTION_PROVIDERS = Object.freeze(['webgpu', 'webgl', 'webnn', 'wasm']);
export const MODEL_ID_PATTERN = /^[a-z0-9][a-z0-9-_]*(\/[a-z0-9][a-z0-9-_]*){0,4}$/;

export const DEFAULT_STARTUP_MODELS = Object.freeze({
  count: 1,
  mode: 'up-to',
  strategy: 'priority',
  explicitModelIds: [],
  requireTestVector: true,
  fallbackProviderOrder: ['webgpu', 'webgl', 'wasm'],
  memoryBudgetMb: 768,
  unloadPolicy: 'lru',
  advertiseOnlyWarmModels: true
});
