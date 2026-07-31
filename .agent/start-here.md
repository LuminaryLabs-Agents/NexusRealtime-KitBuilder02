# Start Here

## Orientation

1. Read `README.md` and `docs/architecture.md`.
2. Read `.kitbuilder/agent-brain/main-agent-brain.md` for durable kit lessons.
3. Inspect `kitbuilder.manifest.json` and the target `kit.manifest.json`.
4. Inspect `.kitbuilder/projects/<kit-id>/kit.project.json` before lifecycle work.
5. Read `.agent/memory.md` before continuing prior work.

## Commands

```bash
npm run check
npm run live:doctor
npm run kit:state
```

`npm run kit:state`, lifecycle advancement, issue closure, lesson commands, and registry generation can update tracked project artifacts. Inspect the worktree before and after running mutation-capable commands.

## Guardrails

- Preserve kit ownership and adapter boundaries.
- Keep tests and examples deterministic.
- Do not launch public tunnels without approval.
- Do not advance or promote a kit from documentation claims alone.
