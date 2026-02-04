# BE-003: Replace COS Synchronous Busy-Wait with Async Delay

**Priority:** Critical
**Type:** Bug Fix / Performance
**Files:** `siteConfig.js` (COS config entry)

## Problem

The COS site config includes a `preProcess` function that uses a synchronous busy-wait loop to pause for 500ms. This blocks the main thread and freezes the page during analysis.

## Current Code

```javascript
preProcess: function() {
  const start = Date.now();
  while (Date.now() - start < 500) { }
}
```

## Expected Fix

Convert to an async approach. Options:
1. Make `preProcess` return a Promise and `await` it in the caller
2. Use `setTimeout` with a callback
3. Use `requestAnimationFrame` + timestamp check

## Acceptance Criteria

- [ ] `preProcess` no longer blocks the main thread
- [ ] The delay still works - COS content is visible before parsing begins
- [ ] The caller (`content.js`) properly awaits the async preProcess
- [ ] If `preProcess` is made async, ensure backward compatibility with sites that don't define `preProcess`
- [ ] Test on cos.com with a real product page to verify composition is still found
