# FE-004: Wire Up Bug Report Modal or Remove It

**Priority:** Medium
**Type:** Enhancement / Cleanup
**Depends on:** BE-008 (decision on whether to keep `showBugReportForm`)
**Files:** `content.js`, `fabric-analysis-widget.css`

## Problem

The bug report modal code exists in `content.js` (~lines 483-594) with full HTML generation and styling in `fabric-analysis-widget.css`, but it's never connected to any UI element. Users have no way to trigger it.

## Option A: Wire It Up

- [ ] Add a small "Report Issue" button/link in the widget footer
- [ ] Connect button click to `showBugReportForm()`
- [ ] Pre-populate the form with: current URL, detected site config, raw composition text found
- [ ] Add a submission mechanism (e.g., open a pre-filled GitHub issue, or mailto: link)
- [ ] Style the button to be unobtrusive

## Option B: Remove It

- [ ] Delete `showBugReportForm()` from `content.js`
- [ ] Delete associated CSS rules from `fabric-analysis-widget.css`
- [ ] Remove any HTML template strings related to the modal

## Acceptance Criteria (Option A)

- [ ] "Report Issue" button visible in widget
- [ ] Clicking opens modal with pre-filled context
- [ ] User can submit/send the report
- [ ] Modal closes cleanly
- [ ] Styling is consistent with rest of widget

## Acceptance Criteria (Option B)

- [ ] All dead code removed
- [ ] No orphaned CSS rules
- [ ] Extension still works correctly
