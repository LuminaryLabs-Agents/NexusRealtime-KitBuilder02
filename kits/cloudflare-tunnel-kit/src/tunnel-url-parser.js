const TRY_CLOUDFLARE_PATTERN = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/gi;
const HTTPS_PATTERN = /https:\/\/[^\s"'<>]+/gi;

export function parseTunnelUrls(text = '') {
  const source = String(text);
  const tryUrls = [...source.matchAll(TRY_CLOUDFLARE_PATTERN)].map(match => match[0]);
  const httpsUrls = [...source.matchAll(HTTPS_PATTERN)].map(match => match[0]);
  return [...new Set([...tryUrls, ...httpsUrls])];
}

export function parseCloudflaredTunnelUrl(text = '') {
  const urls = parseTunnelUrls(text);
  return urls.find(url => url.includes('.trycloudflare.com')) ?? urls[0] ?? null;
}

export function toPublicWsUrl(publicUrl) {
  if (!publicUrl) return null;
  const url = new URL(publicUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = url.pathname === '/' ? '/ws' : url.pathname;
  return url.toString();
}
