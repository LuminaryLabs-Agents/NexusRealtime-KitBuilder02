import { loadStartupModels, FakeOnnxRuntime } from '../../src/index.js';

const manifests = [
  { modelId: 'embed-mini-v1', version: '1', url: '/models/a.onnx', sha256: 'sha256:a', sizeBytes: 1000, estimatedMemoryMb: 2, priority: 100, executionProviders: ['wasm'], testVectors: [{ name: 'smoke' }] },
  { modelId: 'classifier-small-v1', version: '1', url: '/models/b.onnx', sha256: 'sha256:b', sizeBytes: 500, estimatedMemoryMb: 1, priority: 50, executionProviders: ['wasm'], testVectors: [{ name: 'smoke' }] }
];

const state = await loadStartupModels({
  manifests,
  startupModels: { count: 2, mode: 'up-to', strategy: 'priority', requireTestVector: true },
  runtime: new FakeOnnxRuntime({ supportedProviders: ['wasm'], failModels: new Set(['embed-mini-v1']) })
});

console.log(JSON.stringify(state, null, 2));
