# KitBuilder02 Agent Brain

The agent brain is a repo-local learning ledger for KitBuilder02.

It stores lessons learned from local KitBuilder issues and manual notes so future agents can inspect the project memory before changing kits.

Files:

```txt
.kitbuilder/agent-brain/lessons.jsonl
.kitbuilder/agent-brain/main-agent-brain.md
```

Add a lesson manually:

```bash
npm run kit:lesson -- --title "Keep infra out of ONNX kit" --body "Tunnel/server code belongs in live-server-kit or cloudflare-tunnel-kit." --tags architecture,boundary
```

Create and close a local issue with a lesson:

```bash
npm run kit:issue -- new --title "Missing live example" --kit secure-peer-onnx-kit
npm run kit:issue -- close --id <issue-id> --lesson "Every kit needs a live-or-edge example."
```

Agents should read `main-agent-brain.md` before planning significant changes.
