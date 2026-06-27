import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import { parseCloudflaredTunnelUrl, toPublicWsUrl } from './tunnel-url-parser.js';
import { resolveCloudflared, cloudflaredInstallHint } from './cloudflared-resolver.js';
import { writeRuntimeManifest } from './runtime-manifest-writer.js';

export class QuickTunnelRunner extends EventEmitter {
  constructor({ localUrl = 'http://127.0.0.1:8787', cloudflaredPath = null, runtimeDir = '.runtime', spawnImpl = spawn, env = process.env } = {}) {
    super();
    this.localUrl = localUrl;
    this.cloudflaredPath = cloudflaredPath;
    this.runtimeDir = runtimeDir;
    this.spawnImpl = spawnImpl;
    this.env = env;
    this.child = null;
    this.publicUrl = null;
  }

  start() {
    const binary = this.cloudflaredPath ?? resolveCloudflared({ env: this.env });
    if (!binary) {
      const error = new Error(cloudflaredInstallHint());
      this.emit('error', error);
      throw error;
    }

    this.child = this.spawnImpl(binary, ['tunnel', '--url', this.localUrl], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: this.env
    });

    const handleOutput = chunk => {
      const text = chunk.toString('utf8');
      this.emit('log', text);
      const url = parseCloudflaredTunnelUrl(text);
      if (url && !this.publicUrl) {
        this.publicUrl = url;
        const manifest = {
          mode: 'quick',
          localUrl: this.localUrl,
          publicUrl: url,
          publicWsUrl: toPublicWsUrl(url),
          pid: this.child.pid,
          health: 'online'
        };
        writeRuntimeManifest({ runtimeDir: this.runtimeDir, manifest })
          .then(result => this.emit('url', result.manifest))
          .catch(error => this.emit('error', error));
      }
    };

    this.child.stdout?.on('data', handleOutput);
    this.child.stderr?.on('data', handleOutput);
    this.child.on('exit', (code, signal) => this.emit('exit', { code, signal, publicUrl: this.publicUrl }));
    this.child.on('error', error => this.emit('error', error));
    return this;
  }

  stop(signal = 'SIGTERM') {
    if (this.child && !this.child.killed) this.child.kill(signal);
  }
}

export function startQuickTunnel(options = {}) {
  return new QuickTunnelRunner(options).start();
}
