# KitBuilder02 Main Agent Brain

Agents should review this memory before major kit changes.

Total lessons: 3

## Keep infrastructure orchestration out of domain kits

Cloudflare tunnel spawning and live server process management belong in dedicated infrastructure kits/runners. ONNX and PeerJS domain kits should receive URLs/adapters, not own tunnel processes.

## Make kit progress machine-readable

Every kit should have lifecycle state in kit.manifest.json and project state in .kitbuilder/projects/<kit-id>/kit.project.json so future work can advance without guessing.

## Every kit needs three required examples before proof-stage advancement

Do not mark a kit past the proof stages unless examples/local-basic, examples/hosted-integration, and examples/live-or-edge all contain a README and runnable entry file. These examples make the kit understandable, host-testable, and edge-case-testable.
