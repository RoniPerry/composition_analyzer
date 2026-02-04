# FE-003: Improve Widget Accessibility (WCAG AA)

**Priority:** Medium
**Type:** Enhancement
**Files:** `fabric-analysis-widget.css`, `content.js` (widget HTML generation)

## Problem

The widget uses gradient backgrounds and color-coded indicators without verifying WCAG AA contrast ratios. Screen readers have no semantic structure to navigate.

## Tasks

### Color Contrast
- [ ] Audit all text/background color combinations against WCAG AA (4.5:1 ratio for normal text, 3:1 for large text)
- [ ] Fix any failing combinations - adjust text color or background opacity
- [ ] Ensure score category colors (green/yellow/red) have sufficient contrast with their text

### Semantic HTML
- [ ] Add `role="dialog"` and `aria-label` to the widget container
- [ ] Add `aria-label` to the close button
- [ ] Add `role="list"` and `role="listitem"` to material lists
- [ ] Add `aria-live="polite"` to the score display so screen readers announce updates
- [ ] Add meaningful `alt` text if any images are used

### Keyboard Navigation
- [ ] Make the widget focusable (`tabindex="0"`)
- [ ] Add `Escape` key to close/minimize the widget
- [ ] Ensure all interactive elements are reachable via Tab key
- [ ] Add visible focus indicators

## Acceptance Criteria

- [ ] All text passes WCAG AA contrast ratio
- [ ] Widget is navigable via keyboard only
- [ ] Screen reader can announce widget content meaningfully
- [ ] Close button has accessible label
- [ ] No visual regression for sighted users
