# Third-party sources and notices

This repository's `catalog/` contains normalized metadata and attribution for third-party Agent Skills and MCP servers. It does not vendor their instruction bodies, source code, packages, or assets.

The fixed revisions, repositories, paths, detected license states, counts, and aggregate digest are recorded in `catalog/sources.yaml`, each `catalog/entries/*.yaml`, and `catalog/snapshots/manifest.yaml`.

Current Agent Skill source namespaces include Anthropic, Hugging Face, Trail of Bits, Addy Osmani, Obra, Cloudflare, Supabase, Sentry, K-Dense AI, and Hypergiant. MCP metadata comes from the official Model Context Protocol Registry. Each upstream work remains under its own license and copyright. A detected repository license is evidence, not legal advice; `unknown` means the content must not be copied into this project.

Primary source links:

- [Anthropic skills](https://github.com/anthropics/skills)
- [Hugging Face skills](https://github.com/huggingface/skills)
- [Trail of Bits skills](https://github.com/trailofbits/skills)
- [Addy Osmani agent skills](https://github.com/addyosmani/agent-skills)
- [Obra Superpowers marketplace](https://github.com/obra/superpowers-marketplace)
- [Cloudflare skills](https://github.com/cloudflare/skills)
- [Supabase agent skills](https://github.com/supabase/agent-skills)
- [Sentry skills](https://github.com/getsentry/skills)
- [K-Dense scientific skills](https://github.com/K-Dense-AI/claude-scientific-skills)
- [Hypergiant agent skills](https://github.com/gohypergiant/agent-skills)
- [Official MCP Registry](https://registry.modelcontextprotocol.io/)

The Pi adapter depends on `@earendil-works/pi-coding-agent` under its published package license. Dependency notices are available from the installed packages and lockfile.
