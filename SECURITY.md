# Security Policy

## Current status

All included kits are experimental. The repository demonstrates validation and recovery primitives, but it is not a production security boundary.

The checked-in `kitbuilder.live.json` development configuration sets `requireSignedPackets` and `requireInviteToken` to `false`. Do not expose that configuration to untrusted networks. Cloudflare quick tunnels create public ingress and must be enabled only after reviewing authentication, signatures, origin policy, payload limits, logging, and data exposure.

## Reporting

Do not open a public issue containing exploit details or sensitive data. Report vulnerabilities privately to a repository maintainer through a channel they designate. Include the affected path and commit, reproduction, impact, and proposed mitigation when available.

No response timeline or supported release window is currently defined.

## Secure use

- Use only synthetic data and test model manifests.
- Require signed packets and an application-owned authorization mechanism before any untrusted deployment.
- Treat the minimal WebSocket implementation and in-memory live store as experimental.
- Keep secrets, private URLs, production identities, and generated tunnel manifests out of version control.
- Validate room IDs, packet envelopes, hashes, nonces, routes, claims, and result ownership at every boundary.
