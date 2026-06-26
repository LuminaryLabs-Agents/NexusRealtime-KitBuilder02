import { AppendLedger } from '../../../shared/append-ledger/append-ledger.js';
import { completed, failedClosed } from '../../../shared/utils/outcome.js';
import { makeId } from '../../../shared/utils/ids.js';
import { loadStartupModels } from './startup/startup-model-loader.js';
import { JobQueue } from './queue/job-queue.js';
import { validateJobResult } from './validation/result-validator.js';

export class SecurePeerOnnxMesh {
  constructor({ roomFabric = null, identity, ledger = null, runtime = {}, now = Date.now } = {}) {
    this.roomFabric = roomFabric;
    this.identity = identity ?? { identityKey: `local:${makeId('onnx')}` };
    this.now = now;
    this.ledger = ledger ?? new AppendLedger({ roomId: 'room/secure-peer-onnx', now });
    this.runtime = runtime;
    this.queue = new JobQueue({ now, ledger: this.ledger });
    this.modelState = { requested: 0, selected: [], warm: [], failed: [], skipped: [] };
    this.seenOutputHashes = new Set();
  }

  static async join(options = {}) {
    const mesh = new SecurePeerOnnxMesh(options);
    mesh.modelState = await loadStartupModels({
      manifests: options.modelManifests ?? options.models ?? [],
      startupModels: options.startupModels ?? { count: 0 },
      runtime: options.runtime ?? {},
      cache: options.cache,
      ledger: mesh.ledger
    });
    return mesh;
  }

  async enqueue(job) {
    return this.queue.enqueue(job);
  }

  async claim(jobId, workerIdentity = this.identity.identityKey) {
    return this.queue.claim(jobId, workerIdentity);
  }

  async acceptResult(result) {
    const job = this.queue.jobs.get(result.jobId);
    const claim = this.queue.claims.get(result.jobId);
    try {
      const validated = validateJobResult(result, { job, claim, seenOutputHashes: this.seenOutputHashes });
      this.seenOutputHashes.add(validated.outputHash);
      this.queue.complete(validated.jobId, validated);
      await this.ledger.append({ type: 'job.verified', subjectId: validated.jobId, payload: validated });
      return completed(validated, makeId('result'));
    } catch (error) {
      await this.ledger.append({ type: 'job.result.rejected', subjectId: result?.jobId ?? makeId('job'), payload: { reason: error.message } });
      return failedClosed(error.message, makeId('result'));
    }
  }

  getHealth() {
    return {
      peerId: this.identity.transportId,
      identity: this.identity.identityKey,
      rooms: ['room/secure-peer-onnx'],
      loadedModels: this.modelState.warm.map(entry => entry.modelId),
      warmModels: this.modelState.warm.map(entry => entry.modelId),
      capacity: {
        maxJobs: 1,
        activeJobs: [...this.queue.jobs.values()].filter(job => job.status === 'claimed').length,
        queueDepth: [...this.queue.jobs.values()].filter(job => ['created', 'requeued'].includes(job.status)).length
      },
      ledger: { headCount: this.ledger.getHeads().length, conflicts: this.ledger.conflicts.length }
    };
  }
}
