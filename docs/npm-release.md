# Publishing SkillPack One to npm

SkillPack One publishes from a reviewed GitHub Release through npm Trusted Publishing. The permanent workflow uses short-lived OIDC credentials, not a repository `NPM_TOKEN`, and npm automatically attaches provenance for a public package built from this public repository.

## What the workflow enforces

`.github/workflows/publish-npm.yml`:

- runs only when a GitHub Release is published;
- requires the tagged commit to be reachable from `origin/main`;
- requires the tag to equal `v<package.json version>` exactly;
- requires GitHub's prerelease flag to agree with SemVer;
- maps prereleases to npm tag `next` and stable versions to `latest`;
- runs `npm run ci` and `npm pack --dry-run` before publishing;
- uses a GitHub-hosted runner, an `npm` deployment environment, and only `contents: read` plus `id-token: write`;
- installs dependencies with lifecycle scripts disabled and disables package-manager caching in the privileged publish job.

## One-time bootstrap for a new npm package

npm requires a package to exist before a Trusted Publisher can be configured. At the time this guide was written, `skillpack-one` was not registered. The first version must therefore be created once by a maintainer with npm account-level 2FA.

1. Merge the release commit containing version `0.1.0-alpha.10` into `main`, then create and push the exact tag without publishing a GitHub Release for this bootstrap version:

   ```sh
   git tag -a v0.1.0-alpha.10 -m "SkillPack One v0.1.0-alpha.10"
   git push origin v0.1.0-alpha.10
   ```

2. From a clean checkout of that tag, authenticate interactively and verify the exact payload:

   ```sh
   npm install --global npm@11.19.1
   npm login
   npm ci --ignore-scripts
   npm run ci
   npm pack --dry-run
   npm publish --access public --tag next
   ```

3. Confirm `https://www.npmjs.com/package/skillpack-one` shows `0.1.0-alpha.10` under `next`. Do not create a GitHub Release for this already-published bootstrap version because the automated workflow correctly rejects immutable duplicate versions.

## Configure tokenless publishing

1. In GitHub repository settings, create an Environment named exactly `npm`. Add required reviewers and restrict deployment to protected release tags as appropriate for the repository.
2. With npm 11.19.1 or newer and account-level 2FA enabled, configure the package trust relationship:

   ```sh
   npm login
   npm trust github skillpack-one \
     --repo WnagoiYy/skillpack-one \
     --file publish-npm.yml \
     --env npm \
     --allow-publish
   ```

   The filename and Environment name are case-sensitive. The workflow file must already exist on the default branch.
3. Verify the relationship with `npm trust list skillpack-one` or in npm package settings under **Trusted publishing**.
4. After one successful automated release, set npm **Publishing access** to **Require two-factor authentication and disallow tokens**, then revoke obsolete write tokens.
5. Protect `v*` tags in GitHub so unreviewed commits cannot create release candidates.

## Normal release

1. Update `package.json`, `package-lock.json`, and `CHANGELOG.md` in a reviewed pull request. Never reuse a published version.
2. Merge the pull request into `main` and wait for CI.
3. Create an exact `v<version>` tag from that `main` commit.
4. Publish a GitHub Release for the tag. Mark it as a prerelease if and only if the package version contains a SemVer prerelease suffix.
5. Approve the `npm` Environment deployment. The workflow publishes prereleases under `next` and stable versions under `latest`.
6. Verify the package and its provenance:

   ```sh
   npm view skillpack-one version dist-tags repository --json
   npm install --global skillpack-one@next
   skillpack --version
   npm audit signatures
   ```

## Failure and rollback

- If validation fails before `npm publish`, fix the source, assign a new version, and publish another GitHub Release. Do not rerun after changing the contents behind an existing tag.
- npm package versions are immutable. A bad release is replaced by a corrective version, not overwritten.
- With interactive 2FA, mark a known-bad version using `npm deprecate skillpack-one@<version> "<reason>"`.
- Restore a dist-tag with `npm dist-tag add skillpack-one@<known-good-version> next` or `latest`, then publish a corrected version.
- Avoid `npm unpublish` except for a narrowly justified security emergency; even unpublished name/version pairs cannot be reused.

For a stricter future posture, change the trusted publisher to stage-only permission and replace `npm publish` with `npm stage publish`. npm then requires a separate 2FA approval before public availability. This cannot bootstrap a brand-new package.

Official references: [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/), [`npm trust`](https://docs.npmjs.com/cli/v11/commands/npm-trust/), [npm provenance](https://docs.npmjs.com/generating-provenance-statements/), and [GitHub package publishing](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages).

