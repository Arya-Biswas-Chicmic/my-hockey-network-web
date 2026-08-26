# Documentation maintenance policy

Last reviewed: 2026-08-21

Documentation is a required implementation artifact. Changes under `apps/`, `packages/`, `scripts/`,
or root project configuration must update at least one maintained context document when they change
architecture, behavior, security posture, test scope, commands, or delivery status.

Maintained documents:

- `AGENTS.md`: mandatory operating rules for coding agents.
- `docs/FRONTEND_ARCHITECTURE.md`: consolidated, authoritative frontend architecture standard.
- `docs/PROJECT_CONTEXT.md`: stable product and architecture context.
- `docs/FRONTEND_DEVELOPMENT_GUIDELINES.md`: current and approved target frontend standards.
- `docs/NEXTJS_MIGRATION_PLAN.md`: approved, paused web migration scope and execution phases.
- `docs/WEB_SEO_AND_RENDERING_STRATEGY.md`: route indexing, rendering, ISR, and SEO policy.
- `docs/THIRD_PARTY_AND_DEPENDENCY_POLICY.md`: built-in-first dependency and vendor review policy.
- `docs/ADMIN_PANEL_ALIGNMENT.md`: verified cross-project patterns, differences, and drift warnings.
- `docs/codebase_architecture_guide.md`: detailed dependency and folder structure.
- `docs/IMPLEMENTATION_STATUS.md`: delivered work and active backlog.
- `docs/SECURITY_REGISTER.md`: severity findings, resolutions, and open risks.
- `docs/TESTING_STRATEGY.md`: testing layers, scope, exclusions, and coverage gates.
- `docs/ENVIRONMENT_CONFIGURATION.md`: runtime variables and secret-handling requirements.
- `docs/COMPONENT_CATALOG.md`: platform component inventory and reuse policy.
- `docs/NAVIGATION.md`: web routing versus mobile navigation ownership and rules.
- `docs/MOBILE_SETUP.md`: current Expo environment, run, build, and reuse instructions.

All maintained project documents live in the root-level `docs/` directory. The repository retains
only `README.md` and `AGENTS.md` at its root because repository interfaces and coding-agent discovery
depend on those conventional entry points. Application folders must not contain independent Markdown
instructions; add or update the corresponding document here instead.

`pnpm docs:check` verifies required files, review dates, and source/documentation changes. The
pre-commit hook runs this check. The project owner has authorized routine updates to these files;
contributors and coding agents should update them without requesting separate approval.
