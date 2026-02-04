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

// Start the analysis when the page is ready
if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}

// Export init to global scope for retry functionality
window.init = init;
