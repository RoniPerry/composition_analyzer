// Content script for analyzing fabric composition

// Define component patterns for parsing
const COMPONENT_NAMES = {
  MAIN: ["MAIN FABRIC", "SHELL", "OUTER SHELL", "FABRIC", "MATERIAL"],
  SUB: [
    "UPPER PART",
    "LOWER PART",
    "FRONT",
    "BACK",
    "SLEEVE",
    "BODY",
    "LINING",
  ],
};

// Click listening state
let isClickListening = false;
let clickListener = null;

// Get site-specific configuration
function getCurrentSiteConfig() {
  const hostname = window.location.hostname.replace("www.", "");
  console.log("Current hostname:", hostname);

  // Find the most specific matching configuration
  for (const [domain, config] of Object.entries(window.siteConfig)) {
    if (hostname.includes(domain)) {
      console.log("Found specific configuration for:", domain);
      return config;
    }
  }
  console.log("Using default configuration");
  return window.siteConfig.default;
}

function findCompositionSections() {
  const sections = new Set();

  // Try site-specific approach first
  const siteConfig = getCurrentSiteConfig();
  console.log("🔍 Using site-specific configuration");
  console.log("Using selectors:", siteConfig.selectors);

  // Check if site has preProcess function and run it first
  if (siteConfig.preProcess && typeof siteConfig.preProcess === "function") {
    console.log("🔄 Running site-specific preProcess...");
    // For now, just run preProcess synchronously to avoid breaking existing functionality
    try {
      siteConfig.preProcess();
    } catch (err) {
      console.error("❌ PreProcess failed:", err);
    }
  }

  const siteElements = document.querySelectorAll(
    siteConfig.selectors.join(",")
  );
  console.log("Found site-specific elements:", siteElements.length);

  let foundComposition = false;

  // Helper function to add section while avoiding duplicates
  function addUniqueSection(section) {
    // Clean up whitespace but preserve original material names
    section.text = section.text.replace(/\s+/g, " ").trim();

    // Check if this exact combination of component and text already exists
    const exists = Array.from(sections).some((existingSection) => {
      const existingObj = JSON.parse(existingSection);
      return (
        existingObj.component === section.component &&
        existingObj.text === section.text
      );
    });

    if (!exists) {
      sections.add(JSON.stringify(section));
      foundComposition = true;
    }
  }

  siteElements.forEach((element) => {
    console.log(
      "🔍 Processing element with site-specific parser:",
      element.outerHTML
    );
    const parsedSections = siteConfig.parser(element);
    console.log("Site-specific parser results:", parsedSections);
    if (parsedSections && parsedSections.length > 0) {
      console.log("✅ Site-specific parser found valid sections");
      parsedSections.forEach((section) => {
        console.log("Adding section from site config:", section);
        addUniqueSection(section);
      });
    }
  });

  if (foundComposition) {
    console.log(
      "🏁 Final result:",
      Array.from(sections).map((s) => JSON.parse(s))
    );
    return Array.from(sections).map((s) => JSON.parse(s));
  }

  console.log("No fabric composition found on this page");
  return [];
}

// Helper function to normalize material names
function normalizeMaterialName(material) {
  // Remove trademark symbols and normalize case
  material = material.toLowerCase().replace(/[™®©]/g, "");

  // Handle common variations and typos
  const materialMap = {
    elastane: ["spandex", "lycra"],
    polyamide: ["nylon"],
    viscose: ["rayon"],
    acrylic: ["acrylique", "acrilico"],
    polyester: ["polyestere", "poliester"],
    cotton: ["coton", "cotone", "algodón"],
    wool: ["laine", "lana", "wolle"],
    silk: ["soie", "seta", "seide"],
    linen: ["lin", "lino", "leinen"],
    leather: ["cuir", "cuoio", "leder"],
    cashmere: ["cachemire", "cashmere", "kaschmir"],
    modal: ["modal®", "modall"],
    tencel: ["tencel®", "tencell"],
    lyocell: ["lyocell®", "lyocel"],
  };

  // Check for material variations
  for (const [standard, variations] of Object.entries(materialMap)) {
    if (variations.some((v) => material.includes(v))) {
      return standard;
    }
  }

  return material;
}

// Get color based on sustainability score
function getColorForScore(score) {
  if (score > 5) return "high"; // Green for scores > 5
  if (score === 5) return "medium"; // Orange for score = 5
  return "low"; // Red for scores < 5
}

// Initialize the composition analysis
function init() {
  if (!isProductPage()) {
    console.log("Not a product page, skipping analysis");
    return;
  }

  console.log("Analyzing page for fabric composition...");

  // Check if CSS Selector Generator is properly loaded
  if (typeof window.CssSelectorGenerator !== "undefined") {
    console.log("✅ CSS Selector Generator loaded successfully");
    try {
      const testGenerator = new window.CssSelectorGenerator();
      console.log("✅ CSS Selector Generator instance created successfully");
    } catch (error) {
      console.error(
        "❌ CSS Selector Generator failed to create instance:",
        error
      );
    }
  } else {
    console.warn("⚠️ CSS Selector Generator not loaded, will use fallback");
  }

  try {
    const compositionSections = findCompositionSections();

    // Always create the UI container if it doesn't exist
    let container = document.getElementById("fabric-analysis-container");
    if (!container) {
      createFloatingUI();
    }

    if (compositionSections && compositionSections.length > 0) {
      updateFloatingUI(compositionSections);
    } else {
      console.log("No fabric composition found on this page");
      // Show widget with just the bug report section when no composition is found
      showNoCompositionUI();
    }
  } catch (error) {
    console.error("Error analyzing page:", error);
    // Show widget with error message and bug report section
    let container = document.getElementById("fabric-analysis-container");
    if (!container) {
      createFloatingUI();
    }
    showErrorUI(error);
  }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "analyze") {
    init();
    // Send response about successful analysis
    sendResponse({ success: true });
  } else if (request.action === "startClickListening") {
    startClickListening();
    sendResponse({ success: true });
  } else if (request.action === "stopClickListening") {
    stopClickListening();
    sendResponse({ success: true });
  }
});

// Start listening for clicks on web elements
function startClickListening() {
  if (isClickListening) return;

  isClickListening = true;
  console.log("🎯 Starting click listening...");

  // Add visual indicator that we're listening
  document.body.style.cursor = "crosshair";

  // Create click listener
  clickListener = async function (event) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.target;

    try {
      const cssPath = await generateCSSPath(element);

      console.log("🎯 Clicked element CSS path:", cssPath);
      console.log("🎯 Element details:", {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        textContent: element.textContent?.substring(0, 100),
      });

      // For now, just log to console. Later you can enhance this to show in UI
      alert(
        `CSS Path: ${cssPath}\n\nElement: ${element.tagName}${
          element.className ? "." + element.className.split(" ").join(".") : ""
        }${element.id ? "#" + element.id : ""}`
      );
    } catch (error) {
      console.error("Error generating CSS path:", error);
      alert(`Error generating CSS path: ${error.message}`);
    }

    return false;
  };

  // Add the click listener to the document
  document.addEventListener("click", clickListener, true);

  // Add keyboard listener for Escape key
  document.addEventListener("keydown", escapeKeyListener);

  // Update all click listener buttons on the page to show listening state
  updateAllClickListenerButtons(true);
}

// Stop listening for clicks
function stopClickListening() {
  if (!isClickListening) return;

  isClickListening = false;
  console.log("🛑 Stopped click listening");

  // Remove visual indicator
  document.body.style.cursor = "";

  // Remove click listener
  if (clickListener) {
    document.removeEventListener("click", clickListener, true);
    clickListener = null;
  }

  // Remove keyboard listener
  document.removeEventListener("keydown", escapeKeyListener);

  // Update all click listener buttons on the page to show stopped state
  updateAllClickListenerButtons(false);
}

// Keyboard listener for Escape key
function escapeKeyListener(event) {
  if (event.key === "Escape" && isClickListening) {
    console.log("🛑 Escape key pressed, stopping click listening");
    stopClickListening();
  }
}

// Update all click listener buttons on the page
function updateAllClickListenerButtons(isListening) {
  const buttons = document.querySelectorAll("#start-click-listening");
  const statusDivs = document.querySelectorAll("#listening-status");

  buttons.forEach((button) => {
    if (isListening) {
      button.textContent = "Stop Search";
      button.classList.add("listening");
    } else {
      button.textContent = "Start Search";
      button.classList.remove("listening");
    }
  });

  statusDivs.forEach((statusDiv) => {
    if (isListening) {
      statusDiv.textContent =
        "Started search... Click on the area where the composition is described. (Press ESC to stop)";
      statusDiv.classList.add("active");
    } else {
      statusDiv.textContent =
        "Click the button to when you find the composition and ready to click it!";
      statusDiv.classList.remove("active");
    }
  });
}

// Generate CSS path for an element using css-selector-generator package
async function generateCSSPath(element) {
  if (
    !element ||
    element === document ||
    element === document.documentElement
  ) {
    return "html";
  }

  console.log("🎯 Element details:", {
    tagName: element.tagName,
    id: element.id,
    className: element.className,
    parentTag: element.parentNode?.tagName,
  });

  try {
    // Try to use css-selector-generator if available
    if (typeof window.CssSelectorGenerator !== "undefined") {
      console.log("🎯 CssSelectorGenerator available, using package");
      console.log(
        "🎯 CssSelectorGenerator constructor:",
        window.CssSelectorGenerator
      );

      const generator = new window.CssSelectorGenerator();
      console.log("🎯 Generator instance:", generator);
      console.log(
        "🎯 Generator methods:",
        Object.getOwnPropertyNames(Object.getPrototypeOf(generator))
      );

      const selector = generator.getSelector(element);
      console.log("🎯 Package generated selector:", selector);

      // If the package only returns a tag name, it's not working properly
      if (
        selector &&
        selector.length > 0 &&
        !selector.includes("#") &&
        !selector.includes(".") &&
        !selector.includes(":")
      ) {
        console.warn("🎯 Package returned only tag name, using fallback");
        return generateSimpleCSSPath(element);
      }

      return selector;
    }

    // Fallback to a simple implementation if package not available
    console.log("🎯 CssSelectorGenerator not available, using fallback");
    return generateSimpleCSSPath(element);
  } catch (error) {
    console.warn("css-selector-generator failed, using fallback:", error);
    return generateSimpleCSSPath(element);
  }
}

// Simple fallback CSS path generator
function generateSimpleCSSPath(element) {
  if (
    !element ||
    element === document ||
    element === document.documentElement
  ) {
    return "html";
  }

  let path = "";
  let current = element;

  while (current && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase();

    // Add ID if available (most specific)
    if (current.id && current.id.trim()) {
      selector += "#" + current.id.trim();
      path = selector + (path ? " > " + path : "");
      break; // ID should be unique, so we can stop here
    }

    // Add class names if available
    if (current.className && typeof current.className === "string") {
      const classes = current.className
        .split(" ")
        .filter((c) => c.trim() && c.length > 0)
        .filter((c) => /^[a-zA-Z][\w-]*$/.test(c)); // Only valid CSS class names

      if (classes.length > 0) {
        // Use the first meaningful class
        selector += "." + classes[0];
      }
    }

    // Add nth-child if needed for specificity
    if (current.parentNode) {
      const siblings = Array.from(current.parentNode.children);
      const index = siblings.indexOf(current) + 1;
      if (siblings.length > 1) {
        selector += `:nth-child(${index})`;
      }
    }

    path = selector + (path ? " > " + path : "");
    current = current.parentNode;

    // Limit depth to prevent overly long selectors
    if (path.split(" > ").length >= 5) {
      break;
    }
  }

  return path;
}

// Check if current page is likely a product page
function isProductPage() {
  // Common product page URL patterns
  const urlPatterns = [
    /\/p\/|\/product\/|\/item\/|\/goods\/|\/detail\/|\/productpage[\/\.]/i,
    /\/products?\//i,
    /\/shop\/[^\/]+$/i,
    /-pid-/i,
    /\/shopping\/[^\/]+\/[^\/]+/i, // For Farfetch URLs
    /p\d{8}\.html/i, // For Zara URLs (e.g., p08074911.html)
  ];

  // Check URL patterns
  if (urlPatterns.some((pattern) => pattern.test(window.location.href))) {
    return true;
  }

  // Common product page elements
  const productIndicators = [
    // Basic product elements
    'button[class*="add-to-cart"]',
    'button[class*="buy-now"]',
    'div[class*="product-detail"]',
    'div[class*="product-info"]',
    'div[class*="product-description"]',
    'div[class*="product-composition"]',
  ];

  // Check for product page elements
  const productElements = productIndicators
    .map((selector) => document.querySelector(selector))
    .filter(Boolean);

  return productElements.length >= 2; // Require at least 2 product elements
}

// Helper function to create click listener button with proper event handling
function createClickListenerButton() {
  console.log(
    "🔧 Creating click listener button, current state:",
    isClickListening
  );

  const clickListenerSection = document.createElement("div");
  clickListenerSection.className = "click-listener-section";

  const clickListenerTitle = document.createElement("h4");
  clickListenerTitle.textContent = "Help us find fabric composition:";

  const clickListenerButton = document.createElement("button");
  clickListenerButton.id = "start-click-listening";
  clickListenerButton.className = "click-listener-btn";
  clickListenerButton.textContent = isClickListening
    ? "Stop Click Listening"
    : "Start Click Listening";
  if (isClickListening) {
    clickListenerButton.classList.add("listening");
  }

  const clickListenerStatus = document.createElement("div");
  clickListenerStatus.id = "listening-status";
  clickListenerStatus.className = "status-text";
  clickListenerStatus.textContent = isClickListening
    ? "Listening for clicks... Click on any web element to see its CSS path. (Press ESC to stop)"
    : "Click the button to start listening for clicks on web elements.";
  if (isClickListening) {
    clickListenerStatus.classList.add("active");
  }

  // Add click event listener with debugging
  clickListenerButton.addEventListener("click", function (event) {
    console.log("🔘 Button clicked! Current state:", isClickListening);
    event.preventDefault();
    event.stopPropagation();

    if (!isClickListening) {
      console.log("🚀 Starting click listening...");
      startClickListening();
    } else {
      console.log("🛑 Stopping click listening...");
      stopClickListening();
    }

    return false;
  });

  // Add some debugging info
  console.log("🔧 Button created with ID:", clickListenerButton.id);
  console.log("🔧 Button text:", clickListenerButton.textContent);
  console.log("🔧 Button classes:", clickListenerButton.className);

  clickListenerSection.appendChild(clickListenerTitle);
  clickListenerSection.appendChild(clickListenerButton);
  clickListenerSection.appendChild(clickListenerStatus);

  return clickListenerSection;
}

// Create floating UI for displaying composition
function createFloatingUI() {
  const container = document.createElement("div");
  container.id = "fabric-analysis-container";

  const header = document.createElement("div");
  header.className = "fabric-analysis-header";
  header.style.cursor = "grab";

  const title = document.createElement("h2");
  title.className = "fabric-analysis-title";
  title.textContent = "Fabric Analysis";

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-button";
  closeBtn.textContent = "✕";
  closeBtn.onclick = () => container.remove();

  header.appendChild(title);
  header.appendChild(closeBtn);
  container.appendChild(header);

  // Always add bug report section
  const bugReportSection = document.createElement("div");
  bugReportSection.className = "bug-report-section";

  const bugReportText = document.createElement("p");
  bugReportText.textContent = "Encountered a problem? Tell us!";
  bugReportText.className = "bug-report-text";

  const bugReportButton = document.createElement("button");
  bugReportButton.textContent = "Report Bug";
  bugReportButton.className = "bug-report-button";
  bugReportButton.onclick = () => showBugReportForm();

  bugReportSection.appendChild(bugReportText);
  bugReportSection.appendChild(bugReportButton);
  container.appendChild(bugReportSection);

  // Add drag functionality
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  header.addEventListener("mousedown", function (e) {
    if (e.target === closeBtn) return; // Don't drag when clicking close button

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = container.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    header.style.cursor = "grabbing";
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    const newLeft = startLeft + deltaX;
    const newTop = startTop + deltaY;

    container.style.left = newLeft + "px";
    container.style.top = newTop + "px";
  });

  document.addEventListener("mouseup", function () {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = "grab";
    }
  });

  document.body.appendChild(container);

  return container;
}

// Update the floating UI with composition data
function updateFloatingUI(compositions) {
  const container = document.getElementById("fabric-analysis-container");
  if (!container) return;

  // Calculate sustainability score
  let totalScore = 0;
  let totalPercentage = 0;

  compositions.forEach((section) => {
    // Parse the normalized text which is in format "55% material 45% material"
    const parts = section.text.split(/\s+(?=\d+%)/);
    parts.forEach((part) => {
      const [percentage, ...materialParts] = part.split(/\s+/);
      const material = materialParts.join(" ");
      const percentageValue = parseInt(percentage, 10);

      const materialInfo = Object.entries(window.MATERIALS).find(([key]) => {
        // Try exact match first
        if (material === key.toLowerCase().trim()) {
          return true;
        }

        // Try flexible matching for different word orders
        const materialWords = material
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .sort()
          .join(" ");
        const keyWords = key.toLowerCase().trim().split(/\s+/).sort().join(" ");
        if (materialWords === keyWords) {
          return true;
        }

        // Try partial matching for special materials like "lenzing ecovero viscose"
        if (
          material.toLowerCase().includes("lenzing") &&
          material.toLowerCase().includes("ecovero")
        ) {
          return (
            key.toLowerCase().includes("lenzing") &&
            key.toLowerCase().includes("ecovero")
          );
        }

        return false;
      });

      if (materialInfo) {
        totalScore += materialInfo[1].score * (percentageValue / 100);
        totalPercentage += percentageValue;
      }
    });
  });

  // Normalize score if we have valid percentages and convert to 0-10 scale
  const finalScore =
    totalPercentage > 0
      ? Math.round((totalScore * (100 / totalPercentage)) / 10)
      : 0;

  // Set container score attribute for styling
  container.setAttribute("data-score", getColorForScore(finalScore));

  // Create composition details section
  const details = document.createElement("div");
  details.className = "composition-details";

  // Group materials by main component (OUTER SHELL or LINING)
  const mainComponents = new Map();
  compositions.forEach((section) => {
    const [main, ...subParts] = section.component.split("\n");
    if (!mainComponents.has(main)) {
      mainComponents.set(main, []);
    }
    mainComponents.get(main).push({
      subParts,
      text: section.text,
    });
  });

  // Add each component section
  mainComponents.forEach((items, mainComponent) => {
    const componentSection = document.createElement("div");
    componentSection.className = "component-section";

    const mainTitle = document.createElement("h3");
    mainTitle.textContent = mainComponent;
    componentSection.appendChild(mainTitle);

    items.forEach((item) => {
      if (item.subParts.length > 0) {
        // Add sub-parts
        item.subParts.forEach((subPart) => {
          const subTitle = document.createElement("h3");
          subTitle.textContent = subPart;
          subTitle.style.marginLeft = "20px";
          componentSection.appendChild(subTitle);
        });
      }

      // Add materials
      const parts = item.text.split(/\s+(?=\d+%)/);
      parts.forEach((part) => {
        const [percentage, ...materialParts] = part.split(/\s+/);
        const material = materialParts.join(" ");

        const materialDiv = document.createElement("div");
        materialDiv.className = "material-item";

        const materialInfo = Object.entries(window.MATERIALS).find(([key]) => {
          // Try exact match first
          if (material === key.toLowerCase().trim()) {
            return true;
          }

          // Try flexible matching for different word orders
          const materialWords = material
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .sort()
            .join(" ");
          const keyWords = key
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .sort()
            .join(" ");
          if (materialWords === keyWords) {
            return true;
          }

          // Try partial matching for special materials like "lenzing ecovero viscose"
          if (
            material.toLowerCase().includes("lenzing") &&
            material.toLowerCase().includes("ecovero")
          ) {
            return (
              key.toLowerCase().includes("lenzing") &&
              key.toLowerCase().includes("ecovero")
            );
          }

          return false;
        });

        if (materialInfo) {
          materialDiv.setAttribute("data-category", materialInfo[1].category);
        }

        materialDiv.style.marginLeft = item.subParts.length > 0 ? "20px" : "0";
        materialDiv.textContent = `${percentage} ${material}`;
        componentSection.appendChild(materialDiv);
      });
    });

    details.appendChild(componentSection);
  });

  // Add sustainability score
  const scoreSection = document.createElement("div");
  scoreSection.className = "sustainability-score";

  const scoreValue = document.createElement("h3");
  scoreValue.textContent = `${finalScore}/10`;
  scoreSection.appendChild(scoreValue);

  // Get existing header
  const header = container.querySelector(".fabric-analysis-header");

  // Update container content while preserving header
  const wasMinimized = container.classList.contains("minimized");
  container.innerHTML = "";
  container.appendChild(header);
  container.appendChild(details);
  container.appendChild(scoreSection);

  // Add bug report section
  const bugReportSection = document.createElement("div");
  bugReportSection.className = "bug-report-section";

  const bugReportText = document.createElement("p");
  bugReportText.textContent = "Encountered a problem? Tell us!";
  bugReportText.className = "bug-report-text";

  const bugReportButton = document.createElement("button");
  bugReportButton.textContent = "Report Bug";
  bugReportButton.className = "bug-report-button";
  bugReportButton.onclick = () => showBugReportForm();

  bugReportSection.appendChild(bugReportText);
  bugReportSection.appendChild(bugReportButton);
  container.appendChild(bugReportSection);

  if (wasMinimized) {
    container.classList.add("minimized");
  }
}

// Start the analysis when the page is ready
if (document.readyState === "complete") {
  init();
} else {
  window.addEventListener("load", init);
}

// Cleanup function to stop click listening
function cleanup() {
  if (isClickListening) {
    stopClickListening();
  }
}

// Ensure cleanup when page is unloaded
window.addEventListener("beforeunload", cleanup);
window.addEventListener("unload", cleanup);

// Show bug report form
function showBugReportForm() {
  // Create modal overlay
  const modal = document.createElement("div");
  modal.className = "bug-report-modal";
  modal.id = "bug-report-modal";

  const modalContent = document.createElement("div");
  modalContent.className = "bug-report-modal-content";

  const modalHeader = document.createElement("div");
  modalHeader.className = "bug-report-modal-header";

  const modalTitle = document.createElement("h3");
  modalTitle.textContent = "Report a Bug";

  const closeModalBtn = document.createElement("button");
  closeModalBtn.className = "close-modal-button";
  closeModalBtn.textContent = "✕";
  closeModalBtn.onclick = () => modal.remove();

  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeModalBtn);

  const form = document.createElement("form");
  form.className = "bug-report-form";

  // URL field
  const urlField = document.createElement("div");
  urlField.className = "form-field";

  const urlLabel = document.createElement("label");
  urlLabel.textContent = "Page URL:";
  urlLabel.htmlFor = "bug-url";

  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.id = "bug-url";
  urlInput.value = window.location.href;
  urlInput.readOnly = true;

  urlField.appendChild(urlLabel);
  urlField.appendChild(urlInput);

  // Description field
  const descField = document.createElement("div");
  descField.className = "form-field";

  const descLabel = document.createElement("label");
  descLabel.textContent = "What went wrong?";
  descLabel.htmlFor = "bug-description";

  const descTextarea = document.createElement("textarea");
  descTextarea.id = "bug-description";
  descTextarea.placeholder = "Describe the issue you encountered...";
  descTextarea.rows = 4;
  descTextarea.required = true;

  descField.appendChild(descLabel);
  descField.appendChild(descTextarea);

  // Submit button
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Submit Report";
  submitBtn.className = "submit-bug-report";

  form.appendChild(urlField);
  form.appendChild(descField);
  form.appendChild(submitBtn);

  // Handle form submission
  form.onsubmit = function (e) {
    e.preventDefault();

    const description = descTextarea.value.trim();
    if (!description) {
      alert("Please describe the issue.");
      return;
    }

    // Create bug report details
    const bugReportText =
      `Bug Report Details:\n\n` +
      `Page URL: ${window.location.href}\n\n` +
      `Description: ${description}\n\n` +
      `---\n` +
      `Reported via Fabric Composition Extension\n\n` +
      `Please send this report to: fabricompositionanalysis@gmail.com`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(bugReportText)
      .then(() => {
        alert(
          "Bug report copied to clipboard! Please paste it into an email and send to fabricompositionanalysis@gmail.com"
        );
      })
      .catch(() => {
        // Fallback if clipboard API fails
        const textArea = document.createElement("textarea");
        textArea.value = bugReportText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert(
          "Bug report copied to clipboard! Please paste it into an email and send to fabricompositionanalysis@gmail.com"
        );
      });

    modal.remove();
  };

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(form);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

// Show UI when no composition is found
function showNoCompositionUI() {
  const container = document.getElementById("fabric-analysis-container");
  if (!container) return;

  const header = container.querySelector(".fabric-analysis-header");

  // Create no composition message
  const noCompositionSection = document.createElement("div");
  noCompositionSection.className = "no-composition-section";

  const noCompositionText = document.createElement("p");
  noCompositionText.textContent = "No fabric composition found on this page.";
  noCompositionText.className = "no-composition-text";

  noCompositionSection.appendChild(noCompositionText);

  // Update container content while preserving header and bug report section
  const bugReportSection = container.querySelector(".bug-report-section");

  // Clear content but preserve header
  const wasMinimized = container.classList.contains("minimized");
  container.innerHTML = "";
  container.appendChild(header);

  // Add no composition section
  container.appendChild(noCompositionSection);

  // Add click listener section using helper function
  const clickListenerSection = createClickListenerButton();
  container.appendChild(clickListenerSection);

  // Add bug report section
  if (bugReportSection) {
    container.appendChild(bugReportSection);
  }

  // Restore minimized state if it was minimized
  if (wasMinimized) {
    container.classList.add("minimized");
  }
}

// Show UI when there's an error
function showErrorUI(error) {
  const container = document.getElementById("fabric-analysis-container");
  if (!container) return;

  const header = container.querySelector(".fabric-analysis-header");

  // Create error message
  const errorSection = document.createElement("div");
  errorSection.className = "error-section";

  const errorText = document.createElement("p");
  errorText.textContent = "An error occurred while analyzing this page.";
  errorText.className = "error-text";

  errorSection.appendChild(errorText);

  // Update container content while preserving header and bug report section
  const bugReportSection = container.querySelector(".bug-report-section");

  // Clear content but preserve header
  const wasMinimized = container.classList.contains("minimized");
  container.innerHTML = "";
  container.appendChild(header);

  // Add error section
  container.appendChild(errorSection);

  // Add click listener section using helper function
  const clickListenerSection = createClickListenerButton();
  container.appendChild(clickListenerSection);

  // Add bug report section
  if (bugReportSection) {
    container.appendChild(bugReportSection);
  }

  // Restore minimized state if it was minimized
  if (wasMinimized) {
    container.classList.add("minimized");
  }
}
