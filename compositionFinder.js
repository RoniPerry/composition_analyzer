// Composition finder module
// Handles site configuration lookup, DOM querying, and content-based fallback

function getCurrentSiteConfig() {
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname);

    for (const [domain, config] of Object.entries(window.siteConfig)) {
        if (domain === 'default') continue;

        // Proper domain matching: exact match or subdomain match
        if (hostname === domain || hostname.endsWith('.' + domain)) {
            console.log('Found specific configuration for:', domain);
            return config;
        }
    }
    console.log('Using default configuration');
    return window.siteConfig.default;
}

// Scoped content scanner - walks the DOM looking for composition text
// Used as fallback when CSS selectors don't find anything
function scanForComposition() {
    console.log('Starting scoped content scanner fallback...');

    // Find the main content area to scope our search
    var scanRoot = document.querySelector('main, article, [role="main"]');
    if (!scanRoot) {
        scanRoot = document.body;
    }

    // Excluded class name patterns
    var excludePatterns = ['recommend', 'related', 'carousel', 'similar', 'footer', 'header', 'nav', 'cookie', 'banner', 'newsletter', 'subscribe'];

    // Check if an element should be excluded
    function shouldExclude(element) {
        if (!element) return false;
        var tagName = element.tagName.toLowerCase();
        if (tagName === 'header' || tagName === 'footer' || tagName === 'nav') return true;

        var className = (element.className || '').toString().toLowerCase();
        var id = (element.id || '').toLowerCase();
        for (var i = 0; i < excludePatterns.length; i++) {
            if (className.indexOf(excludePatterns[i]) !== -1 || id.indexOf(excludePatterns[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    // Check if any ancestor should be excluded
    function hasExcludedAncestor(node) {
        var el = node.parentElement;
        while (el && el !== scanRoot) {
            if (shouldExclude(el)) return true;
            el = el.parentElement;
        }
        return false;
    }

    // Get the closest block-level ancestor
    function getBlockAncestor(node) {
        var blockTags = ['DIV', 'P', 'LI', 'SECTION', 'ARTICLE', 'TD', 'DD', 'BLOCKQUOTE', 'SPAN'];
        var el = node.parentElement;
        while (el && el !== scanRoot) {
            if (blockTags.indexOf(el.tagName) !== -1) return el;
            el = el.parentElement;
        }
        return node.parentElement;
    }

    var percentagePattern = /\d+(?:\.\d+)?%/;
    // Patterns that look like percentages but are NOT composition (promos, stats, etc.)
    var promoPatterns = /\d+%\s*(off|discount|sale|save|order|cashback|back|increase|decrease|fewer|more|less|your)/i;
    var candidates = [];
    var seenTexts = new Set();

    // Walk all text nodes in the scoped area
    var walker = document.createTreeWalker(scanRoot, NodeFilter.SHOW_TEXT, null, false);
    var node;

    while ((node = walker.nextNode())) {
        var text = node.textContent.trim();
        if (!text || !percentagePattern.test(text)) continue;
        if (promoPatterns.test(text)) continue;
        if (hasExcludedAncestor(node)) continue;

        var block = getBlockAncestor(node);
        if (!block) continue;

        var blockText = block.textContent.trim();
        if (promoPatterns.test(blockText)) continue;
        if (seenTexts.has(blockText)) continue;
        seenTexts.add(blockText);

        candidates.push(blockText);
    }

    console.log('Content scanner found', candidates.length, 'candidate text blocks');

    // Try each candidate through the normalizer
    for (var i = 0; i < candidates.length; i++) {
        var candidate = candidates[i];
        try {
            var normalized = window.normalizeCompositionText(candidate);
            if (!normalized) continue;

            var sections = window.parseSectionsToComponents(normalized);
            if (sections && sections.length > 0) {
                console.log('Content scanner found valid composition:', sections);
                return sections;
            }
        } catch (e) {
            console.log('Content scanner candidate failed normalization:', e.message);
        }
    }

    console.log('Content scanner found no valid compositions');
    return [];
}

async function findCompositionSections() {
    var sections = new Set();

    // Step 1: Apply remote config overrides if available
    try {
        var remoteSelectors = await window.fetchRemoteSelectors();
        if (remoteSelectors) {
            window.mergeSelectorsIntoConfig(remoteSelectors);
        }
    } catch (e) {
        console.log('Remote config not available:', e.message);
    }

    // Step 2: Try site-specific selectors
    var siteConfig = getCurrentSiteConfig();
    console.log('Using selectors:', siteConfig.selectors);

    // Run preProcess if defined
    if (siteConfig.preProcess && typeof siteConfig.preProcess === 'function') {
        console.log('Running site-specific preProcess...');
        try {
            await siteConfig.preProcess();
        } catch (err) {
            console.error('PreProcess failed:', err);
        }
    }

    var siteElements = document.querySelectorAll(siteConfig.selectors.join(','));
    console.log('Found site-specific elements:', siteElements.length);

    var foundComposition = false;
    var seenComponents = new Set();

    function addUniqueSection(section) {
        section.text = section.text.replace(/\s+/g, ' ').trim();
        // Deduplicate by component name - first one wins
        var componentKey = section.component.toUpperCase().trim();
        if (seenComponents.has(componentKey)) return;

        var exists = Array.from(sections).some(function(existing) {
            var obj = JSON.parse(existing);
            return obj.text === section.text;
        });
        if (!exists) {
            seenComponents.add(componentKey);
            sections.add(JSON.stringify(section));
            foundComposition = true;
        }
    }

    for (var i = 0; i < siteElements.length; i++) {
        var element = siteElements[i];
        var parsedSections = siteConfig.parser(element);
        if (parsedSections && parsedSections.length > 0) {
            parsedSections.forEach(function(section) {
                addUniqueSection(section);
            });
            // If we found a good result with multiple sections, stop looking
            if (sections.size >= 1) {
                console.log('Found composition, stopping element search');
                break;
            }
        }
    }

    if (foundComposition) {
        console.log('Selector-based search found composition');
        return Array.from(sections).map(function(s) { return JSON.parse(s); });
    }

    // Step 3: If selectors found nothing, try preProcess + retry (for sites like COS)
    if (siteConfig.preProcess && siteElements.length === 0) {
        console.log('Retrying selectors after preProcess...');
        try {
            await siteConfig.preProcess();
            siteElements = document.querySelectorAll(siteConfig.selectors.join(','));
            siteElements.forEach(function(element) {
                var parsedSections = siteConfig.parser(element);
                if (parsedSections && parsedSections.length > 0) {
                    parsedSections.forEach(function(section) { addUniqueSection(section); });
                }
            });
            if (foundComposition) {
                return Array.from(sections).map(function(s) { return JSON.parse(s); });
            }
        } catch (e) {
            console.log('PreProcess retry failed:', e.message);
        }
    }

    // Step 4: Content scanner fallback
    console.log('Selectors found nothing, trying content scanner...');
    var scannedSections = scanForComposition();
    if (scannedSections && scannedSections.length > 0) {
        return scannedSections;
    }

    console.log('No fabric composition found on this page');
    return [];
}

// Export to global scope
window.getCurrentSiteConfig = getCurrentSiteConfig;
window.findCompositionSections = findCompositionSections;
window.scanForComposition = scanForComposition;
