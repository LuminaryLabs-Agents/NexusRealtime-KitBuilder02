# Operations

## Full local check

```bash
npm run check
```

This runs manifest validation, the Node tests, and the deterministic fabric smoke.

## Inspect the environment

```bash
npm run live:doctor
```

The doctor reports Node, `cloudflared` discovery, the default server URL, runtime directory, and available scripts. A missing `cloudflared` binary does not block local tests.

## Run the local mirror

```bash
npm run live:server
```

Useful endpoints:

```text
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

Example:

```bash
curl http://127.0.0.1:8787/health
curl -X POST -H 'content-type: application/json' \
  --data '{"eventId":"demo:1","roomId":"room/root","type":"demo.event"}' \
  http://127.0.0.1:8787/events
curl http://127.0.0.1:8787/snapshot/room%2Froot
```

## Optional public tunnel

`npm run live:fabric` starts the local server and may spawn a Cloudflare quick tunnel. This creates public ingress. Before use, change the development security defaults, add application authorization, define payload and rate limits, review exposed data, and obtain deployment approval.

Generated manifests belong under ignored `.runtime/` and must not be committed.
