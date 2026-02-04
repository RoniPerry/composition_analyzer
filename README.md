# Fabric Composition Analyzer Chrome Extension

A Chrome extension (Manifest V3) that automatically detects fabric composition on fashion product pages and displays a floating sustainability analysis widget directly on the page. Currently in **beta**.

## Features

- Automatically detects product pages and extracts fabric composition data
- Displays a draggable, floating analysis widget injected into the page itself (not inside the browser popup)
- Provides an overall sustainability score on a **0-10 scale**, color-coded green (>5), orange (=5), or red (<5)
- Breaks down materials by garment component (e.g., Main Fabric, Shell, Outer Shell, Lining, Pocket Lining, Trim, Self 1, Self 2, Embellishment)
- Color-codes individual materials by sustainability category
- Normalizes material names across languages (English, French, Italian, Spanish, German) and handles trademark symbols
- Recognizes multi-word and branded materials such as Lenzing Ecovero Viscose, RWS Wool, Mako Cotton, and Pinatex
- Supports both percentage-first ("55% cotton") and material-first ("Cotton 55%") composition formats
- Includes a bug report feature (email link) on every widget state
- Shows a beta disclaimer via an info button

## Supported Sites

The extension includes site-specific configurations with tailored CSS selectors and parsers for 17 fashion sites, plus a default fallback for any other site. Each site entry in `siteConfig.js` specifies an ordered list of CSS selectors (tried from top to bottom) and a parser function. Two parsers exist:

- **zaraParser** -- designed for section-header composition layouts (e.g., "OUTER SHELL ... MAIN FABRIC ... LINING ..."). It splits text by uppercase section headers using the regex pattern `/(OUTER\s*SHELL|MAIN\s*FABRIC|EMBELLISHMENT|LINING|SHELL|FABRIC):?\s*/gi` and falls back to flat percentage-material extraction when no headers are found. Used by Zara, H&M, and COS.
- **unifiedParser** -- a general-purpose parser that first searches the element text for composition keywords (prefixes like "composition:", "materials:", "fabric:", or percentage-fabric patterns), then delegates to the normalizer. If the matched element contains only a section header (e.g., "Pocket lining:"), it walks up the DOM tree to find a parent element with the full composition text. If initial normalization fails, it falls back to aggregating the parent element's text. Used by all other sites and the default fallback.

### Site-by-Site Reference

The table below lists every configured site, the parser it uses, the primary CSS selectors the extension tries, and any site-specific quirks.

| Site | Config key | Parser | Primary selectors | Notes / Quirks |
|---|---|---|---|---|
| [Zara](https://www.zara.com) | `zara.com` | zaraParser | `div.composition span`, `div._composition-info`, `[data-qa-label='composition']`, `.product-detail-composition` | Composition appears inside `<span>` elements within a `div.composition` container. Text may contain uppercase section headers (OUTER SHELL, MAIN FABRIC, EMBELLISHMENT, LINING). Product page URLs match `/p\d{8}\.html/`. |
| [H&M](https://www2.hm.com) | `hm.com` | zaraParser | `div[class='fddca0']`, `[class*='materialsAndSuppliersAccordion']`, `div[class*='composition']` | Primary selector targets an obfuscated class name (`fddca0`) that H&M uses for the composition container. Multiple fallback selectors cover various H&M page redesigns (`.PdpComposition`, `.product-detail-main .materials`, etc.). Uses zaraParser because H&M can present section-header text similar to Zara. |
| [COS](https://www.cos.com) | `cos.com` | zaraParser | `div[id='disclosure-:rp:']`, `div[id='disclosure-:rt:']`, `[class*='materials']` | **Has a `preProcess` function** -- the only site with this feature. Before parsing, it appends `#product-description` to the URL hash if not already present, then waits 500ms for the materials panel to expand. The disclosure panel IDs (`:rp:`, `:rt:`) are React-generated and may change across deployments. Composition text typically uses section headers like "Shell: ... Lining: ...". |
| [Arket](https://www.arket.com) | `arket.com` | unifiedParser | `ul.list-none.gap-4 span.font-regular.bg-transparent.text-black.text-16.leading-22`, `.product-info__list [class*='composition']` | Primary selector is very specific, targeting utility-class-styled `<span>` elements inside an unordered list. The unifiedParser includes a parent-element fallback specifically useful for Arket, where composition data may be split across sibling nodes. |
| [Mango](https://www.mango.com) | `mango.com` | unifiedParser | `div#composition-info`, `div.productComposition`, `.product-features-list [class*='composition']` | Targets a dedicated `#composition-info` div. Relatively straightforward structure. |
| [Uniqlo](https://www.uniqlo.com) | `uniqlo.com` | unifiedParser | `div.product-specs`, `.product-composition`, `.product-info-content [class*='composition']` | Composition lives inside a `.product-specs` container. |
| [ASOS](https://www.asos.com) | `asos.com` | unifiedParser | `div[id='productDescriptionAboutMe'] div[class='F_yfF']`, `[data-testid='product-information-accordion'] [class*='composition']`, `ul#product-details li` | Primary selector uses an obfuscated class (`F_yfF`) inside the "About Me" section. Extensive fallback selectors cover ASOS's accordion-based product details. Product page URLs match `/prd/\d+/`. Has the most fallback selectors of any site (12 total), including broad catches like `[class*='composition']` and `[class*='material']`. |
| [Net-a-Porter](https://www.net-a-porter.com) | `net-a-porter.com` | unifiedParser | `div.product-info__composition`, `.product-details__composition`, `[data-testid*='product-details'] [class*='composition']` | Targets well-named semantic class selectors. |
| [Farfetch](https://www.farfetch.com) | `farfetch.com` | unifiedParser | `span[data-component='Body'][class*='ltr-4y8w0i-Body']`, `div[class*='ltr-92qs1a'] span[data-component='Body']` | Uses CSS Modules-style hashed class names (`ltr-4y8w0i-Body`, `ltr-92qs1a`), which are fragile and may break when Farfetch redeploys. Also includes a very long positional nth-child selector as a legacy fallback. Product page URLs match `/shopping/[^\/]+\/[^\/]+/`. |
| [St. Agni](https://www.stagni.com) | `stagni.com` | unifiedParser | `div[id='st-details_0-1'] div[class='station-tabs-content-inner']`, `.ProductMeta__Description.sts` | Includes an extremely long positional nth-child selector as the primary (most specific) selector. Also targets a Shopify-style `station-tabs-content-inner` class. The last fallback (`ul li`) is very broad. |
| [SSENSE](https://www.ssense.com) | `ssense.com` | unifiedParser | `div.pdp-scroll__column-content--full-wdith.pdp-scroll__column-content--left div.s-column.pdp-product-description div div.s-row span p.s-text` | Primary selector is a deeply nested descendant chain. Note the typo in SSENSE's own class name: `full-wdith` (missing an 'i'). |
| [Matches Fashion](https://www.matchesfashion.com) | `matchesfashion.com` | unifiedParser | `.product-details__info`, `[data-testid*='product-details'] [class*='composition']` | Straightforward selectors targeting product detail info containers. |
| [Nordstrom](https://www.nordstrom.com) | `nordstrom.com` | unifiedParser | `.product-details ul li`, `#product-details`, `[data-element-id*='product-details'] [class*='composition']` | Targets list items within a `.product-details` container. |
| [Revolve](https://www.revolve.com) | `revolve.com` | unifiedParser | `.product-details__list.u-margin-l--none li:first-child`, `.product-description`, `span.composition` | Multiple selectors try to isolate the first list item (which typically contains the fabric line) from the product details list. Has 14 fallback selectors total, the second most after ASOS. Revolve uses "Self 1" / "Self 2" section labels for multi-component garments. |
| [Frett](https://www.frett.life) | `frett.life` | unifiedParser | `div[data-block-id*='accordion'] p:first-child`, `div[data-block-type='accordion'] p:first-child`, `div.metafield-rich_text_field p` | Targets accordion-based product details. The `metafield-rich_text_field` class suggests a Shopify-based store. |
| [Massimo Dutti](https://www.massimodutti.com) | `massimodutti.com` | unifiedParser | `div.fabric-and-care p`, `div[class*='fabric'] p`, `div.outer-layer`, `div.outer-shell` | Part of the same parent company as Zara (Inditex) but uses the unifiedParser rather than zaraParser, because its DOM structure differs. Targets `fabric-and-care` paragraphs and explicit outer-layer/outer-shell containers. |
| [Tres TLV](https://www.trestlv.com) | `trestlv.com` | unifiedParser | `ul li` | Uses a very broad `ul li` selector as primary, relying entirely on the parser to filter for composition-relevant text (lines containing percentage-material patterns). |

### Default Fallback

Any site not listed above uses the `default` configuration, which employs the **unifiedParser** and a broad set of 16 generic selectors including:
- `div.Description`, `div[class*='description']` -- common product description containers
- `ul li` -- list items (filtered by the parser for composition text)
- `div.detail-content.mono`, `.detail-content.mono` -- detail content blocks
- `[class*='composition']`, `[class*='material']` -- any element with composition/material in its class
- `[data-qa-label*='composition']`, `[data-testid*='composition']`, `[data-test*='composition']` -- data-attribute patterns
- `.product-details li`, `.product-info li`, `.product-description li` -- product detail list items
- `.pdp-container [class*='composition']`, `.product-container [class*='composition']` -- PDP container children
- `.detail-trigger.uppercase + .detail-content` -- accordion-trigger patterns

## Material Categories and Scores

Each known material is assigned a sustainability score (0-100 internally) and placed into one of five categories:

| Category | Score Range | Examples |
|---|---|---|
| Regenerative | 70-95 | Cork (95), Hemp (90), Linen (85), Jute (85), Pinatex (85), Kapok (80), Ramie (75), Bamboo (70) |
| Sustainable | 65-85 | Tencel (85), Lyocell (85), Recycled Cotton (85), Recycled Wool (85), Organic Cotton (80), RWS Wool (80), Recycled Cashmere (80), Modal (75), Lenzing Ecovero (75), Econyl (75), Recycled Leather (75), Recycled Polyester (70), Recycled Down (70), Recycled Nylon (65) |
| Moderate | 45-65 | Wool (65), Cupro (65), Mako/Mako Cotton (65), Cotton (60), Viscose (45), Rayon (45) |
| Synthetic | 20-40 | Polyester (40), Acetate (40), Nylon (35), Polyamide (35), Triacetate (35), Elastane (30), Spandex (30), Polypropylene (30), Acrylic (25), Polyurethane (25), PVC (20) |
| Animal Welfare | 30-60 | Alpaca (60), Silk (55), Cashmere (50), Mohair (45), Leather (40), Down (35), Angora (30) |

The overall sustainability score shown in the widget is a weighted average of each material's score (weighted by its percentage in the garment), normalized to a 0-10 scale.

## Installation for Development/Testing

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the project directory
5. The extension icon should appear in your Chrome toolbar

## How It Works

### 1. Product Page Detection

The extension runs on **all URLs** (the manifest uses `<all_urls>` for content scripts). On every page load, the `isProductPage()` function decides whether to proceed with analysis. A page is considered a product page if either condition is met:

**URL pattern matching** -- any of these regex patterns match the current URL:
- `/\/p\/|\/product\/|\/item\/|\/goods\/|\/detail\/|\/productpage[\/\.]/i`
- `/\/products?\//i`
- `/\/shop\/[^\/]+\/[^\/]+$/i`
- `/-pid-/i`
- `/\/shopping\/[^\/]+\/[^\/]+/i` (Farfetch)
- `/p\d{8}\.html/i` (Zara)
- `/\/prd\/\d+/i` (ASOS)

**DOM heuristic** -- at least 2 of these product-indicator elements are found on the page:
- `button[class*="add-to-cart"]`
- `button[class*="buy-now"]`
- `div[class*="product-detail"]`
- `div[class*="product-info"]`
- `div[class*="product-description"]`
- `div[class*="product-composition"]`

### 2. Site Configuration Lookup

The hostname is stripped of the `www.` prefix and matched against `siteConfig.js` keys using `hostname.includes(domain)`. The first matching key wins. If no key matches, the `default` configuration is used. This substring-based matching means a config key like `hm.com` will match `www2.hm.com`, `hm.com`, or any subdomain.

If the matched config has a `preProcess` function (currently only COS), it is executed before DOM querying.

### 3. DOM Querying and Parsing

All CSS selectors for the matched site are joined with commas into a single `querySelectorAll` call. Every matched DOM element is passed individually to the site's parser function. The parser returns an array of `{ component, text }` objects (e.g., `{ component: "SHELL", text: "55% recycled polyester 45% rws wool" }`).

Duplicate sections (same component name and text) are automatically deduplicated using a JSON-serialized `Set`.

### 4. Text Normalization Pipeline

The normalizer (`parsers/utils/normalizer.js`) processes raw composition text through these steps:

1. **Prefix removal** -- strips leading "Composition:", "Materials:", or "Fabric:" labels
2. **Character cleanup** -- normalizes whitespace, non-breaking spaces, HTML entities, trademark/copyright symbols, and Unicode dashes to ASCII equivalents
3. **Diacritic removal** -- uses Unicode NFD normalization to strip accents (e.g., "mako" from "mako", "coton egyptien" from "coton egyptien")
4. **Lowercase conversion**
5. **Section detection** -- looks for labeled sections using the pattern `/(shell|pocket\s+lining|lining|trim|outer|main\s+fabric|fabric|material|self\s*1|self\s*2):/gi`. If found, each section's materials are extracted independently. Any unlabeled composition text before the first labeled section is captured as "main fabric".
6. **Material-first format conversion** -- handles "Cotton 75%, Polyester 25%" by detecting and flipping to "75% Cotton 25% Polyester"
7. **Percentage validation** -- material percentages must sum to 100% (tolerance of +/-0.2%). If they do not, the normalizer tries all contiguous subsets of the extracted materials to find one that totals 100%. If no valid subset is found, the text is rejected (empty string returned).
8. **Output format** -- `"55% tencel 45% cotton"` (space-separated, lowercase, percentage-first). For sectioned text: `"shell: 55% recycled polyester 45% rws wool. lining: 100% cotton"`.

The `parseSectionsToComponents()` utility then converts normalized text into the `{ component, text }` array format used by the UI, uppercasing component labels (e.g., "shell" becomes "SHELL").

### 5. Material Matching and Scoring

Each material name is looked up in the materials database (`parsers/utils/materials.js`, 42 entries). The `matchMaterialInfo()` function in `content.js` tries three matching strategies:
1. **Exact match** (case-insensitive)
2. **Word-order-independent match** -- splits both the query and each database key into sorted words and compares
3. **Special-case match** -- if the text contains both "lenzing" and "ecovero", it matches against database keys containing those substrings

The `normalizeMaterialName()` function in `content.js` also provides a secondary translation layer for common synonyms across languages (e.g., "spandex"/"lycra" to "elastane", "coton"/"cotone"/"algodon" to "cotton", "soie"/"seta"/"seide" to "silk", etc.).

### 6. Scoring and Display

The overall sustainability score is a weighted average: each material's database score (0-100) is multiplied by its percentage weight, summed, then divided by total percentage and scaled to 0-10. The score determines the widget's color: green (>5), orange (=5), red (<5).

The widget displays materials grouped by component (MAIN FABRIC, SHELL, LINING, etc.), with each material individually color-coded by its sustainability category via a `data-category` attribute on the DOM element, which is styled by `fabric-analysis-widget.css`.

### 7. Widget States

The floating widget appears in one of three states:
- **Composition found** -- shows material breakdown, component sections, and sustainability score
- **No composition found** -- shows a "No fabric composition found on this page" message
- **Error** -- shows "An error occurred while analyzing this page"

All three states include the bug report section with an "Email Us" mailto link.

### 8. Popup Interaction

Clicking the extension popup icon also triggers analysis (useful if the page loaded composition data dynamically after initial page load). The popup sends an `{ action: "analyze" }` message to the content script; if the content script is not yet loaded (message fails), the popup injects `content.js` via `chrome.scripting.executeScript` and retries after 100ms.

The content scripts are loaded in dependency order as specified in `manifest.json`: materials database, then normalizer, then unified parser, then Zara parser, then site configuration, and finally the main content script.

## Project Structure

```
manifest.json              - Chrome extension manifest (Manifest V3)
content.js                 - Main content script: page detection, UI creation, scoring logic
popup.html / popup.js      - Extension popup: triggers analysis on the active tab
extension-popup.css        - Styles for the extension popup
fabric-analysis-widget.css - Styles for the floating analysis widget injected into pages
siteConfig.js              - Site-specific selector and parser configurations
parsers/
  zaraParser.js            - Parser for section-header composition (OUTER SHELL, MAIN FABRIC, etc.)
                             Used by Zara, H&M, and COS
  unifiedParser.js         - General-purpose parser used by most other sites and the default fallback
  utils/
    materials.js           - Materials database with sustainability scores and categories
    normalizer.js          - Text normalization, section detection, percentage validation,
                             multi-language support, and the parseSectionsToComponents utility
    test.js                - Test suite for the normalizer (runs in both Node.js and browser)
images/                    - Extension icons (16px, 48px, 128px, SVG)
test-section-composition.html - Manual browser test page for section-based composition parsing
test-zara-cos.html         - Manual browser test page for Zara/COS parsing
```

## Running Tests

The normalizer has a test suite that can be run in Node.js:

```bash
node parsers/utils/test.js
```

This automatically runs the `runNormalizerTests()` suite, which covers format variations, multi-language input, section-based compositions, special material names, edge cases, and percentage validation.

Two additional test functions (`testZaraParser` and `testSectionBasedComposition`) are available when the file is loaded in a browser environment and can be invoked from the developer console. The repository also includes `test-section-composition.html` and `test-zara-cos.html` for manual browser-based testing.

## Distribution

To package the extension for distribution:

1. Create a .zip file containing all extension files
2. Submit to Chrome Web Store:
   - Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Pay one-time developer fee ($5)
   - Create a new item
   - Upload the .zip file
   - Fill in store listing details
   - Submit for review

## Known Limitations and Fragility Notes

- **Obfuscated/hashed class names** -- Several sites (H&M's `fddca0`, ASOS's `F_yfF`, Farfetch's `ltr-4y8w0i-Body`) use build-generated class names that will break when the site redeploys with new hashes. These selectors need periodic updates.
- **React-generated IDs** -- COS uses disclosure panel IDs like `disclosure-:rp:` that are generated by React's `useId()` hook and are not stable across page variations or React version changes.
- **Positional nth-child selectors** -- Farfetch and St. Agni include very long positional selectors (e.g., `body > div:nth-child(2) > main:nth-child(5) > ...`) that are extremely brittle to any DOM restructuring.
- **COS preProcess blocking delay** -- The COS `preProcess` function uses a synchronous busy-wait loop (`while (Date.now() - start < 500)`) that blocks the main thread for 500ms. This is noted in the code as non-ideal.
- **Percentage validation strictness** -- Compositions that do not sum to exactly 100% (+/-0.2%) are rejected entirely. This means partial compositions (e.g., "95% cotton, 5% other fibers" where "other fibers" is not a recognized material) may fail validation.
- **Single-pass selector execution** -- All selectors for a site are joined into one `querySelectorAll` call. This means all matching elements are found and parsed, which can produce duplicate results on sites where multiple selectors match overlapping DOM subtrees. The deduplication logic handles exact duplicates but not semantic overlaps.
- **Content script injection on popup click** -- When the popup injects `content.js` as a fallback, it only injects `content.js` itself, not the dependency files (materials, normalizer, parsers, siteConfig). This means the fallback injection may fail if the content scripts were not already loaded by the manifest's `content_scripts` declaration.
- **Material name matching** -- The `normalizeMaterialName()` synonym map in `content.js` and the `matchMaterialInfo()` lookup in the same file are separate from the normalizer's material cleaning logic. Material names must pass through multiple layers of normalization to be matched correctly.

## Contributing

Feel free to submit issues and enhancement requests!

For bug reports while using the extension, you can also use the built-in "Email Us" link in the widget, which opens a mailto link to fabricompositionanalysis@gmail.com. 