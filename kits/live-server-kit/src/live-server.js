import http from 'node:http';
import { EventEmitter } from 'node:events';
import { InMemoryLiveStore } from './in-memory-live-store.js';
import { readJsonBody, sendJson, sendError, readUrl, normalizeRoomIdFromPath } from './http-utils.js';
import { acceptWebSocket, encodeCloseFrame, encodeTextFrame, isWebSocketUpgrade, tryDecodeTextFrame } from './minimal-websocket.js';

export class LiveServer extends EventEmitter {
  constructor({ host = '127.0.0.1', port = 8787, store = null, security = {}, now = Date.now } = {}) {
    super();
    this.host = host;
    this.port = Number(port);
    this.now = now;
    this.security = { requireSignedPackets: false, requireInviteToken: false, allowBlobMirror: false, ...security };
    this.store = store ?? new InMemoryLiveStore({ now });
    this.sseClients = new Set();
    this.wsClients = new Set();
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    this.server.on('upgrade', (req, socket) => this.handleUpgrade(req, socket));
  }

  async start() {
    if (this.listening) return this;
    await new Promise((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(this.port, this.host, () => {
        this.server.off('error', reject);
        this.listening = true;
        this.emit('listening', this.getLocalUrl());
        resolve();
      });
    });
    return this;
  }

  async stop() {
    for (const client of this.sseClients) client.end();
    for (const client of this.wsClients) {
      try { client.socket.write(encodeCloseFrame()); } catch {}
      try { client.socket.destroy(); } catch {}
    }
    await new Promise(resolve => this.server.close(resolve));
    this.listening = false;
  }

  getLocalUrl() {
    return `http://${this.host}:${this.port}`;
  }

  health() {
    return {
      ok: true,
      kit: 'live-server-kit',
      version: '0.1.0',
      localUrl: this.getLocalUrl(),
      rooms: this.store.rooms.size,
      presence: this.store.presence.size,
      routeSummaries: this.store.routeSummaries.size,
      sseClients: this.sseClients.size,
      wsClients: this.wsClients.size,
      now: this.now()
    };
  }

  validateAppend(event) {
    if (!event || typeof event !== 'object') throw new Error('event must be an object');
    if (this.security.requireSignedPackets && !event.signature) throw new Error('signed packet required');
    return event;
  }

  broadcast(roomId, message) {
    const payload = JSON.stringify(message);
    for (const client of this.sseClients) {
      if (!client.roomId || client.roomId === roomId) {
        client.write(`event: message\ndata: ${payload}\n\n`);
      }
    }
    const frame = encodeTextFrame(payload);
    for (const client of this.wsClients) {
      if (!client.roomId || client.roomId === roomId) {
        try { client.socket.write(frame); } catch {}
      }
    }
  }

  async handleRequest(req, res) {
    try {
      if (req.method === 'OPTIONS') return sendJson(res, 204, {});
      const url = readUrl(req);
      if (req.method === 'GET' && url.pathname === '/health') return sendJson(res, 200, this.health());
      if (req.method === 'GET' && url.pathname.startsWith('/snapshot/')) {
        const roomId = normalizeRoomIdFromPath(url.pathname, '/snapshot/');
        return sendJson(res, 200, this.store.getSnapshot(roomId));
      }
      if (req.method === 'GET' && url.pathname === '/events/stream') return this.handleSse(req, res, url);
      if (req.method === 'POST' && url.pathname === '/events') return this.handlePostEvent(req, res);
      if (req.method === 'POST' && url.pathname === '/presence') return this.handlePostPresence(req, res);
      if (req.method === 'POST' && url.pathname === '/route-summaries') return this.handlePostRouteSummary(req, res);
      if (req.method === 'POST' && url.pathname === '/relay') return this.handlePostRelay(req, res);
      if (req.method === 'GET' && url.pathname.startsWith('/relay/')) {
        const targetIdentity = decodeURIComponent(url.pathname.slice('/relay/'.length));
        return sendJson(res, 200, { ok: true, packets: this.store.drainRelay(targetIdentity) });
      }
      return sendError(res, 404, 'not found');
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  }

  handleSse(req, res, url) {
    const roomId = url.searchParams.get('roomId') ?? 'room/root';
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store',
      connection: 'keep-alive',
      'access-control-allow-origin': '*'
    });
    res.write(`event: ready\ndata: ${JSON.stringify({ ok: true, roomId, snapshot: this.store.getSnapshot(roomId) })}\n\n`);
    const client = Object.assign(res, { roomId });
    this.sseClients.add(client);
    req.on('close', () => this.sseClients.delete(client));
  }

  async handlePostEvent(req, res) {
    const event = this.validateAppend(await readJsonBody(req));
    const appended = this.store.appendEvent(event);
    this.broadcast(appended.roomId, { type: 'event.appended', event: appended });
    return sendJson(res, 202, { ok: true, event: appended });
  }

  async handlePostPresence(req, res) {
    const lease = this.store.upsertPresence(await readJsonBody(req));
    this.broadcast(lease.roomId, { type: 'presence.updated', lease });
    return sendJson(res, 202, { ok: true, lease });
  }

  async handlePostRouteSummary(req, res) {
    const summary = this.store.upsertRouteSummary(await readJsonBody(req));
    this.broadcast(summary.roomId, { type: 'route-summary.updated', summary });
    return sendJson(res, 202, { ok: true, summary });
  }

  async handlePostRelay(req, res) {
    const relay = this.store.enqueueRelay(await readJsonBody(req));
    this.broadcast(relay.roomId ?? 'room/root', { type: 'relay.enqueued', relayId: relay.relayId, targetIdentity: relay.targetIdentity });
    return sendJson(res, 202, { ok: true, relay });
  }

  handleUpgrade(req, socket) {
    if (!isWebSocketUpgrade(req)) return socket.destroy();
    const ws = acceptWebSocket(req, socket);
    if (!ws) return;
    const client = { socket: ws, roomId: null, buffer: Buffer.alloc(0) };
    this.wsClients.add(client);
    ws.write(encodeTextFrame(JSON.stringify({ type: 'ready', health: this.health() })));
    ws.on('data', chunk => {
      client.buffer = Buffer.concat([client.buffer, chunk]);
      while (client.buffer.length) {
        const decoded = tryDecodeTextFrame(client.buffer);
        client.buffer = decoded.remaining;
        if (decoded.close) return ws.destroy();
        if (!decoded.message) break;
        this.handleWsMessage(client, decoded.message);
      }
    });
    ws.on('close', () => this.wsClients.delete(client));
    ws.on('error', () => this.wsClients.delete(client));
  }

  handleWsMessage(client, text) {
    let message;
    try { message = JSON.parse(text); } catch { return; }
    if (message.type === 'subscribe') {
      client.roomId = message.roomId ?? 'room/root';
      client.socket.write(encodeTextFrame(JSON.stringify({ type: 'snapshot', snapshot: this.store.getSnapshot(client.roomId) })));
      return;
    }
    if (message.type === 'event.append') {
      const appended = this.store.appendEvent(this.validateAppend(message.event ?? message));
      this.broadcast(appended.roomId, { type: 'event.appended', event: appended });
    }
  }
}

export function createLiveServer(options = {}) {
  return new LiveServer(options);
}
