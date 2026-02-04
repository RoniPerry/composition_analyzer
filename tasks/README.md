# Refactoring Tasks

## Backend / Logic Tasks (BE)

| ID | Title | Priority | Type |
|----|-------|----------|------|
| [BE-001](BE-001-fix-popup-dependency-injection.md) | Fix Popup Script Injection to Include All Dependencies | Critical | Bug Fix |
| [BE-002](BE-002-fix-hardcoded-percentage-check.md) | Remove Hard-coded Percentage Check in unifiedParser | Critical | Bug Fix |
| [BE-003](BE-003-fix-cos-blocking-preprocess.md) | Replace COS Synchronous Busy-Wait with Async Delay | Critical | Bug Fix |
| [BE-004](BE-004-consolidate-normalization-layers.md) | Consolidate Multiple Material Normalization Layers | High | Refactor |
| [BE-005](BE-005-relax-percentage-validation.md) | Relax Percentage Validation to Accept Partial Compositions | High | Enhancement |
| [BE-006](BE-006-expand-materials-database.md) | Expand Materials Database | High | Enhancement |
| [BE-007](BE-007-improve-site-detection-hostname-matching.md) | Improve Hostname Matching Logic | Medium | Bug Fix |
| [BE-008](BE-008-remove-dead-code.md) | Remove Dead Code | Medium | Cleanup |
| [BE-009](BE-009-add-parser-unit-tests.md) | Add Unit Tests for Parsers | Medium | Testing |
| [BE-010](BE-010-replace-fragile-selectors.md) | Replace Fragile CSS Selectors with Resilient Alternatives | High | Maintenance |
| [BE-011](BE-011-add-lenzing-ecovero-data-driven-matching.md) | Make Special-Case Material Matching Data-Driven | Low | Refactor |

## Frontend / UI Tasks (FE)

| ID | Title | Priority | Type |
|----|-------|----------|------|
| [FE-001](FE-001-split-content-js-into-modules.md) | Split content.js into Separate Modules | High | Refactor |
| [FE-002](FE-002-add-touch-support-to-widget-drag.md) | Add Touch Support for Widget Dragging | Medium | Enhancement |
| [FE-003](FE-003-improve-widget-accessibility.md) | Improve Widget Accessibility (WCAG AA) | Medium | Enhancement |
| [FE-004](FE-004-wire-up-bug-report-modal.md) | Wire Up Bug Report Modal or Remove It | Medium | Enhancement |
| [FE-005](FE-005-improve-error-state-ui.md) | Improve Error and Empty State UI | Medium | Enhancement |
| [FE-006](FE-006-add-popup-ui-feedback.md) | Add Visual Feedback to Extension Popup | Low | Enhancement |
| [FE-007](FE-007-add-minimize-collapse-to-widget.md) | Add Minimize/Collapse Toggle to Widget | Low | Enhancement |

## Suggested Execution Order

### Phase 1: Critical Fixes
1. BE-001 (popup injection)
2. BE-002 (hardcoded percentage)
3. BE-003 (COS blocking)

### Phase 2: High-Impact Refactors
4. BE-004 (consolidate normalization)
5. FE-001 (split content.js) — do this before other FE tasks
6. BE-010 (replace fragile selectors)
7. BE-005 (relax validation)
8. BE-006 (expand materials DB)

### Phase 3: Quality & Polish
9. BE-008 (remove dead code)
10. FE-004 (bug report modal — depends on BE-008 decision)
11. BE-007 (hostname matching)
12. BE-009 (unit tests)
13. FE-005 (error state UI)
14. FE-003 (accessibility)

### Phase 4: Nice-to-Haves
15. FE-002 (touch support)
16. FE-006 (popup feedback)
17. FE-007 (minimize widget)
18. BE-011 (data-driven matching)
