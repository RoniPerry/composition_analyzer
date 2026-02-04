// Remote configuration module
// Fetches and caches selector configs from a hosted JSON file
// Falls back to bundled siteConfig.js on failure

const REMOTE_CONFIG_URL = 'https://raw.githubusercontent.com/RoniPerry/composition_analyzer/main/selectors.json';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchRemoteSelectors() {
    try {
        const cached = await chrome.storage.local.get(['remoteSelectors', 'remoteSelectorsFetchedAt']);
        const age = Date.now() - (cached.remoteSelectorsFetchedAt || 0);

        if (cached.remoteSelectors && age < CACHE_TTL_MS) {
            console.log('Using cached remote selectors (age: ' + Math.round(age / 1000) + 's)');
            return cached.remoteSelectors;
        }

        console.log('Fetching remote selectors from:', REMOTE_CONFIG_URL);
        const resp = await fetch(REMOTE_CONFIG_URL);

        if (!resp.ok) {
            throw new Error('HTTP ' + resp.status);
        }

        const remoteSelectors = await resp.json();

        await chrome.storage.local.set({
            remoteSelectors: remoteSelectors,
            remoteSelectorsFetchedAt: Date.now()
        });

        console.log('Remote selectors fetched and cached for', Object.keys(remoteSelectors).length, 'sites');
        return remoteSelectors;
    } catch (e) {
        console.log('Remote config fetch failed, using bundled config:', e.message);
        // Try to return stale cache if available
        try {
            const stale = await chrome.storage.local.get(['remoteSelectors']);
            if (stale.remoteSelectors) {
                console.log('Using stale cached remote selectors as fallback');
                return stale.remoteSelectors;
            }
        } catch (_) {}
        return null;
    }
}

function mergeSelectorsIntoConfig(remoteSelectors) {
    if (!remoteSelectors || !window.siteConfig) return;

    for (const [domain, selectors] of Object.entries(remoteSelectors)) {
        if (window.siteConfig[domain]) {
            // Override selectors but keep parser and preProcess from bundled config
            window.siteConfig[domain].selectors = selectors;
            console.log('Remote override selectors for:', domain);
        }
        // Don't create new site entries from remote - we need parser references
        // which can't be serialized in JSON
    }
}

// Export to global scope
window.fetchRemoteSelectors = fetchRemoteSelectors;
window.mergeSelectorsIntoConfig = mergeSelectorsIntoConfig;
