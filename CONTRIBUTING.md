# Contributing

Keep changes inside the owning kit and preserve deterministic, fail-closed behavior.

## Workflow

1. Read the target kit's README, manifest, project record, and relevant agent-brain lessons.
2. Identify the owning boundary before changing behavior.
3. Update implementation, manifest exports, project evidence, examples, and existing tests together when their contract changes.
4. Run `npm run check`.
5. Run `npm run live:doctor` or a local server check when infrastructure behavior changes.

## Expectations

- Validate before accepting data and preserve replay, hash, route, and lease checks.
- Keep external PeerJS, ONNX, and tunnel implementations behind adapters.
- Preserve the required `local-basic`, `hosted-integration`, and `live-or-edge` examples.
- Do not advance lifecycle state without its required artifact and evidence.
- Never commit credentials, private endpoints, real invite tokens, production model URLs, or generated `.runtime/` data.
- Do not represent experimental stage-16 kits as production-ready or promoted.
