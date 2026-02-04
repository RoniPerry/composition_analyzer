# BE-009: Add Unit Tests for Parsers

**Priority:** Medium
**Type:** Testing
**Files:** `parsers/utils/test.js` (expand), new test files as needed

## Problem

Test coverage is estimated at 15-20%. Only `normalizer.js` has tests. The parsers, content script logic, and scoring have no automated tests.

## Tests to Add

### zaraParser Tests
- [ ] Section header detection (OUTER SHELL, MAIN FABRIC, LINING, SHELL, etc.)
- [ ] Multi-section parsing (e.g., Shell + Lining in one block)
- [ ] Fallback to flat percentage extraction when no headers found
- [ ] Edge case: section header with no content after it
- [ ] Edge case: duplicate section headers

### unifiedParser Tests
- [ ] Keyword-based composition detection ("composition:", "materials:", "fabric:")
- [ ] Parent element walking behavior
- [ ] Fallback aggregation logic
- [ ] Edge case: no composition found returns empty/null

### Score Calculation Tests
- [ ] Single material scoring
- [ ] Weighted average with multiple materials
- [ ] Multiple components (Shell + Lining) scoring
- [ ] Edge case: unknown material handling
- [ ] Edge case: 0% material in composition

### Material Matching Tests
- [ ] Exact match lookup
- [ ] Word-order match (e.g., "organic cotton" vs "cotton organic")
- [ ] Special-case match (e.g., "lenzing ecovero viscose")
- [ ] Unknown material returns null/undefined

## Acceptance Criteria

- [ ] At least 20 new test cases added
- [ ] Tests can run in Node.js via `node parsers/utils/test.js`
- [ ] All tests pass
- [ ] Tests cover all 3 parsers (zara, unified) and scoring logic
- [ ] Test output clearly shows pass/fail with descriptive names
