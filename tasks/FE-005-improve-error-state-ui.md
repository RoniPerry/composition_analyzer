# FE-005: Improve Error and Empty State UI

**Priority:** Medium
**Type:** Enhancement
**Files:** `content.js` (updateFloatingUI), `fabric-analysis-widget.css`

## Problem

When no composition is found or an error occurs, the widget shows a generic message with no actionable guidance. Users don't know if the page is unsupported, the selectors are broken, or the composition format is unrecognized.

## Expected Improvements

### "No Composition Found" State
- [ ] Show the site name that was detected (or "Unknown site")
- [ ] Show which parser was attempted
- [ ] Show how many DOM elements were checked
- [ ] Add suggestion text: "This page may not have fabric composition info, or the site layout may have changed."
- [ ] Add a "Try Again" button that re-runs the analysis

### Error State
- [ ] Show a user-friendly error message (not raw exception text)
- [ ] Categorize errors: "Page not loaded yet", "No product page detected", "Parser error"
- [ ] Add a "Retry" button

### Loading State (new)
- [ ] Show a brief loading indicator while analysis is running
- [ ] Especially important for COS where there's a 500ms delay

## Acceptance Criteria

- [ ] Each error state shows contextual, helpful information
- [ ] "Try Again" / "Retry" button re-triggers analysis
- [ ] Loading state visible during analysis
- [ ] No raw error messages shown to users
- [ ] Styling consistent with existing widget design
