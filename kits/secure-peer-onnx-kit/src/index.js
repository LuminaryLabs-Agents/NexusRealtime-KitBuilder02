export { SecurePeerOnnxMesh } from './mesh.js';
export { loadStartupModels, loadOneModelWithFallback } from './startup/startup-model-loader.js';
export { selectStartupModels, normalizeStartupModelsConfig } from './startup/startup-model-selector.js';
export { chooseProvider, detectSupportedProviders } from './startup/provider-preflight.js';
export { validateModelManifest, validateModelManifests } from './validation/model-manifest-validator.js';
export { validateJobRequest } from './validation/job-request-validator.js';
export { validateJobResult, validateVectorOutput } from './validation/result-validator.js';
export { JobQueue } from './queue/job-queue.js';
export { FakeOnnxRuntime } from './runtime/fake-onnx-runtime.js';

import { SecurePeerOnnxMesh } from './mesh.js';

export const SecurePeerOnnxKit = Object.freeze({
  join: options => SecurePeerOnnxMesh.join(options)
});
