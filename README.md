# NexusRealtime KitBuilder02

KitBuilder02 is the build lab and kit factory for NexusRealtime custom browser kits.

This repository contains the implementation scaffold for a layered browser peer fabric:

- `peerjs-room-kit` — bounded PeerJS/WebRTC-style room behavior, signed packet validation, leases, presence, local ledgers, and host election repair.
- `peerjs-hostlayer-kit` — room-to-room host layers, route summaries, route/path validation, direct-link negotiation, and fallback ladders.
- `secure-peer-onnx-kit` — secure ONNX-style job orchestration, model-manifest validation, startup model-count loading, provider fallback, job leases, and result validation.
- `live-server-kit` — local HTTP/SSE/WebSocket mirror server for snapshots, presence, route summaries, relay packets, and catch-up.
- `cloudflare-tunnel-kit` — `cloudflared` quick tunnel process wrapper that exposes the live server and writes `.runtime/tunnel.json`.

The implementation is intentionally transport-adapter based. The kits can run in tests without real PeerJS, while NexusRealtime can inject real PeerJS/WebRTC adapters at runtime.

## Kit factory lifecycle

KitBuilder02 tracks kits through a 20-stage lifecycle from `idea_captured` to `promotion_ready`.

Machine-readable state is stored in:

```txt
.kitbuilder/lifecycle/states.json
.kitbuilder/projects/<kit-id>/kit.project.json
.kitbuilder/projects/index.json
```

Lifecycle commands:

```bash
npm run kit:state
npm run kit:advance -- --id <kit-id>
npm run kit:examples
npm run kit:check
npm run kit:registry
npm run kit:doctor
```

Create a new kit from an idea:

```bash
npm run kit:intake -- --id vector-cache-kit --title "Vector Cache Kit" --kind browser-runtime
```

## Local issue tracker and agent memory

Create a local KitBuilder issue:

```bash
npm run kit:issue -- new --title "Missing live example" --kit secure-peer-onnx-kit --severity normal --tags docs,examples
```

Close it and add a lesson:

```bash
npm run kit:issue -- close --id <issue-id> --lesson "Every promoted kit needs a live-or-edge example."
```

Lessons are stored in `.kitbuilder/agent-brain/lessons.jsonl` and summarized in `.kitbuilder/agent-brain/main-agent-brain.md`.

## Reliability contract

Every public operation should resolve into a terminal outcome:

- `completed`
- `retried`
- `rerouted`
- `degraded`
- `recovered`
- `failed-closed`

Design ladder:

```txt
Validate before accepting.
Lease before assigning.
ACK before assuming delivery.
Hash before using blobs.
Fallback before failing.
Requeue before dropping.
Snapshot before pruning.
Fail closed before guessing.
```

## Repository layout

```txt
.kitbuilder/
  lifecycle/
  projects/
  issues/
  agent-brain/
kits/
  peerjs-room-kit/
  peerjs-hostlayer-kit/
  secure-peer-onnx-kit/
  live-server-kit/
  cloudflare-tunnel-kit/
shared/
  append-ledger/
  chunk-transport/
  signed-packet/
  utils/
apps/
  fabric-lab/
  live-fabric-runner/
tests/
```

## Run tests

```bash
npm test
```

## Local smoke

```bash
npm run smoke
```

## Live fabric runner

```bash
npm run live:server
npm run live:tunnel
npm run live:fabric
```

If `cloudflared` is not installed, `live:fabric` still starts the local live server and prints an install/configuration hint. Set `CLOUDFLARED_BIN=/path/to/cloudflared` to use a non-standard binary path.

Runtime manifests are written to:

```txt
.runtime/live-server.json
.runtime/tunnel.json
```

`publicWsUrl` in `.runtime/tunnel.json` is the remote browser entrypoint for the mirrored mesh.
