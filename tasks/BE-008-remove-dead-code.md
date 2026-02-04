# BE-008: Remove Dead Code

**Priority:** Medium
**Type:** Cleanup
**Files:** `content.js`, `popup.js`

## Problem

Several functions are defined but never called, adding confusion and maintenance burden.

## Dead Code to Remove

### content.js
- [ ] `getScoreLevel()` function (~line 55) - defined but never called anywhere
- [ ] `showBugReportForm()` function (~lines 483-594) - defined, modal HTML built, but never wired to any button/event. Either integrate it or remove it.

### popup.js
- [ ] `getScoreLevel()` function (~line 55) - duplicate of the one in content.js, also never called

## Decision Required

For `showBugReportForm()`: Is bug reporting a desired feature?
- If YES -> Create separate task (FE task) to wire it up to a button in the widget
- If NO -> Remove the entire function and associated CSS styles in `fabric-analysis-widget.css`

## Acceptance Criteria

- [ ] `getScoreLevel()` removed from both `content.js` and `popup.js`
- [ ] Decision made on `showBugReportForm()` and action taken
- [ ] No other code references the removed functions
- [ ] Extension still works correctly after removal
