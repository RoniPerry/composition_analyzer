# BE-002: Remove Hard-coded Percentage Check in unifiedParser

**Priority:** Critical
**Type:** Bug Fix
**Files:** `parsers/unifiedParser.js` (line ~67)

## Problem

The DOM parent-walking logic in `unifiedParser.js` uses a hard-coded check for specific percentage values (`67%` and `33%`) to decide when to stop walking up the DOM tree. This means the parser only works correctly for compositions containing those exact percentages.

## Current Code

```javascript
while (parentElement && !aggregated.includes('67%') && !aggregated.includes('33%'))
```

## Expected Fix

Replace the hard-coded percentage check with a generic composition pattern detector. For example, check if the aggregated text matches a valid composition pattern like `\d+%\s+\w+`.

## Acceptance Criteria

- [ ] Remove hard-coded `67%` and `33%` references
- [ ] Replace with a regex check for valid composition patterns (e.g., `\d+%`)
- [ ] Add a maximum depth limit to prevent infinite DOM walking (e.g., 5 levels)
- [ ] Verify that existing test cases still pass
- [ ] Test on at least 3 different sites that use `unifiedParser` (e.g., ASOS, Nordstrom, Mango)
