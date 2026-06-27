# KitBuilder02 Main Agent Brain

Agents should review this memory before major kit changes.

Total lessons: 2

## Keep infrastructure orchestration out of domain kits

Cloudflare tunnel spawning and live server process management belong in dedicated infrastructure kits/runners. ONNX and PeerJS domain kits should receive URLs/adapters, not own tunnel processes.

## Make kit progress machine-readable

Every kit should have lifecycle state in kit.manifest.json and project state in .kitbuilder/projects/<kit-id>/kit.project.json so future work can advance without guessing.
