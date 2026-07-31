# KitBuilder Lifecycle

KitBuilder02 tracks every kit through 20 ordered, machine-readable states.

```text
idea_captured
  -> idea_normalized
  -> domain_classified
  -> scope_locked
  -> risk_audited
  -> api_drafted
  -> manifest_seeded
  -> scaffold_generated
  -> contracts_defined
  -> implementation_started
  -> implementation_complete
  -> unit_tested
  -> integration_tested
  -> example_1_local
  -> example_2_hosted
  -> example_3_live_or_edge
  -> documentation_complete
  -> quality_gated
  -> registry_ready
  -> promotion_ready
```

The authoritative definition is `.kitbuilder/lifecycle/states.json`. Each project is tracked in `.kitbuilder/projects/<kit-id>/kit.project.json`; the generated index is `.kitbuilder/projects/index.json`.

## Required examples

Each kit must contain runnable `local-basic`, `hosted-integration`, and `live-or-edge` examples before completing stage 16.

## Commands

```bash
npm run kit:state
npm run kit:advance -- --id <kit-id>
npm run kit:examples
npm run kit:check
npm run kit:registry
npm run kit:doctor
```

Some lifecycle commands update project records or generated registry artifacts. Run them on a review branch and inspect the resulting diff.

## Current state

All five manifests report stage 16 with three completed examples. `promotionReady` is false for every kit. Later lifecycle states require evidence beyond the repository-level documentation package.
