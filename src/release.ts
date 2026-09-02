const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;

export interface NpmReleaseInput {
  packageName: string;
  version: string;
  repositoryUrl: string;
  githubRepository: string;
  releaseTag: string;
  githubPrerelease: boolean;
}

export interface NpmReleasePlan {
  packageName: string;
  version: string;
  releaseTag: string;
  npmTag: "next" | "latest";
}

export function planNpmRelease(input: NpmReleaseInput): NpmReleasePlan {
  if (!input.packageName.trim()) throw new Error("package name must not be empty");
  const semver = SEMVER.exec(input.version);
  if (!semver) throw new Error(`package version ${input.version} is not valid SemVer`);

  const expectedTag = `v${input.version}`;
  if (input.releaseTag !== expectedTag) {
    throw new Error(`release tag ${input.releaseTag} must exactly equal ${expectedTag}`);
  }

  const isPrerelease = semver[4] !== undefined;
  if (input.githubPrerelease !== isPrerelease) {
    throw new Error(
      `GitHub prerelease flag ${input.githubPrerelease} disagrees with package version ${input.version}`
    );
  }

  const expectedRepositoryUrl = `git+https://github.com/${input.githubRepository}.git`;
  if (input.repositoryUrl !== expectedRepositoryUrl) {
    throw new Error(`repository.url must exactly equal ${expectedRepositoryUrl}`);
  }

  return {
    packageName: input.packageName,
    version: input.version,
    releaseTag: input.releaseTag,
    npmTag: isPrerelease ? "next" : "latest"
  };
}
