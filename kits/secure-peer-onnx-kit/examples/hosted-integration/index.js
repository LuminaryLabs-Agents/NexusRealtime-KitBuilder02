import { SecurePeerOnnxKit, FakeOnnxRuntime } from '../../src/index.js';

const engine = { services: {} };
engine.services.secureOnnx = await SecurePeerOnnxKit.join({
  identity: { identityKey: 'local:hosted-onnx' },
  runtime: new FakeOnnxRuntime({ supportedProviders: ['wasm'] }),
  modelManifests: [],
  startupModels: { count: 0 }
});

const job = await engine.services.secureOnnx.enqueue({
  modelId: 'embed-mini-v1',
  inputHash: 'sha256:input',
  timeoutMs: 10000,
  claimLeaseMs: 5000,
  maxRetries: 1
});
await engine.services.secureOnnx.claim(job.jobId, 'local:worker-1');
const result = await engine.services.secureOnnx.acceptResult({
  jobId: job.jobId,
  modelId: job.modelId,
  modelHash: 'sha256:model',
  inputHash: job.inputHash,
  outputHash: 'sha256:output',
  workerIdentity: 'local:worker-1',
  runtime: { executionProvider: 'wasm', latencyMs: 12 }
});

console.log(JSON.stringify(result, null, 2));
