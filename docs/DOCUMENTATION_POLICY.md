# Documentation maintenance policy

Last reviewed: 2026-08-21

Documentation is a required implementation artifact. Changes under `apps/`, `packages/`, `scripts/`,
or root project configuration must update at least one maintained context document when they change
architecture, behavior, security posture, test scope, commands, or delivery status.

Maintained documents:

- `PROJECT_CONTEXT.md`: stable product and architecture context.
- `docs/codebase_architecture_guide.md`: detailed dependency and folder structure.
- `docs/IMPLEMENTATION_STATUS.md`: delivered work and active backlog.
- `docs/SECURITY_REGISTER.md`: severity findings, resolutions, and open risks.
- `docs/TESTING_STRATEGY.md`: testing layers, scope, exclusions, and coverage gates.
- `docs/ENVIRONMENT_CONFIGURATION.md`: runtime variables and secret-handling requirements.
- `docs/COMPONENT_CATALOG.md`: platform component inventory and reuse policy.
- `docs/NAVIGATION.md`: web routing versus mobile navigation ownership and rules.

`npm run docs:check` verifies required files, review dates, and source/documentation changes. The
pre-commit hook runs this check. The project owner has authorized routine updates to these files;
contributors and coding agents should update them without requesting separate approval.
