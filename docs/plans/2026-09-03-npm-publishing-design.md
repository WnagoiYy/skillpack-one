# npm publishing design

## Goal

Publish `skillpack-one` from reviewed GitHub releases without storing a long-lived npm write token, while preserving the repository's existing CI and Meta Skill release gates.

## Decision

Use a dedicated `publish-npm.yml` GitHub Actions workflow triggered by a published GitHub Release. The job runs on a GitHub-hosted runner, checks that the release tag exactly equals `v<package.json version>`, checks that the tagged commit belongs to `main`, verifies GitHub's prerelease flag against SemVer, runs the complete repository CI, and publishes through npm Trusted Publishing (OIDC). A GitHub Environment named `npm` supplies the human deployment-approval boundary. Pre-release versions publish under the `next` dist-tag; stable versions publish under `latest`.

The package is currently absent from npm. npm only permits Trusted Publisher configuration after the package exists, so the first pre-release is a one-time 2FA-authenticated bootstrap publish. After that publish, the maintainer binds `WnagoiYy/skillpack-one`, workflow `publish-npm.yml`, and environment `npm` as the package's trusted publisher, tests one automated release, then disables token-based publishing.

## Alternatives considered

1. **Recommended: GitHub Release plus OIDC direct publish.** It has no persistent npm secret, preserves provenance, and is understandable to contributors. GitHub Environment approval and protected release tags provide the human gate.
2. **OIDC staged publishing.** This adds a second npm-side 2FA approval after CI. It is the strongest option and remains documented as a future hardening profile, but adds operational steps while the project is an alpha.
3. **Repository `NPM_TOKEN`.** This bootstraps easily but creates a long-lived write credential and weaker supply-chain posture. It is not included in the permanent workflow.

## Release invariants

- `package.json` contains the exact public GitHub repository URL required for npm provenance.
- A GitHub Release tag must exactly match `v<version>`.
- SemVer pre-releases must be marked as GitHub pre-releases and use npm tag `next`.
- Stable SemVer releases must not be marked pre-release and use npm tag `latest`.
- The release commit must be reachable from `origin/main`.
- `npm run ci` and a package dry run must pass before publishing.
- The publish job has only `contents: read` and `id-token: write` permissions.
- Release builds disable package-manager caching and install dependencies with lifecycle scripts disabled.
- npm versions are immutable. Recovery uses deprecation, dist-tag rollback, and a corrective version rather than overwriting a release.

## Trust boundaries

The workflow establishes artifact origin, build revision, and publish identity; it does not prove semantic safety. Pull-request review, the project's evolution proposal, held-out evaluation, GitHub Environment approval, npm OIDC configuration, and runtime permissions remain separate controls. npm provenance links the package to this public repository and workflow, but is not a malware guarantee.

