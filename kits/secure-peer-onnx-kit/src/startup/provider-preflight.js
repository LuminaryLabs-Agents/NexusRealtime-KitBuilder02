import { EXECUTION_PROVIDERS } from '../models/model-manifest.schema.js';

export function detectSupportedProviders({ hasWebGpu = typeof navigator !== 'undefined' && 'gpu' in navigator, hasWebGl = typeof WebGLRenderingContext !== 'undefined', hasWebNn = typeof navigator !== 'undefined' && 'ml' in navigator } = {}) {
  const supported = ['wasm'];
  if (hasWebGpu) supported.unshift('webgpu');
  if (hasWebGl) supported.push('webgl');
  if (hasWebNn) supported.push('webnn');
  return [...new Set(supported)].filter(provider => EXECUTION_PROVIDERS.includes(provider));
}

export function chooseProvider(manifest, { providerOrder = ['webgpu', 'webgl', 'wasm'], supportedProviders = detectSupportedProviders() } = {}) {
  const allowedByManifest = new Set([...(manifest.executionProviders ?? []), ...(manifest.fallbackExecutionProviders ?? [])]);
  return providerOrder.find(provider => supportedProviders.includes(provider) && allowedByManifest.has(provider)) ?? null;
}
