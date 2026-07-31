# Architecture

## System shape

```text
Browser peers
  -> peerjs-room-kit
    -> peerjs-hostlayer-kit
      -> secure-peer-onnx-kit

Room events and state
  -> live-server-kit
    -> local HTTP / SSE / WebSocket clients
      -> optional cloudflare-tunnel-kit
```

The domain kits are transport-adapter based. Tests and the fabric lab use deterministic local implementations; a host application can inject real PeerJS/WebRTC and ONNX runtimes without moving infrastructure ownership into the domain kits.

## Ownership

| Boundary | Owner |
| --- | --- |
| room IDs, membership, presence leases, packet envelopes, replay checks, ledger, host election | `peerjs-room-kit` |
| route summaries, path validation, direct-link negotiation, fallback ladder | `peerjs-hostlayer-kit` |
| model manifests, startup selection/loading, claims, queues, result validation | `secure-peer-onnx-kit` |
| in-memory snapshots, events, presence, route summaries, relay, SSE, WebSocket | `live-server-kit` |
| `cloudflared` resolution, URL parsing, process wrapper, runtime manifest | `cloudflare-tunnel-kit` |

## Reliability model

The implementation validates packet, route, model, job, and result boundaries. Presence and job claims use leases. Packet nonces reject replay. Routes reject cycles and use a fallback ladder. Startup model loading can fail closed in exact mode or degrade in up-to mode. Append ledgers and hashes support deterministic reconciliation.

## Runtime composition

`apps/fabric-lab/src/main.js` creates a root room, a host layer, and a secure ONNX mesh using `FakeOnnxRuntime`. `apps/live-fabric-runner/start.js` independently starts the local mirror server and, when enabled and installed, a Cloudflare quick tunnel.

## Current limitations

- All kits are experimental stage 16/20 and not promotion-ready.
- Real PeerJS/WebRTC and production ONNX execution are not exercised by the deterministic smoke.
- The live store is in memory and does not provide durable persistence.
- The WebSocket implementation is intentionally minimal.
- Checked-in live security defaults do not require packet signatures or invite tokens.
- Public tunnel behavior was not exercised during the repository documentation cycle.
