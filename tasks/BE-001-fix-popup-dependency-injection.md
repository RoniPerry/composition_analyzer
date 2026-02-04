# BE-001: Fix Popup Script Injection to Include All Dependencies

**Priority:** Critical
**Type:** Bug Fix
**Files:** `popup.js`

## Problem

When the user clicks the extension icon and the content script hasn't been preloaded by the manifest, `popup.js` only injects `content.js` via `chrome.scripting.executeScript`. It does NOT inject the dependency files (`materials.js`, `normalizer.js`, `unifiedParser.js`, `zaraParser.js`, `siteConfig.js`), so `content.js` will fail silently because `window.MATERIALS`, `window.normalizeCompositionText`, etc. are undefined.

## Current Code (popup.js)

```javascript
chrome.scripting.executeScript({
  target: { tabId: tabs[0].id },
  files: ['content.js']
});
```

## Acceptance Criteria

- [ ] When popup triggers fallback injection, ALL dependency files are injected in the correct order matching `manifest.json`
- [ ] Injection order: `materials.js` -> `normalizer.js` -> `unifiedParser.js` -> `zaraParser.js` -> `siteConfig.js` -> `content.js`
- [ ] The `analyze` message is only sent AFTER all scripts have been injected
- [ ] If any injection fails, show a user-friendly error in the popup
- [ ] Test: Open a non-matching page, click extension icon, verify analysis still works
