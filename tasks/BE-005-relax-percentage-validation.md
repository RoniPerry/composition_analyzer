# BE-005: Relax Percentage Validation to Accept Partial Compositions

**Priority:** High
**Type:** Enhancement
**Files:** `parsers/utils/normalizer.js`

## Problem

The normalizer rejects any composition that doesn't sum to exactly 100% (within ±0.2% tolerance). This causes valid compositions to be discarded when:
- A material isn't recognized (e.g., "95% cotton, 5% other fibers")
- The site only shows major materials (e.g., "80% wool, 20% polyester blend")
- Rounding errors across multiple components

The current fallback tries all contiguous subsets, but this is limited and uses triple-nested loops.

## Expected Fix

1. Accept compositions where identified percentages sum to at least 90%
2. For partial matches (< 100%), calculate the score based on identified materials only, weighted by their relative proportions
3. Display "Unknown" for the unidentified remainder with a neutral indicator
4. Remove or simplify the triple-nested subset search loop

## Acceptance Criteria

- [ ] Compositions summing to 90-100% are accepted as-is
- [ ] Compositions summing to 80-89% are accepted with an "approximate" indicator
- [ ] Compositions below 80% still use the subset fallback
- [ ] Score calculation adjusts for partial compositions
- [ ] Add test cases for partial compositions
- [ ] Existing 100%-sum test cases still pass
