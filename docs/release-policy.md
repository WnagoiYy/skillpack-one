# Release policy

Releases use Semantic Versioning. Research-stage builds use `vMAJOR.MINOR.PATCH-alpha.N` and remain GitHub prereleases until live task-completion evidence is certified.

A release requires a clean worktree, exact local/remote revision match, warning-free GitHub Actions on that revision, passing independent routing gates, current generated projections, official Skill/plugin validation, a dependency and secret scan, attribution checks, and an immutable annotated tag. Published tags are never moved; a correction receives a new prerelease number. The changelog records user-visible behavior and known evidence limits.
