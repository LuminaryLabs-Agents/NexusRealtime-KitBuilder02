export async function readJsonBody(req, { limitBytes = 1024 * 1024 } = {}) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > limitBytes) throw new Error('request body too large');
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return {};
  return JSON.parse(text);
}

export function sendJson(res, status, body, headers = {}) {
  const json = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    ...headers
  });
  res.end(json);
}

export function sendError(res, status, message, details = {}) {
  sendJson(res, status, { ok: false, error: message, ...details });
}

export function readUrl(req) {
  return new URL(req.url, `http://${req.headers.host ?? '127.0.0.1'}`);
}

export function normalizeRoomIdFromPath(pathname, prefix = '/snapshot/') {
  return decodeURIComponent(pathname.slice(prefix.length));
}
