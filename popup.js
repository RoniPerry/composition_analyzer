// Wait for the DOM to be loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Popup opened");

  const resultsDiv = document.getElementById("composition");
  const startButton = document.getElementById("start-click-listening");
  const statusDiv = document.getElementById("listening-status");

  if (!resultsDiv) {
    console.error('Could not find element with id "composition"');
    return;
  }

  if (!startButton || !statusDiv) {
    console.error("Could not find click listener elements");
    return;
  }

  // Initialize click listener functionality
  let isListening = false;

  startButton.addEventListener("click", function () {
    if (!isListening) {
      startClickListening();
    } else {
      stopClickListening();
    }
  });

  function startClickListening() {
    isListening = true;
    startButton.textContent = "Stop Search";
    startButton.classList.add("listening");
    statusDiv.textContent =
      "Started search, Please click on the area of the compisition in the product page";
    statusDiv.classList.add("active");

    // Send message to content script to start listening
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "startClickListening" },
        function (response) {
          if (chrome.runtime.lastError) {
            // If message fails, inject the script first
            chrome.scripting
              .executeScript({
                target: { tabId: activeTab.id },
                files: ["content.js"],
              })
              .then(() => {
                setTimeout(() => {
                  chrome.tabs.sendMessage(activeTab.id, {
                    action: "startClickListening",
                  });
                }, 100);
              })
              .catch((err) => {
                console.error("Failed to inject content script:", err);
                statusDiv.textContent =
                  "Error: Could not start listening. Please refresh and try again.";
                statusDiv.classList.remove("active");
              });
          }
        }
      );
    });
  }

  function stopClickListening() {
    isListening = false;
    startButton.textContent = "Start Search";
    startButton.classList.remove("listening");
    statusDiv.textContent = "Search stopped.";
    statusDiv.classList.remove("active");

    // Send message to content script to stop listening
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: "stopClickListening" });
    });
  }

  resultsDiv.innerHTML = "Analyzing page...";

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    // Try to send message first
    chrome.tabs.sendMessage(
      activeTab.id,
      { action: "analyze" },
      function (response) {
        if (chrome.runtime.lastError) {
          // If message fails, inject the script
          chrome.scripting
            .executeScript({
              target: { tabId: activeTab.id },
              files: ["content.js"],
            })
            .then(() => {
              // Try sending the message again after injection
              setTimeout(() => {
                chrome.tabs.sendMessage(
                  activeTab.id,
                  { action: "analyze" },
                  function (response) {
                    if (response && response.success) {
                      window.close(); // Close the popup since the UI is shown on the page
                    } else {
                      displayError("No fabric composition found on this page.");
                    }
                  }
                );
              }, 100);
            })
            .catch((err) => {
              console.error("Failed to inject content script:", err);
              displayError(
                "Could not analyze the page. Please refresh and try again."
              );
            });
        } else {
          if (response && response.success) {
            window.close(); // Close the popup since the UI is shown on the page
          } else {
            displayError("No fabric composition found on this page.");
          }
        }
      }
    );
  });

  function displayError(message) {
    console.error("Error:", message);
    if (!resultsDiv) return;
    resultsDiv.innerHTML = `<p class="error">${message}</p>`;
  }
});

function getScoreLevel(score) {
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  return "low";
}
