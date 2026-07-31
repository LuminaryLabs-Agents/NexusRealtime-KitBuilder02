# Repository Profile

## Identity

- Repository: `LuminaryLabs-Agents/NexusRealtime-KitBuilder02`
- Package: `nexusrealtime-kitbuilder02` version `0.3.0`
- Language: JavaScript ESM
- Status: experimental kit factory

## Purpose

Build and exercise transport-adapter-based kits for browser peer rooms, cross-room routing, secure ONNX-style jobs, local event mirroring, and optional public tunneling.

## Current state

- Five kit manifests, each version `0.1.0` and experimental.
- Every kit has three required examples and is recorded at lifecycle stage 16 of 20.
- Nineteen Node tests cover tunnel parsing/manifests, routing, jobs, lifecycle, live server, startup loading, packet validation, rooms, and host election.
- `apps/fabric-lab/` provides a deterministic room, route, and fake-ONNX smoke.
- `apps/live-fabric-runner/` composes the local server and optional Cloudflare tunnel.

## Boundaries

No kit is promotion-ready. The local live store is in memory, real PeerJS and production ONNX providers are adapter responsibilities, and checked-in live security requirements are disabled for development.
