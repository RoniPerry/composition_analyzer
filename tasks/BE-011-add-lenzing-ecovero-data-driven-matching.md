# BE-011: Make Special-Case Material Matching Data-Driven

**Priority:** Low
**Type:** Refactor
**Files:** `content.js` (matchMaterialInfo function)

## Problem

The `matchMaterialInfo()` function has a hard-coded special case for "lenzing ecovero" (checks if a multi-word material name's words appear in the input regardless of order). This should be data-driven so other multi-word materials are handled the same way.

## Current Code

```javascript
// Special case: hard-coded check for "lenzing ecovero"
if (materialName.includes('lenzing') && materialName.includes('ecovero')) { ... }
```

## Expected Fix

1. Add a `multiWord: true` flag to materials in `materials.js` that have multi-word names
2. In `matchMaterialInfo()`, loop through all multi-word materials and check if all words appear in the input
3. Remove the hard-coded "lenzing ecovero" check

## Materials That Need `multiWord` Flag

- Lenzing Ecovero Viscose
- Organic Cotton
- Organic Linen
- Mako Cotton / Makò Cotton
- Recycled Cotton, Recycled Wool, Recycled Cashmere, etc.

## Acceptance Criteria

- [ ] No hard-coded material names in `matchMaterialInfo()`
- [ ] Multi-word matching is driven by the materials database
- [ ] "Viscose Lenzing Ecovero" still matches "Lenzing Ecovero Viscose"
- [ ] All existing test cases still pass
- [ ] Add test cases for word-order matching of other multi-word materials
