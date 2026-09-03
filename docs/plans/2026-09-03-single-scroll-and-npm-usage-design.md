# Single-scroll Skill Browser and npm usage design

> Superseded on desktop by [Viewport-height Skill Browser workspace design](./2026-09-03-viewport-browser-workspace-design.md). The npm usage guidance remains current.

## Goal

Remove the competing page and detail-pane vertical scrollbars while preserving fast navigation through the 106-Skill catalog. Make npm installation understandable without requiring readers to infer the difference between the prerelease channel, the CLI package, and project-local Skill installation.

## Interaction

The document becomes the only reading scroll surface. On desktop, the catalog remains a sticky navigation column with its own bounded list because rendering more than one hundred cards into the document flow would make selection impractical. The detail column no longer owns a scrollbar and expands naturally with `SKILL.md`. Selecting a catalog entry scrolls the new detail to a top position below the sticky header, with reduced-motion preferences respected. On narrower layouts, the catalog returns to normal document flow above the detail and keeps a bounded list height.

## Documentation

Both English and Chinese READMEs show the same user journey: install the `@next` prerelease globally, verify `skillpack --version`, run `skillpack install` in a Codex project, and then route or compose a request. A no-global-install `npm exec` path, custom target, explicit conflict overwrite, update, uninstall, and future stable-channel guidance make package lifecycle behavior explicit.

## Verification

Automated layout checks prevent the fixed viewport-height shell and detail `overflow-y` scrollbar from returning. Existing unit, registry, browser-data, build, and release gates remain unchanged.
