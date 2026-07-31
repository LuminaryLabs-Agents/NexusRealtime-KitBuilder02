# Repository Instructions

## Purpose

This repository builds and evaluates five experimental NexusRealtime kits for peer rooms, host routing, secure ONNX-style jobs, live mirroring, and optional tunneling.

## Boundaries

- Keep room membership, packet validation, leases, and election in `peerjs-room-kit`.
- Keep cross-room routes and fallback in `peerjs-hostlayer-kit`.
- Keep model manifests, startup loading, claims, queues, and result validation in `secure-peer-onnx-kit`.
- Keep HTTP, SSE, WebSocket, snapshots, and relay mailboxes in `live-server-kit`.
- Keep `cloudflared` process and runtime-manifest behavior in `cloudflare-tunnel-kit` or the live runner.
- Inject transports and model runtimes through adapters; do not bind domain kits directly to external services.

## Required orientation

Read `.kitbuilder/agent-brain/main-agent-brain.md`, `.agent/memory.md`, the relevant kit manifest, and the closest tests before significant changes.

## Validation

```bash
npm run check
npm run live:doctor
```

Use `npm run live:server` for local endpoint checks. Do not start a public tunnel, publish, or promote a kit without explicit approval. Preserve the 20-state lifecycle and three-example gate.
