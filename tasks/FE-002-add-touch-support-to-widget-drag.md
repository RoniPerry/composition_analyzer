# FE-002: Add Touch Support for Widget Dragging

**Priority:** Medium
**Type:** Enhancement
**Files:** `content.js` (drag handling code), `fabric-analysis-widget.css`

## Problem

The floating widget uses `mousedown`/`mousemove`/`mouseup` for dragging. This doesn't work on touch devices (mobile browsers, tablets).

## Expected Fix

Add touch event equivalents alongside mouse events:
- `touchstart` alongside `mousedown`
- `touchmove` alongside `mousemove`
- `touchend` alongside `mouseup`

Use `event.touches[0]` to get coordinates from touch events.

## Additional Improvements

- [ ] Add boundary constraints so the widget can't be dragged off-screen
- [ ] Persist widget position in `localStorage` so it survives page reloads
- [ ] Add a "snap to corner" behavior when released near a screen edge

## Acceptance Criteria

- [ ] Widget is draggable on touch devices
- [ ] Widget cannot be dragged outside the viewport
- [ ] Widget position persists across page reloads (optional, nice-to-have)
- [ ] No visual or behavioral regression on desktop
- [ ] Touch events don't conflict with scroll behavior
