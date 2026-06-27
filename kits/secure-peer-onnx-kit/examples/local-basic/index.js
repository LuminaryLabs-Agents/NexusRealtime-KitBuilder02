import { SecurePeerOnnxKit, FakeOnnxRuntime } from '../../src/index.js';

const mesh = await SecurePeerOnnxKit.join({
  identity: { identityKey: 'local:onnx-local' },
  runtime: new FakeOnnxRuntime({ supportedProviders: ['wasm'] }),
  modelManifests: [{
    modelId: 'embed-mini-v1',
    version: '0.1.0',
    url: '/models/embed-mini-v1.onnx',
    sha256: 'sha256:demo',
    sizeBytes: 1024,
    priority: 100,
    executionProviders: ['wasm'],
    testVectors: [{ name: 'smoke' }]
  }],
  startupModels: { count: 1, mode: 'exact', strategy: 'priority', requireTestVector: true }
});

console.log(JSON.stringify(mesh.getHealth(), null, 2));
