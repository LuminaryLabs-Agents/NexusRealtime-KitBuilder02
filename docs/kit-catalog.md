# Kit Catalog

| Kit | Kind | Dependencies | Current evidence |
| --- | --- | --- | --- |
| `peerjs-room-kit` | browser runtime | none | packet/room validation, presence, ledger, election tests; three examples |
| `peerjs-hostlayer-kit` | browser runtime | room kit | route-cycle rejection and route selection tests; three examples |
| `secure-peer-onnx-kit` | browser runtime | room and host-layer kits | startup and job-result validation tests; three examples |
| `live-server-kit` | server kit | none | event/snapshot and relay tests; three examples |
| `cloudflare-tunnel-kit` | Node tool | live-server kit, external `cloudflared` for tunneling | URL parsing and runtime-manifest tests; three examples |

Every manifest reports:

- version `0.1.0`;
- status `experimental`;
- lifecycle state `example_3_live_or_edge` at index 16 of 20;
- three required examples completed; and
- `promotionReady: false`.

`kitbuilder.manifest.json` is the repository-level export map. Per-kit manifests remain the authority for runtime kind, dependencies, entry point, exports, tests, and lifecycle status.
