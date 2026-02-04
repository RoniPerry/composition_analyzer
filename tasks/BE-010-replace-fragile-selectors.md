# BE-010: Replace Fragile CSS Selectors with Resilient Alternatives

**Priority:** High
**Type:** Enhancement / Maintenance
**Files:** `siteConfig.js`

## Problem

Several site configs rely on CSS selectors that are known to break when sites redeploy:

| Site | Selector Issue | Risk |
|------|---------------|------|
| H&M | Obfuscated class `.fddca0` | HIGH - hash changes on redeploy |
| ASOS | Obfuscated class `.F_yfF` | HIGH - hash changes on redeploy |
| Farfetch | CSS Modules hash `ltr-4y8w0i-Body` | HIGH - hash changes on redeploy |
| Farfetch | `nth-child` positional selectors | CRITICAL - breaks on DOM changes |
| St. Agni | `body > div:nth-child(11) > ...` | CRITICAL - breaks on DOM changes |
| COS | React ID `disclosure-:rp:` | MEDIUM - varies with React version |

## Tasks Per Site

### H&M (`hm.com`)
- [ ] Visit hm.com product page, inspect current DOM for composition section
- [ ] Find stable selectors (data attributes, semantic class names, ARIA labels)
- [ ] Add new stable selectors as PRIMARY, keep `.fddca0` as last fallback
- [ ] Document the new selectors

### ASOS (`asos.com`)
- [ ] Visit asos.com product page, inspect current DOM
- [ ] Find stable selectors (look for `[data-testid]`, semantic elements)
- [ ] Add new stable selectors, keep `.F_yfF` as fallback
- [ ] Document the new selectors

### Farfetch (`farfetch.com`)
- [ ] Visit farfetch.com product page, inspect current DOM
- [ ] Replace CSS Modules hash selectors with stable alternatives
- [ ] Replace `nth-child` selectors with semantic ones
- [ ] Document the new selectors

### St. Agni (`stagni.com`)
- [ ] Visit stagni.com product page, inspect current DOM
- [ ] Replace `body > div:nth-child(11) > ...` with semantic selector
- [ ] Document the new selectors

### COS (`cos.com`)
- [ ] Visit cos.com product page, inspect current DOM
- [ ] Find alternative to `disclosure-:rp:` React ID
- [ ] Look for ARIA attributes or data attributes instead
- [ ] Document the new selectors

### SSENSE (`ssense.com`)
- [ ] Verify `full-wdith` typo still exists in their code
- [ ] Add fallback for when/if they fix the typo to `full-width`
- [ ] Document the finding

## Acceptance Criteria

- [ ] Each fragile selector has at least one stable alternative added BEFORE it in the array
- [ ] Existing fragile selectors kept as last-resort fallbacks (don't remove them)
- [ ] Each site tested with a real product page to verify new selectors work
- [ ] Comments in `siteConfig.js` noting which selectors are fragile and why
