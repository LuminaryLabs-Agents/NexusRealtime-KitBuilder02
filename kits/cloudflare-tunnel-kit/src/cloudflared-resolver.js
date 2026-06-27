import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

export function resolveCloudflared({ env = process.env } = {}) {
  const candidates = [
    env.CLOUDFLARED_BIN,
    '/usr/local/bin/cloudflared',
    '/usr/bin/cloudflared',
    '/opt/homebrew/bin/cloudflared'
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  const which = spawnSync('which', ['cloudflared'], { encoding: 'utf8' });
  if (which.status === 0 && which.stdout.trim()) return which.stdout.trim();
  return null;
}

export function cloudflaredInstallHint() {
  return [
    'cloudflared was not found on PATH.',
    'Install Cloudflare Tunnel first, or set CLOUDFLARED_BIN to the cloudflared executable.',
    'Quick tunnel command expected: cloudflared tunnel --url http://127.0.0.1:8787'
  ].join('\n');
}
