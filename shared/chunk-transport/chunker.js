import { sha256Ref } from '../utils/hash.js';

export async function createBlobManifest(bytes, { chunkSize = 65536, mime = 'application/octet-stream' } = {}) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const sha256 = await sha256Ref(data);
  return {
    blobId: `blob_${sha256.replace(':', '_')}`,
    sha256,
    byteLength: data.byteLength,
    chunkSize,
    chunkCount: Math.ceil(data.byteLength / chunkSize),
    mime
  };
}

export async function chunkBytes(bytes, options = {}) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const manifest = await createBlobManifest(data, options);
  const chunks = [];
  for (let index = 0; index < manifest.chunkCount; index += 1) {
    const start = index * manifest.chunkSize;
    const end = Math.min(start + manifest.chunkSize, data.byteLength);
    const payload = data.slice(start, end);
    chunks.push({
      type: 'blob.chunk',
      blobId: manifest.blobId,
      chunkIndex: index,
      chunkCount: manifest.chunkCount,
      chunkSha256: await sha256Ref(payload),
      data: payload
    });
  }
  return { manifest, chunks };
}

export async function reassembleChunks(manifest, chunks) {
  const sorted = [...chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);
  const missing = [];
  for (let index = 0; index < manifest.chunkCount; index += 1) {
    if (!sorted.find(chunk => chunk.chunkIndex === index)) missing.push(index);
  }
  if (missing.length) {
    return { ok: false, type: 'blob.nack', blobId: manifest.blobId, missing };
  }
  const output = new Uint8Array(manifest.byteLength);
  let offset = 0;
  for (const chunk of sorted) {
    output.set(chunk.data, offset);
    offset += chunk.data.byteLength;
  }
  const actual = await sha256Ref(output);
  return actual === manifest.sha256
    ? { ok: true, data: output, sha256: actual }
    : { ok: false, type: 'blob.nack', blobId: manifest.blobId, reason: 'final_hash_mismatch' };
}
