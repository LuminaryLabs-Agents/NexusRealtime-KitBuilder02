import crypto from 'node:crypto';

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

export function isWebSocketUpgrade(req, pathname = '/ws') {
  return req.url?.startsWith(pathname) && String(req.headers.upgrade ?? '').toLowerCase() === 'websocket';
}

export function acceptWebSocket(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return null;
  }
  const accept = crypto.createHash('sha1').update(`${key}${WS_GUID}`).digest('base64');
  socket.write([
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    '',
    ''
  ].join('\r\n'));
  return socket;
}

export function encodeTextFrame(text) {
  const payload = Buffer.from(text, 'utf8');
  if (payload.length < 126) return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
  if (payload.length <= 0xffff) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
    return Buffer.concat([header, payload]);
  }
  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(payload.length), 2);
  return Buffer.concat([header, payload]);
}

export function encodeCloseFrame() {
  return Buffer.from([0x88, 0x00]);
}

export function tryDecodeTextFrame(buffer) {
  if (buffer.length < 2) return { message: null, remaining: buffer };
  const opcode = buffer[0] & 0x0f;
  let offset = 2;
  let length = buffer[1] & 0x7f;
  const masked = Boolean(buffer[1] & 0x80);
  if (length === 126) {
    if (buffer.length < offset + 2) return { message: null, remaining: buffer };
    length = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    if (buffer.length < offset + 8) return { message: null, remaining: buffer };
    length = Number(buffer.readBigUInt64BE(offset));
    offset += 8;
  }
  const maskOffset = offset;
  if (masked) offset += 4;
  if (buffer.length < offset + length) return { message: null, remaining: buffer };
  const payload = Buffer.from(buffer.subarray(offset, offset + length));
  if (masked) {
    const mask = buffer.subarray(maskOffset, maskOffset + 4);
    for (let i = 0; i < payload.length; i += 1) payload[i] ^= mask[i % 4];
  }
  const remaining = buffer.subarray(offset + length);
  if (opcode === 0x8) return { close: true, message: null, remaining };
  if (opcode !== 0x1) return { message: null, remaining };
  return { message: payload.toString('utf8'), remaining };
}
