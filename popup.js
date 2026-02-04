// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup opened');
    
    const resultsDiv = document.getElementById('composition');
    if (!resultsDiv) {
        console.error('Could not find element with id "composition"');
        return;
    }
    
    resultsDiv.innerHTML = '<div class="loading-message"><div class="popup-spinner"></div><p>Analyzing page...</p></div>';

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const activeTab = tabs[0];
        
        // Try to send message first
        chrome.tabs.sendMessage(activeTab.id, { action: "analyze" }, function(response) {
            if (chrome.runtime.lastError) {
                // If message fails, inject all required scripts in the correct order
                console.log('Content script not loaded, injecting all dependencies...');
                resultsDiv.innerHTML = '<div class="loading-message"><div class="popup-spinner"></div><p>Loading extension...</p></div>';

                // Define all dependency files in order matching manifest.json
                const scriptFiles = [
                    'parsers/utils/materials.js',
                    'parsers/utils/normalizer.js',
                    'parsers/unifiedParser.js',
                    'parsers/zaraParser.js',
                    'siteConfig.js',
                    'pageDetector.js',
                    'compositionFinder.js',
                    'scorer.js',
                    'widget.js',
                    'content.js'
                ];

                // Inject scripts sequentially
                injectScriptsSequentially(activeTab.id, scriptFiles)
                    .then(() => {
                        console.log('All scripts injected successfully');
                        // Try sending the message again after injection
                        setTimeout(() => {
                            chrome.tabs.sendMessage(activeTab.id, { action: "analyze" }, function(response) {
                                if (chrome.runtime.lastError) {
                                    displayError('Failed to communicate with the page. Please try refreshing the page.');
                                } else if (response && response.success) {
                                    displaySuccess('Analysis started! Check the page for results.');
                                    setTimeout(() => window.close(), 1500);
                                } else {
                                    displayError('No response from the page. Please try again.');
                                }
                            });
                        }, 100);
                    })
                    .catch(err => {
                        console.error('Failed to inject content scripts:', err);
                        displayError('Could not analyze the page. Please refresh and try again.');
                    });
            } else {
                if (response && response.success) {
                    displaySuccess('Analysis started! Check the page for results.');
                    setTimeout(() => window.close(), 1500);
                } else {
                    displayError('No response from the page. Please try again.');
                }
            }
        });
    });

    function displayError(message) {
        console.error('Error:', message);
        if (!resultsDiv) return;
        resultsDiv.innerHTML = `<div class="error-message"><span class="error-icon">⚠</span><p class="error">${message}</p></div>`;
    }

    function displaySuccess(message) {
        if (!resultsDiv) return;
        resultsDiv.innerHTML = `<div class="success-message"><span class="success-icon">✓</span><p class="success">${message}</p></div>`;
    }

    // Helper function to inject scripts sequentially
    function injectScriptsSequentially(tabId, files) {
        return files.reduce((promise, file) => {
            return promise.then(() => {
                console.log('Injecting:', file);
                return chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: [file]
                });
            });
        }, Promise.resolve());
    }
});