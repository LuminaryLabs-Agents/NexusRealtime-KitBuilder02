# KitBuilder02 Lifecycle Engine v0

KitBuilder02 treats every kit as a stateful project that moves from idea to promotion readiness.

## State chain

```txt
idea.md
→ idea_captured
→ idea_normalized
→ domain_classified
→ scope_locked
→ risk_audited
→ api_drafted
→ manifest_seeded
→ scaffold_generated
→ contracts_defined
→ implementation_started
→ implementation_complete
→ unit_tested
→ integration_tested
→ example_1_local
→ example_2_hosted
→ example_3_live_or_edge
→ documentation_complete
→ quality_gated
→ registry_ready
→ promotion_ready
```

The machine-readable state definition is stored in `.kitbuilder/lifecycle/states.json`.

Each project is tracked in `.kitbuilder/projects/<kit-id>/kit.project.json`.

A project index is generated at `.kitbuilder/projects/index.json`.

## Required examples

Each kit must eventually include three examples:

```txt
examples/local-basic/
examples/hosted-integration/
examples/live-or-edge/
```

## Commands

```bash
npm run kit:state
npm run kit:advance -- --id <kit-id>
npm run kit:examples
npm run kit:check
npm run kit:registry
npm run kit:doctor
```
