# Viewport-height Skill Browser workspace design

## Goal

Treat the desktop Skill Browser as one application workspace that fits inside the visible viewport. Remove the competing document scrollbar while preserving independent, predictable navigation through the catalog and long `SKILL.md` content.

## Desktop interaction

The page shell occupies `100vh` with `100dvh` as the dynamic-viewport enhancement. The top bar, compact library summary, browser, and footer share that single height. The browser consumes all remaining space through a `minmax(0, 1fr)` grid track. The document itself does not scroll; the catalog list and detail reader are the only vertical reading surfaces, and both contain overscroll instead of chaining it into the page.

Selecting a Skill resets the detail reader to its top without moving the surrounding application shell. This keeps the search controls, result list, and chosen detail visually anchored.

## Compact interaction

At widths up to 980 pixels, the fixed application shell is disabled. The document returns to natural scrolling, the catalog gets a bounded list area, and the detail expands in normal flow. Selecting a Skill scrolls the document to the detail. This avoids forcing two narrow scroll panes into a phone viewport and remains resilient to browser chrome changing the available mobile height.

## Verification

Layout regression tests assert the desktop viewport shell, bounded browser workspace, internal detail scrolling, compact document-scroll fallback, and the two selection behaviors. Existing browser-data, build, registry, and release gates remain unchanged.
