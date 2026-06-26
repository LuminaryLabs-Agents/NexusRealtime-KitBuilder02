import { resolveHostConflict } from '../host-election.js';

export async function repairHostElectionConflict({ localElection, remoteElection, ledger }) {
  const accepted = resolveHostConflict(localElection, remoteElection);
  const rejected = accepted === localElection ? remoteElection : localElection;
  const event = await ledger?.append?.({
    type: 'host.conflict.resolved',
    subjectId: `host-election:${accepted.term}`,
    term: accepted.term,
    payload: { accepted, rejected, reason: 'deterministic-term-primary-tiebreak' }
  });
  return { accepted, rejected, event };
}
