# cloudflare-tunnel-kit

`cloudflare-tunnel-kit` exposes a local `live-server-kit` instance through Cloudflare Tunnel.

It is intentionally separate from `secure-peer-onnx-kit`, `peerjs-room-kit`, and `peerjs-hostlayer-kit`.

## Quick tunnel

```bash
npm run live:tunnel
```

or together with the live server:

```bash
npm run live:fabric
```

The kit resolves `cloudflared`, starts:

```bash
cloudflared tunnel --url http://127.0.0.1:8787
```

parses the generated public URL, and writes:

```txt
.runtime/tunnel.json
```

The public WebSocket URL is available as `publicWsUrl`.
