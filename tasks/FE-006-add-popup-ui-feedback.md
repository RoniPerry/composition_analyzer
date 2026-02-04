# FE-006: Add Visual Feedback to Extension Popup

**Priority:** Low
**Type:** Enhancement
**Files:** `popup.html`, `popup.js`, `extension-popup.css`

## Problem

The popup immediately closes after clicking "Analyze", giving no feedback on whether analysis succeeded or failed. If the content script injection fails, the user sees nothing.

## Expected Improvements

- [ ] Show a brief "Analyzing..." state before closing the popup
- [ ] If injection fails, show an error message IN the popup instead of silently failing
- [ ] If the page is not a product page, show "This doesn't appear to be a product page" in the popup
- [ ] Add a small status indicator showing if the content script is already loaded on the current page

## Acceptance Criteria

- [ ] User sees feedback when clicking "Analyze"
- [ ] Error states shown in popup, not silently swallowed
- [ ] Popup auto-closes only on successful analysis trigger
- [ ] Styling consistent with existing popup design
