# Repository Memory

## Durable architecture

- Domain kits receive transports, runtimes, and URLs through adapters; they do not own infrastructure processes.
- `peerjs-room-kit` owns bounded room state, presence, packet checks, ledgers, and election.
- `peerjs-hostlayer-kit` owns cross-room routes, validation, direct links, and fallback.
- `secure-peer-onnx-kit` owns model startup, job claims, queues, provider fallback, and result validation.
- `live-server-kit` owns the in-memory HTTP, SSE, WebSocket, snapshot, presence, route-summary, and relay mirror.
- `cloudflare-tunnel-kit` owns `cloudflared` discovery, quick-tunnel parsing, process lifecycle, and runtime manifests.

## Lifecycle

- The lifecycle has exactly 20 ordered states.
- Every current kit has all three examples and is recorded at stage 16, `example_3_live_or_edge`.
- Promotion requires later documentation, quality, registry, and promotion evidence; no current kit is promotion-ready.
- `.kitbuilder/agent-brain/main-agent-brain.md` is the existing domain lesson source and must be read before major changes.

## Safety

- The checked-in live config does not require signatures or invite tokens.
- Public tunnel startup is an external exposure action and requires explicit approval.
- `.runtime/` manifests are generated and ignored.
