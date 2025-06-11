// Site-specific configuration for fabric composition detection
window.siteConfig = {
    "zara.com": {
        selectors: [
            // Primary composition selectors
            "div.composition span",
            "div._composition-info",
            "[data-qa-label='composition']",
            ".product-detail-composition",
            // Backup selectors
            "[class*='product-detail-info'] [class*='composition']",
            "[class*='product-composition']"
        ],
        parser: window.zaraParser
    },

    "hm.com": {
        selectors: [
            // Primary composition selectors
            "div[id='section-materialsAndSuppliersAccordion'] div div div ul li span",
            // Backup selectors
            "[class*='materialsAndSuppliersAccordion']",
            "div[class*='composition']",
            "span[class*='composition']",
            "ul.product-materials li",
            ".PdpComposition",
            ".product-detail-main .materials",
            "[class*='pdp-description-list'] [class*='materials']",
            "[class*='product-composition']",
            "[class*='product-detail-info'] [class*='composition']"
        ],
        parser: window.hmParser
    },

    "arket.com": {
        selectors: [
            // Primary composition selectors
            "ul.list-none.gap-4 span.font-regular.bg-transparent.text-black.text-16.leading-22",
            ".product-info__list [class*='composition']",
            // Backup selectors
            "[class*='product-composition']",
            "[class*='material-info']",
            "[class*='fabric-details']"
        ],
        parser: window.genericParser
    },

    "mango.com": {
        selectors: [
            // Primary composition selectors
            "div#composition-info",
            "div.productComposition",
            ".product-features-list [class*='composition']",
            // Backup selectors
            "[class*='product-detail'] [class*='composition']",
            "[class*='material-info']"
        ],
        parser: window.genericParser
    },

    "uniqlo.com": {
        selectors: [
            // Primary composition selectors
            "div.product-specs",
            ".product-composition",
            ".product-info-content [class*='composition']",
            // Backup selectors
            "[class*='product-materials']",
            "[class*='fabric-details']"
        ],
        parser: window.genericParser
    },

    "asos.com": {
        selectors: [
            // Primary composition selectors
            "ul#product-details li",
            ".product-description",
            "[data-test-id*='product-details'] [class*='composition']",
            // Backup selectors
            "[class*='product-info'] [class*='materials']",
            "[class*='fabric-care']"
        ],
        parser: window.genericParser
    },

    "net-a-porter.com": {
        selectors: [
            // Primary composition selectors
            "div.product-info__composition",
            ".product-details__composition",
            "[data-testid*='product-details'] [class*='composition']",
            // Backup selectors
            "[class*='product-information'] [class*='materials']",
            "[class*='fabric-details']"
        ],
        parser: window.genericParser
    },

    "farfetch.com": {
        selectors: [
            // Primary selector targeting spans with specific attributes
            "span[data-component='Body'][class*='ltr-4y8w0i-Body']",
            // Backup using parent structure
            "div[class*='ltr-92qs1a'] span[data-component='Body']",
            // Previous working selector
            "body > div:nth-child(2) > main:nth-child(5) > div:nth-child(4) > div:nth-child(3) > div:nth-child(1) > section:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > p:nth-child(2)",
            // Legacy backup selectors
            "[data-testid='product-information-accordion'] div[class*='composition']",
            "div[class*='composition']"
        ],
        parser: window.farfetchParser
    },

    "ssense.com": {
        selectors: [
            // Primary composition selectors
            "div.pdp-scroll__column-content--full-wdith.pdp-scroll__column-content--left div.s-column.pdp-product-description div div.s-row span p.s-text",
            ".product__details",
            "[data-test*='product-description'] [class*='composition']",
            // Backup selectors
            "[class*='product-info'] [class*='materials']",
            "[class*='fabric-details']"
        ],
        parser: window.genericParser
    },

    "matchesfashion.com": {
        selectors: [
            // Primary composition selectors
            ".product-details__info",
            "[data-testid*='product-details'] [class*='composition']",
            // Backup selectors
            "[class*='product-information'] [class*='materials']",
            "[class*='fabric-details']"
        ],
        parser: window.genericParser
    },

    "nordstrom.com": {
        selectors: [
            // Primary composition selectors
            ".product-details ul li",
            "#product-details",
            "[data-element-id*='product-details'] [class*='composition']",
            // Backup selectors
            "[class*='product-info'] [class*='materials']",
            "[class*='fabric-details']"
        ],
        parser: window.genericParser
    },

    "revolve.com": {
        selectors: [
            // Primary composition selectors
            ".product-description",
            "span.composition",
            "[data-test*='product-details'] [class*='composition']",
            // Backup selectors
            "[class*='product-info'] [class*='materials']",
            "[class*='fabric-details']"
        ],
        parser: window.genericParser
    },

    "frett.life": {
        selectors: [
            // Primary composition selector targeting the accordion content
            "div[data-block-id*='accordion'] p:first-child",
            // Backup selectors
            "div[data-block-type='accordion'] p:first-child",
            "div.metafield-rich_text_field p"
        ],
        parser: window.frettParser
    },

    "massimodutti.com": {
        selectors: [
            // Primary composition selectors
            "div.fabric-and-care p",
            "div[class*='fabric'] p",
            // Specific section selectors
            "div.outer-layer",
            "div.outer-shell",
            // Backup selectors
            "[class*='fabric-details']",
            "[class*='product-composition']",
            "[class*='material-info']"
        ],
        parser: window.genericParser
    },

    "trestlv.com": {
        selectors: [
            // Primary composition selectors targeting list items
            "ul li",  // Will use parser to filter for composition text
            // Backup selectors
            "[class*='product-info'] li",
            "[class*='product-details'] li",
            // Generic backup selectors
            "[class*='composition']",
            "[class*='material-info']"
        ],
        parser: window.genericParser
    },

    // Default fallback configuration for any unconfigured sites
    "default": {
        selectors: [
            // Description sections (common in product pages)
            "div.Description",
            "div[class*='description']",
            // List item patterns (common in product details)
            "ul li",  // Will use parser to filter for composition text
            // Detail content patterns
            "div.detail-content.mono",
            ".detail-content.mono",
            // Common composition patterns
            "[class*='composition']",
            "[class*='material']",
            "[data-qa-label*='composition']",
            "[data-testid*='composition']",
            "[data-test*='composition']",
            // Product details containers with list items
            ".product-details li",
            ".product-info li",
            ".product-description li",
            // Common parent containers
            ".pdp-container [class*='composition']",
            ".product-container [class*='composition']",
            ".item-details [class*='composition']",
            ".garment-details [class*='composition']",
            // Detail trigger patterns
            ".detail-trigger.uppercase + .detail-content",
            "[class*='product-detail'] [class*='composition']"
        ],
        parser: window.genericParser
    }
}; 
