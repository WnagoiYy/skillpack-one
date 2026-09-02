# npm Publishing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a tokenless, release-gated npm publishing workflow for `skillpack-one` and document the unavoidable first-publish bootstrap.

**Architecture:** A small TypeScript release planner validates package metadata, release tag, prerelease state, repository identity, and npm dist-tag selection. A pinned GitHub Actions workflow consumes that planner, runs the existing CI, and publishes through npm OIDC only after the `npm` deployment environment approves the job.

**Tech Stack:** TypeScript 7, Vitest, npm 11, GitHub Actions, npm Trusted Publishing/OIDC.

---

### Task 1: Specify release-plan invariants

**Files:**
- Create: `tests/release.test.ts`
- Create: `src/release.ts`

1. Write tests for an alpha release selecting `next`, a stable release selecting `latest`, tag mismatch, GitHub prerelease mismatch, invalid SemVer, and repository mismatch.
2. Run `npm test -- tests/release.test.ts` and verify it fails because the module is absent.
3. Implement a pure `planNpmRelease` function with explicit inputs and deterministic errors.
4. Run the focused test and verify it passes.

### Task 2: Add the workflow-facing release command

**Files:**
- Create: `scripts/prepare-npm-release.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

1. Add a `release:plan` script that reads `package.json`, validates two command arguments and `GITHUB_REPOSITORY`, prints the plan, and writes safe values to `GITHUB_OUTPUT` when available.
2. Add the exact repository, homepage, bugs, keywords, public registry, package manager, and `0.1.0-alpha.10` version metadata.
3. Run the command with matching and mismatching inputs to verify success and fail-closed behavior.

### Task 3: Add tokenless GitHub publishing

**Files:**
- Create: `.github/workflows/publish-npm.yml`

1. Trigger only on a published GitHub Release.
2. Pin checkout and setup-node actions, use Node 24 and npm 11.19.1, disable release-job caching, and grant only `contents: read` plus `id-token: write`.
3. Check out the release tag with full history and reject commits not reachable from `origin/main`.
4. Install with `npm ci --ignore-scripts`, execute `npm run ci`, validate release metadata, inspect `npm pack --dry-run`, and run `npm publish --access public --tag <next|latest>` without `NODE_AUTH_TOKEN`.
5. Bind the job to the `npm` GitHub Environment and disable concurrent publication of the same release.

### Task 4: Document setup, operation, and rollback

**Files:**
- Create: `docs/npm-release.md`
- Create: `docs/zh-CN/npm-release.md`
- Modify: `README.md`
- Modify: `README.zh-CN.md`
- Modify: `CHANGELOG.md`

1. Document the one-time 2FA bootstrap because npm requires the package to exist before OIDC trust can be configured.
2. Document the exact `npm trust github` command, GitHub Environment configuration, release checklist, `next`/`latest` behavior, verification, and recovery.
3. Link the guide from both READMEs and record the change under `Unreleased`.

### Task 5: Verify the release candidate

**Files:**
- Verify all files above.

1. Run the focused release tests.
2. Run `npm run ci`.
3. Run `npm run release:plan -- v0.1.0-alpha.10 true` with `GITHUB_REPOSITORY=WnagoiYy/skillpack-one`.
4. Run `npm pack --dry-run --json` and confirm the package name, version, CLI, documentation, and absence of temporary files.
5. Run `git diff --check` and inspect the final diff without publishing, tagging, or changing npm account state.

