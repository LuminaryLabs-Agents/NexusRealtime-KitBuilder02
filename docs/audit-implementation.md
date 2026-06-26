# Audit implementation notes

This scaffold implements the reliability surface from the room/host-layer/secure-ONNX audit.

## Validation gates

1. Kit manifests are explicit and versioned in `kitbuilder.manifest.json`.
2. Room paths are canonicalized and validated before use.
3. Packet envelopes are checked for type, timestamps, TTL, nonce shape, payload hashes, and optional signatures.
4. Routes are checked for path cycles, hop limits, expiry, and endpoint correctness.
5. Chunk manifests and final blob hashes are supported through `shared/chunk-transport`.
6. ONNX model manifests are validated before startup loading.
7. Results are checked against job claims, model/input hashes, schema, runtime metadata, and duplicate output rules.

## Error correction

- Presence leases evict stale peers.
- Claim leases requeue abandoned jobs.
- Route fallback tries direct, direct-reconnect, same-host bridge, parent-host bridge, then relay.
- Ledger conflicts resolve deterministically by term, timestamp, and event ID.
- Startup model loading supports `exact` and `up-to` modes.
