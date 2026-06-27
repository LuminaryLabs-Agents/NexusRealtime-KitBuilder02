export class LiveServerClient {
  constructor({ baseUrl = 'http://127.0.0.1:8787', fetchImpl = globalThis.fetch } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
  }

  async health() {
    return this.getJson('/health');
  }

  async snapshot(roomId = 'room/root') {
    return this.getJson(`/snapshot/${encodeURIComponent(roomId)}`);
  }

  async appendEvent(event) {
    return this.postJson('/events', event);
  }

  async heartbeat(lease) {
    return this.postJson('/presence', lease);
  }

  async upsertRouteSummary(summary) {
    return this.postJson('/route-summaries', summary);
  }

  async relay(packet) {
    return this.postJson('/relay', packet);
  }

  async drainRelay(targetIdentity) {
    return this.getJson(`/relay/${encodeURIComponent(targetIdentity)}`);
  }

  async getJson(path) {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  }

  async postJson(path, body) {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return res.json();
  }
}
