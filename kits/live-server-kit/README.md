# live-server-kit

`live-server-kit` is the durable mirror layer for the NexusRealtime peer fabric.

It provides a local HTTP/SSE/WebSocket server for:

- room event mirroring
- ledger snapshots
- presence leases
- route summaries
- relay mailbox packets
- runtime health checks

It does not run ONNX inference and does not replace PeerJS/WebRTC direct links. It gives peers a catch-up and fallback coordination point.

## Start

```bash
npm run live:server
```

Default local URL:

```txt
http://127.0.0.1:8787
```

Useful endpoints:

```txt
GET  /health
GET  /snapshot/:roomId
POST /events
GET  /events/stream?roomId=room/root
POST /presence
POST /route-summaries
POST /relay
GET  /relay/:targetIdentity
WS   /ws
```
