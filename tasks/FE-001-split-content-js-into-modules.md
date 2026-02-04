# FE-001: Split content.js into Separate Modules

**Priority:** High
**Type:** Refactor
**Files:** `content.js` (22KB), `manifest.json`

## Problem

`content.js` is a 22KB monolith handling 4 distinct responsibilities:
1. Product page detection
2. Site config lookup and DOM querying
3. UI widget creation and management (dragging, styling, updates)
4. Score calculation and material matching

This makes the file hard to maintain, test, and reason about.

## Proposed Module Split

### `pageDetector.js` (new)
- `isProductPage()` function
- URL pattern matching
- DOM heuristic checks
- Exports: `isProductPage()`

### `compositionFinder.js` (new)
- `getCurrentSiteConfig()` function
- `findCompositionSections()` function
- DOM querying and deduplication logic
- Exports: `getCurrentSiteConfig()`, `findCompositionSections()`

### `scorer.js` (new)
- `matchMaterialInfo()` function
- `normalizeMaterialName()` function (until BE-004 consolidates it)
- Score calculation logic (weighted average)
- Exports: `matchMaterialInfo()`, `calculateScore()`

### `widget.js` (new)
- `createFloatingUI()` function
- `updateFloatingUI()` function
- Drag handling logic
- Bug report modal (if kept per BE-008)
- Exports: `createFloatingUI()`, `updateFloatingUI()`

### `content.js` (reduced to orchestrator)
- Import/coordinate the above modules
- Initialize on page load
- Handle messages from popup
- ~50 lines max

## Acceptance Criteria

- [ ] `content.js` reduced to orchestration only (<100 lines)
- [ ] Each new module has a single, clear responsibility
- [ ] `manifest.json` updated with new files in correct load order
- [ ] All modules communicate via function calls, not global state (where possible)
- [ ] Extension works identically to before the split
- [ ] No visual or behavioral changes
