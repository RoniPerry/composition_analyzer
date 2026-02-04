# FE-007: Add Minimize/Collapse Toggle to Widget

**Priority:** Low
**Type:** Enhancement
**Files:** `content.js` (createFloatingUI), `fabric-analysis-widget.css`

## Problem

The floating widget takes up screen space and can overlap important product page content. Users can drag it but cannot minimize it.

## Expected Implementation

- [ ] Add a minimize button (e.g., `—` icon) next to the close button in the widget header
- [ ] When minimized, collapse to just the header bar (showing score badge + expand button)
- [ ] When expanded, show full content as currently
- [ ] Remember minimize state in `localStorage` per domain
- [ ] Smooth CSS transition for collapse/expand animation

## Acceptance Criteria

- [ ] Minimize button visible in widget header
- [ ] Click toggles between collapsed and expanded states
- [ ] Collapsed state shows score and expand button only
- [ ] State persists across page navigation on same domain
- [ ] Smooth animation (CSS transition, not jumpy)
- [ ] Dragging still works in both states
