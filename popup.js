// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup opened');
    
    const resultsDiv = document.getElementById('composition');
    if (!resultsDiv) {
        console.error('Could not find element with id "composition"');
        return;
    }
    
    resultsDiv.innerHTML = 'Analyzing page...';

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const activeTab = tabs[0];
        
        // Try to send message first
        chrome.tabs.sendMessage(activeTab.id, { action: "analyze" }, function(response) {
            if (chrome.runtime.lastError) {
                // If message fails, inject the script
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    files: ['content.js']
                }).then(() => {
                    // Try sending the message again after injection
                    setTimeout(() => {
                        chrome.tabs.sendMessage(activeTab.id, { action: "analyze" }, function(response) {
                            if (response && response.success) {
                                window.close(); // Close the popup since the UI is shown on the page
                            } else {
                                displayError('No fabric composition found on this page.');
                            }
                        });
                    }, 100);
                }).catch(err => {
                    console.error('Failed to inject content script:', err);
                    displayError('Could not analyze the page. Please refresh and try again.');
                });
            } else {
                if (response && response.success) {
                    window.close(); // Close the popup since the UI is shown on the page
                } else {
                    displayError('No fabric composition found on this page.');
                }
            }
        });
    });

    function displayError(message) {
        console.error('Error:', message);
        if (!resultsDiv) return;
        resultsDiv.innerHTML = `<p class="error">${message}</p>`;
    }
});

function getScoreLevel(score) {
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
}