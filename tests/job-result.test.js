import test from 'node:test';
import assert from 'node:assert/strict';
import { SecurePeerOnnxKit, FakeOnnxRuntime } from '../kits/secure-peer-onnx-kit/src/index.js';

await test('mesh validates active claim before accepting result', async () => {
  const mesh = await SecurePeerOnnxKit.join({
    identity: { identityKey: 'local:worker' },
    runtime: new FakeOnnxRuntime({ supportedProviders: ['wasm'] }),
    modelManifests: [],
    startupModels: { count: 0 }
  });
  const job = await mesh.enqueue({ jobId: 'job-a', modelId: 'embed-mini-v1', inputRef: 'blob:sha256:input' });
  await mesh.claim(job.jobId, 'local:worker');
  const accepted = await mesh.acceptResult({
    jobId: job.jobId,
    modelId: 'embed-mini-v1',
    modelHash: 'sha256:model',
    inputHash: 'sha256:input',
    outputHash: 'sha256:output',
    workerIdentity: 'local:worker',
    runtime: { executionProvider: 'wasm', latencyMs: 10 }
  });
  assert.equal(accepted.ok, true);
});

await test('mesh rejects result from non-claiming worker', async () => {
  const mesh = await SecurePeerOnnxKit.join({ identity: { identityKey: 'local:worker' }, modelManifests: [], startupModels: { count: 0 } });
  const job = await mesh.enqueue({ jobId: 'job-b', modelId: 'embed-mini-v1', inputRef: 'blob:sha256:input' });
  await mesh.claim(job.jobId, 'local:worker');
  const rejected = await mesh.acceptResult({
    jobId: job.jobId,
    modelId: 'embed-mini-v1',
    modelHash: 'sha256:model',
    inputHash: 'sha256:input',
    outputHash: 'sha256:output-b',
    workerIdentity: 'local:attacker',
    runtime: { executionProvider: 'wasm', latencyMs: 10 }
  });
  assert.equal(rejected.ok, false);
  assert.match(rejected.reason, /active claim/);
});
