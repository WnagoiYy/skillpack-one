# Skill Browser Web Design

## Product decision

SkillPack One needs a small working surface for maintainers and users who want to understand the repository without reading YAML by hand. The primary flow is: open the page, see the current library totals, filter by Skill kind or category, search by name or capability, select a result, and read both its structured metadata and canonical `SKILL.md` content. The four example areas remain ordinary taxonomy entries; the interface must derive all filters from repository data so newly added categories appear automatically.

Three implementation approaches were considered. A server that reads the filesystem dynamically would always be fresh but would require a long-running backend. A React/Vite application would offer more component structure but add a second dependency stack for a deliberately small viewer. The selected approach is a generated static single-page application: a TypeScript build script reads canonical `skill-src` contracts and Markdown, writes a compact JSON snapshot, and plain HTML/CSS/JavaScript renders it. This keeps deployment simple, works offline, and makes stale generated data detectable in CI.

## Interface and behavior

The visual direction is a restrained light “reference desk”: warm paper-white background, ink text, blue functional accent, fine borders, compact cards, and generous reading space. The first viewport contains the title, repository summary, search field, kind filters, category selector, and useful results. Desktop uses a list/detail split; smaller screens stack the detail below the list. Search covers IDs, localized names, summaries, categories, triggers, and Markdown content. Keyboard users can focus every result, Escape clears search, and the detail panel exposes a direct GitHub source link.

Empty search results provide a reset action. Missing optional contract fields render as absent rather than invented values. Generated JSON is treated as display-only data, with Markdown shown as escaped source text to avoid executing repository content. Tests cover deterministic generation, complete Skill coverage, and absence of embedded script termination sequences. The repository build will generate the snapshot before serving or packaging the static site.
