import { makeId } from '../../../../shared/utils/ids.js';
import { validateJobRequest } from '../validation/job-request-validator.js';

export class JobQueue {
  constructor({ now = Date.now, ledger = null } = {}) {
    this.now = now;
    this.ledger = ledger;
    this.jobs = new Map();
    this.claims = new Map();
  }

  async enqueue(job) {
    const validated = validateJobRequest({ jobId: job.jobId ?? makeId('job'), ...job });
    validated.createdAt = this.now();
    validated.expiresAt = validated.createdAt + validated.timeoutMs;
    validated.attempts = validated.attempts ?? 0;
    this.jobs.set(validated.jobId, validated);
    await this.ledger?.append?.({ type: 'job.requested', subjectId: validated.jobId, payload: validated });
    return validated;
  }

  async claim(jobId, workerIdentity) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('job not found');
    if (job.expiresAt < this.now()) throw new Error('job expired');
    const claim = { jobId, workerIdentity, claimedAt: this.now(), expiresAt: this.now() + job.claimLeaseMs };
    const existing = this.claims.get(jobId);
    if (existing && existing.expiresAt >= this.now()) return { accepted: existing, rejected: claim, reason: 'active_claim_exists' };
    this.claims.set(jobId, claim);
    job.status = 'claimed';
    await this.ledger?.append?.({ type: 'job.claimed', subjectId: jobId, payload: claim });
    return { accepted: claim, rejected: null };
  }

  reapExpiredClaims() {
    const requeued = [];
    for (const [jobId, claim] of this.claims) {
      if (claim.expiresAt < this.now()) {
        this.claims.delete(jobId);
        const job = this.jobs.get(jobId);
        if (job && job.attempts < job.maxRetries) {
          job.status = 'requeued';
          job.attempts += 1;
          requeued.push(job);
        } else if (job) {
          job.status = 'failed';
        }
      }
    }
    return requeued;
  }

  complete(jobId, result) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('job not found');
    job.status = 'completed';
    job.result = result;
    this.claims.delete(jobId);
    return job;
  }
}
