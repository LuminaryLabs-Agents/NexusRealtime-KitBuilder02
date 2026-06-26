import { canonicalJson } from '../utils/canonical-json.js';
import { sha256Ref } from '../utils/hash.js';
import { makeId, nowMs } from '../utils/ids.js';

export class AppendLedger {
  constructor({ roomId = 'room/root', now = nowMs } = {}) {
    this.roomId = roomId;
    this.now = now;
    this.events = new Map();
    this.subjectIndex = new Map();
    this.rejectedEvents = new Map();
    this.conflicts = [];
  }

  async append({ type, subjectId = makeId('subject'), payload = {}, term = 0, prev = [], signedBy = 'local', signedAt = this.now() }) {
    const body = {
      roomId: this.roomId,
      type,
      subjectId,
      term,
      seq: this.events.size + 1,
      prev,
      payload,
      signedBy,
      signedAt
    };
    const eventId = await sha256Ref(body);
    const event = { eventId, ...body, payloadCanonical: canonicalJson(payload) };
    const conflict = this.#findConflict(event);
    if (conflict) return this.#resolveConflict(event, conflict);
    this.events.set(eventId, event);
    this.#indexSubject(event);
    return event;
  }

  #phaseOf(type) {
    const parts = type.split('.');
    return parts.at(-1) ?? type;
  }

  #findConflict(event) {
    const existing = this.subjectIndex.get(event.subjectId) ?? [];
    return existing.find(candidate => this.#phaseOf(candidate.type) === this.#phaseOf(event.type));
  }

  #indexSubject(event) {
    const list = this.subjectIndex.get(event.subjectId) ?? [];
    list.push(event);
    this.subjectIndex.set(event.subjectId, list);
  }

  async #resolveConflict(incoming, existing) {
    const accepted = chooseLedgerWinner(existing, incoming);
    const rejected = accepted.eventId === existing.eventId ? incoming : existing;
    this.rejectedEvents.set(rejected.eventId, rejected);
    if (accepted.eventId === incoming.eventId) {
      this.events.delete(existing.eventId);
      this.events.set(incoming.eventId, incoming);
      const indexed = (this.subjectIndex.get(incoming.subjectId) ?? []).filter(event => event.eventId !== existing.eventId);
      indexed.push(incoming);
      this.subjectIndex.set(incoming.subjectId, indexed);
    }
    const resolution = {
      type: 'ledger.conflict.resolved',
      subjectId: incoming.subjectId,
      acceptedEvent: accepted.eventId,
      rejectedEvents: [rejected.eventId],
      reason: 'same-subject-same-phase'
    };
    this.conflicts.push(resolution);
    return { ...accepted, conflictResolution: resolution };
  }

  getHeads() {
    const referenced = new Set([...this.events.values()].flatMap(event => event.prev ?? []));
    return [...this.events.keys()].filter(eventId => !referenced.has(eventId));
  }

  replay() {
    return [...this.events.values()].sort((a, b) => a.seq - b.seq || a.eventId.localeCompare(b.eventId));
  }

  snapshot() {
    return {
      roomId: this.roomId,
      heads: this.getHeads(),
      events: this.replay(),
      rejectedEvents: [...this.rejectedEvents.values()],
      conflicts: this.conflicts
    };
  }
}

export function chooseLedgerWinner(a, b) {
  if (a.term !== b.term) return a.term > b.term ? a : b;
  if (a.signedAt !== b.signedAt) return a.signedAt < b.signedAt ? a : b;
  return a.eventId < b.eventId ? a : b;
}
