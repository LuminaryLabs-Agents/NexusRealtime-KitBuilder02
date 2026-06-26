import test from 'node:test';
import assert from 'node:assert/strict';
import { loadStartupModels, FakeOnnxRuntime } from '../kits/secure-peer-onnx-kit/src/index.js';

const manifests = [
  { modelId: 'embed-mini-v1', version: '1', url: '/models/a.onnx', sha256: 'sha256:a', sizeBytes: 1000, estimatedMemoryMb: 2, priority: 100, executionProviders: ['wasm'], testVectors: [{ name: 'smoke' }] },
  { modelId: 'classifier-small-v1', version: '1', url: '/models/b.onnx', sha256: 'sha256:b', sizeBytes: 500, estimatedMemoryMb: 1, priority: 50, executionProviders: ['wasm'], testVectors: [{ name: 'smoke' }] }
];

await test('startup loader warms requested count', async () => {
  const result = await loadStartupModels({
    manifests,
    startupModels: { count: 1, mode: 'exact', strategy: 'priority', requireTestVector: true },
    runtime: new FakeOnnxRuntime({ supportedProviders: ['wasm'] })
  });
  assert.equal(result.requested, 1);
  assert.deepEqual(result.warm.map(model => model.modelId), ['embed-mini-v1']);
  assert.equal(result.skipped.length, 1);
});

await test('exact startup fails closed when selected model cannot load', async () => {
  await assert.rejects(() => loadStartupModels({
    manifests,
    startupModels: { count: 1, mode: 'exact', strategy: 'priority', requireTestVector: true },
    runtime: new FakeOnnxRuntime({ supportedProviders: ['wasm'], failModels: new Set(['embed-mini-v1']) })
  }), /startup model failed/);
});

await test('up-to startup degrades without failing whole mesh', async () => {
  const result = await loadStartupModels({
    manifests,
    startupModels: { count: 2, mode: 'up-to', strategy: 'priority', requireTestVector: true },
    runtime: new FakeOnnxRuntime({ supportedProviders: ['wasm'], failModels: new Set(['embed-mini-v1']) })
  });
  assert.equal(result.failed.length, 1);
  assert.equal(result.warm.length, 1);
});
