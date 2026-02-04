# BE-004: Consolidate Multiple Material Normalization Layers

**Priority:** High
**Type:** Refactor
**Files:** `content.js`, `parsers/utils/normalizer.js`

## Problem

Material name normalization happens in 3 separate places, creating inconsistency and maintenance burden:

1. **`normalizeCompositionText()`** in `normalizer.js` - main pipeline
2. **`normalizeMaterialName()`** in `content.js` - synonym translation (e.g., "elastane" -> "spandex")
3. **`materialMap`** synonym dictionary in `content.js`

## Expected Fix

Merge all normalization into a single function in `normalizer.js`:
- Move the synonym map from `content.js` into `normalizer.js`
- Make `normalizeCompositionText()` call the synonym resolution as part of its pipeline
- Remove `normalizeMaterialName()` and `materialMap` from `content.js`
- `content.js` should only call `matchMaterialInfo()` on already-normalized output

## Acceptance Criteria

- [ ] Single normalization entry point in `normalizer.js`
- [ ] Synonym map moved from `content.js` to `normalizer.js`
- [ ] `normalizeMaterialName()` removed from `content.js`
- [ ] All existing test cases in `test.js` still pass
- [ ] Add test cases for synonym resolution (elastane -> spandex, etc.)
- [ ] Multi-language material names still resolve correctly
