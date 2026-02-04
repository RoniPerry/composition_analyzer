# BE-007: Improve Hostname Matching Logic

**Priority:** Medium
**Type:** Bug Fix
**Files:** `content.js` (getCurrentSiteConfig function)

## Problem

Site detection uses `hostname.includes(domain)` substring matching, which can produce false positives. For example, a domain key of `"co.com"` would match `"arco.com"`.

## Current Code

```javascript
function getCurrentSiteConfig() {
  const hostname = window.location.hostname;
  for (const [domain, config] of Object.entries(window.siteConfig)) {
    if (hostname.includes(domain)) return config;
  }
  return window.siteConfig.default;
}
```

## Expected Fix

Use proper domain matching - check that the hostname either equals the domain or ends with `.domain`:

```javascript
if (hostname === domain || hostname.endsWith('.' + domain))
```

## Acceptance Criteria

- [ ] `"hm.com"` matches `"www.hm.com"` and `"www2.hm.com"` (still works)
- [ ] `"co.com"` would NOT match `"arco.com"` (false positive fixed)
- [ ] `"zara.com"` matches `"www.zara.com"` (still works)
- [ ] All 17 configured sites still match correctly
- [ ] `default` config key is handled separately (not treated as a domain)
