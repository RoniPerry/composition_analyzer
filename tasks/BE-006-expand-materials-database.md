# BE-006: Expand Materials Database

**Priority:** High
**Type:** Enhancement
**Files:** `parsers/utils/materials.js`

## Problem

The materials database only has 42 entries and is missing many common materials found on fashion retail sites.

## Missing Materials to Add

### Cotton Variants
- [ ] Pima Cotton (score ~80, sustainable)
- [ ] BCI Cotton (score ~70, sustainable)
- [ ] Supima Cotton (score ~80, sustainable)

### Recycled Variants
- [ ] Recycled Viscose (score ~70, sustainable)
- [ ] Recycled Polyamide (score ~55, sustainable)

### Natural Fibers
- [ ] Jute (score ~80, regenerative)
- [ ] Sisal (score ~75, regenerative)
- [ ] Abaca (score ~75, regenerative)
- [ ] Coir (score ~70, regenerative)

### Synthetic Variants
- [ ] Elastomultiester (score ~30, synthetic)
- [ ] Modacrylic (score ~30, synthetic)
- [ ] Elastodiene (score ~25, synthetic)

### Branded/Specialty
- [ ] Tencel Modal (score ~80, sustainable) - distinct from plain Modal
- [ ] Sorona (score ~65, moderate)
- [ ] Econyl (score ~70, sustainable)
- [ ] Repreve (score ~65, sustainable)
- [ ] Pinatex (score ~80, regenerative)

## Data Quality Fixes

- [ ] Consolidate "mako cotton" (line 187) and "makò cotton" (line 191) - keep one entry, handle accented version in normalization
- [ ] Verify all scores against current sustainability benchmarks
- [ ] Add inline comments explaining non-obvious score choices

## Acceptance Criteria

- [ ] At least 15 new materials added
- [ ] No duplicate entries (check for accented variants)
- [ ] Each entry has correct score and category
- [ ] All existing tests still pass
- [ ] Add test cases for new materials in `test.js`
