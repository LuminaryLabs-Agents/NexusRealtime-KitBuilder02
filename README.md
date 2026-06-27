# NexusRealtime KitBuilder02

KitBuilder02 is the build lab for NexusRealtime custom browser kits.

This repository contains the implementation scaffold for a layered browser peer fabric:

- `peerjs-room-kit` — bounded PeerJS/WebRTC-style room behavior, signed packet validation, leases, presence, local ledgers, and host election repair.
- `peerjs-hostlayer-kit` — room-to-room host layers, route summaries, route/path validation, direct-link negotiation, and fallback ladders.
- `secure-peer-onnx-kit` — secure ONNX-style job orchestration, model-manifest validation, startup model-count loading, provider fallback, job leases, and result validation.
- `live-server-kit` — local HTTP/SSE/WebSocket mirror server for snapshots, presence, route summaries, relay packets, and catch-up.
- `cloudflare-tunnel-kit` — `cloudflared` quick tunnel process wrapper that exposes the live server and writes `.runtime/tunnel.json`.

The implementation is intentionally transport-adapter based. The kits can run in tests without real PeerJS, while NexusRealtime can inject real PeerJS/WebRTC adapters at runtime.

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

Start the local mirror server only:

```bash
npm run live:server
```

Start a Cloudflare quick tunnel to an already-running server:

```bash
npm run live:tunnel
```

Start the server and spawn the tunnel together:

```bash
npm run live:fabric
```

If `cloudflared` is not installed, `live:fabric` still starts the local live server and prints an install/configuration hint. Set `CLOUDFLARED_BIN=/path/to/cloudflared` to use a non-standard binary path.

Runtime manifests are written to:

```txt
.runtime/live-server.json
.runtime/tunnel.json
```

`publicWsUrl` in `.runtime/tunnel.json` is the remote browser entrypoint for the mirrored mesh.

## Example

```js
import { PeerJsRoomKit } from './kits/peerjs-room-kit/src/index.js';
import { PeerJsHostLayerKit } from './kits/peerjs-hostlayer-kit/src/index.js';
import { SecurePeerOnnxKit } from './kits/secure-peer-onnx-kit/src/index.js';

const room = await PeerJsRoomKit.join({
  roomId: 'room/root',
  identity: { identityKey: 'did:key:local-controller' },
  capabilities: { maxJobs: 2, models: [] }
});

const hostlayer = PeerJsHostLayerKit.create({
  parentRoom: room,
  childRooms: ['room/model/embed-mini-v1/shard/0001']
});

const mesh = await SecurePeerOnnxKit.join({
  roomFabric: hostlayer,
  identity: { identityKey: 'did:key:local-controller' },
  modelManifests: [],
  startupModels: { count: 0 }
});
```
