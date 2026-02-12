// Content script orchestrator
// Coordinates all modules and handles initialization

// Initialize the composition analysis
async function init() {
    if (!window.isProductPage()) {
        console.log('Not a product page, skipping analysis');
        return;
    }

    console.log('Analyzing page for fabric composition...');

    // Always create the UI container if it doesn't exist
    let container = document.getElementById('fabric-analysis-container');
    if (!container) {
        window.createFloatingUI();
        container = document.getElementById('fabric-analysis-container');
    }

    // Show loading state
    window.showLoadingUI();

    // Small delay to ensure DOM is ready
    setTimeout(async () => {
        try {
            const compositionSections = await window.findCompositionSections();

            if (compositionSections && compositionSections.length > 0) {
                window.updateFloatingUI(compositionSections);
            } else {
                console.log('No fabric composition found on this page');
                window.showNoCompositionUI();
            }
        } catch (error) {
            console.error('Error analyzing page:', error);
            window.showErrorUI(error);
        }
    }, 300);
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "analyze") {
        init();
        sendResponse({ success: true });
    }
});

// Detect SPA navigation (URL changes without page reload)
var lastUrl = window.location.href;
var navigationObserver = new MutationObserver(function() {
    if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        console.log('SPA navigation detected, re-analyzing...');
        // Remove old widget so it gets recreated with fresh data
        var oldContainer = document.getElementById('fabric-analysis-container');
        if (oldContainer) oldContainer.remove();
        // Delay to let the new page content render
        setTimeout(init, 1000);
    }
});
navigationObserver.observe(document.body, { childList: true, subtree: true });

// Also listen for History API navigation
var origPushState = history.pushState;
history.pushState = function() {
    origPushState.apply(this, arguments);
    window.dispatchEvent(new Event('locationchange'));
};
var origReplaceState = history.replaceState;
history.replaceState = function() {
    origReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event('locationchange'));
};
window.addEventListener('popstate', function() {
    window.dispatchEvent(new Event('locationchange'));
});
window.addEventListener('locationchange', function() {
    if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        console.log('History navigation detected, re-analyzing...');
        var oldContainer = document.getElementById('fabric-analysis-container');
        if (oldContainer) oldContainer.remove();
        setTimeout(init, 1000);
    }
});

// Start the analysis when the page is ready
if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}

// Export init to global scope for retry functionality
window.init = init;
