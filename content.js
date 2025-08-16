// Content script for analyzing fabric composition

// Define component patterns for parsing
const COMPONENT_NAMES = {
    MAIN: ['MAIN FABRIC', 'SHELL', 'OUTER SHELL', 'FABRIC', 'MATERIAL', 'SELF 1', 'SELF 2'],
    SUB: ['UPPER PART', 'LOWER PART', 'FRONT', 'BACK', 'SLEEVE', 'BODY', 'LINING']
};

// Get site-specific configuration
function getCurrentSiteConfig() {
    const hostname = window.location.hostname.replace('www.', '');
    console.log('Current hostname:', hostname);
    
    // Find the most specific matching configuration
    for (const [domain, config] of Object.entries(window.siteConfig)) {
        if (hostname.includes(domain)) {
            console.log('Found specific configuration for:', domain);
            return config;
        }
    }
    console.log('Using default configuration');
    return window.siteConfig.default;
}

function findCompositionSections() {
    const sections = new Set();
    
    // Try site-specific approach first
    const siteConfig = getCurrentSiteConfig();
    console.log('🔍 Using site-specific configuration');
    console.log('Using selectors:', siteConfig.selectors);
    
    // Check if site has preProcess function and run it first
    if (siteConfig.preProcess && typeof siteConfig.preProcess === 'function') {
        console.log('🔄 Running site-specific preProcess...');
        // For now, just run preProcess synchronously to avoid breaking existing functionality
        try {
            siteConfig.preProcess();
        } catch (err) {
            console.error('❌ PreProcess failed:', err);
        }
    }
    
    const siteElements = document.querySelectorAll(siteConfig.selectors.join(','));
    console.log('Found site-specific elements:', siteElements.length);
    
    let foundComposition = false;
    
    // Helper function to add section while avoiding duplicates
    function addUniqueSection(section) {
        // Clean up whitespace but preserve original material names
        section.text = section.text.replace(/\s+/g, ' ').trim();
        
        // Check if this exact combination of component and text already exists
        const exists = Array.from(sections).some(existingSection => {
            const existingObj = JSON.parse(existingSection);
            return existingObj.component === section.component && 
                   existingObj.text === section.text;
        });
        
        if (!exists) {
            sections.add(JSON.stringify(section));
            foundComposition = true;
        }
    }
    
    siteElements.forEach(element => {
        console.log('🔍 Processing element with site-specific parser:', element.outerHTML);
        const parsedSections = siteConfig.parser(element);
        console.log('Site-specific parser results:', parsedSections);
        if (parsedSections && parsedSections.length > 0) {
            console.log('✅ Site-specific parser found valid sections');
            parsedSections.forEach(section => {
                console.log('Adding section from site config:', section);
                addUniqueSection(section);
            });
        }
    });

    if (foundComposition) {
        console.log('🏁 Final result:', Array.from(sections).map(s => JSON.parse(s)));
        return Array.from(sections).map(s => JSON.parse(s));
    }
    
    console.log('No fabric composition found on this page');
    return [];
}

// Helper function to normalize material names
function normalizeMaterialName(material) {
    // Remove trademark symbols and normalize case
    material = material.toLowerCase().replace(/[™®©]/g, '');
    
    // Handle common variations and typos
    const materialMap = {
        'elastane': ['spandex', 'lycra'],
        'polyamide': ['nylon'],
        'viscose': ['rayon'],
        'acrylic': ['acrylique', 'acrilico'],
        'polyester': ['polyestere', 'poliester'],
        'cotton': ['coton', 'cotone', 'algodón'],
        'wool': ['laine', 'lana', 'wolle'],
        'silk': ['soie', 'seta', 'seide'],
        'linen': ['lin', 'lino', 'leinen'],
        'leather': ['cuir', 'cuoio', 'leder'],
        'cashmere': ['cachemire', 'cashmere', 'kaschmir'],
        'modal': ['modal®', 'modall'],
        'tencel': ['tencel®', 'tencell'],
        'lyocell': ['lyocell®', 'lyocel']
    };
    
    // Check for material variations
    for (const [standard, variations] of Object.entries(materialMap)) {
        if (variations.some(v => material.includes(v))) {
            return standard;
        }
    }
    
    return material;
}


// Get color based on sustainability score
function getColorForScore(score) {
    if (score > 5) return 'high';  // Green for scores > 5
    if (score === 5) return 'medium';  // Orange for score = 5
    return 'low';  // Red for scores < 5
}

// Initialize the composition analysis
function init() {
    if (!isProductPage()) {
        console.log('Not a product page, skipping analysis');
        return;
    }

    console.log('Analyzing page for fabric composition...');
    try {
        const compositionSections = findCompositionSections();
        
        // Always create the UI container if it doesn't exist
        let container = document.getElementById('fabric-analysis-container');
        if (!container) {
            createFloatingUI();
        }
        
        if (compositionSections && compositionSections.length > 0) {
            updateFloatingUI(compositionSections);
        } else {
            console.log('No fabric composition found on this page');
            // Show widget with just the bug report section when no composition is found
            showNoCompositionUI();
        }
    } catch (error) {
        console.error('Error analyzing page:', error);
        // Show widget with error message and bug report section
        let container = document.getElementById('fabric-analysis-container');
        if (!container) {
            createFloatingUI();
        }
        showErrorUI(error);
    }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "analyze") {
        init();
        // Send response about successful analysis
        sendResponse({ success: true });
    }
});

// Check if current page is likely a product page
function isProductPage() {
    // Common product page URL patterns
    const urlPatterns = [
        /\/p\/|\/product\/|\/item\/|\/goods\/|\/detail\/|\/productpage[\/\.]/i,
        /\/products?\//i,
        /\/shop\/[^\/]+\/[^\/]+$/i,
        /-pid-/i,
        /\/shopping\/[^\/]+\/[^\/]+/i,  // For Farfetch URLs
        /p\d{8}\.html/i,  // For Zara URLs (e.g., p08074911.html)
        /\/prd\/\d+/i  // For ASOS URLs (e.g., /prd/208118633)
    ];
    
    // Check URL patterns
    if (urlPatterns.some(pattern => pattern.test(window.location.href))) {
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
        'div[class*="product-composition"]'
    ];
    
    // Check for product page elements
    const productElements = productIndicators
        .map(selector => document.querySelector(selector))
        .filter(Boolean);
        
    return productElements.length >= 2;  // Require at least 2 product elements
}

// Create floating UI for displaying composition
function createFloatingUI() {
    const container = document.createElement('div');
    container.id = 'fabric-analysis-container';
    
    const header = document.createElement('div');
    header.className = 'fabric-analysis-header';
    header.style.cursor = 'grab';
    
    const title = document.createElement('h2');
    title.className = 'fabric-analysis-title';
    title.textContent = 'Fabric Analysis';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-button';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => container.remove();
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    container.appendChild(header);
    
    // Always add bug report section
    const bugReportSection = document.createElement('div');
    bugReportSection.className = 'bug-report-section';
    
    const bugReportText = document.createElement('p');
    bugReportText.textContent = 'Encountered a problem? Tell us!';
    bugReportText.className = 'bug-report-text';
    
    const bugReportButton = document.createElement('button');
    bugReportButton.textContent = 'Report Bug';
    bugReportButton.className = 'bug-report-button';
    bugReportButton.onclick = () => showBugReportForm();
    
    bugReportSection.appendChild(bugReportText);
    bugReportSection.appendChild(bugReportButton);
    container.appendChild(bugReportSection);
    
    // Add drag functionality
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    header.addEventListener('mousedown', function(e) {
        if (e.target === closeBtn) return; // Don't drag when clicking close button
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = container.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        header.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newLeft = startLeft + deltaX;
        const newTop = startTop + deltaY;
        
        container.style.left = newLeft + 'px';
        container.style.top = newTop + 'px';
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
        }
    });
    
    document.body.appendChild(container);
    return container;
}

// Update the floating UI with composition data
function updateFloatingUI(compositions) {
    const container = document.getElementById('fabric-analysis-container');
    if (!container) return;
    
    // Calculate sustainability score
    let totalScore = 0;
    let totalPercentage = 0;
    
    compositions.forEach(section => {
        // Parse the normalized text which is in format "55% material 45% material"
        const parts = section.text.split(/\s+(?=\d+%)/);
        parts.forEach(part => {
            const [percentage, ...materialParts] = part.split(/\s+/);
            const material = materialParts.join(' ');
            const percentageValue = parseInt(percentage, 10);
            
            const materialInfo = Object.entries(window.MATERIALS).find(([key]) => {
                // Try exact match first
                if (material === key.toLowerCase().trim()) {
                    return true;
                }
                
                // Try flexible matching for different word orders
                const materialWords = material.toLowerCase().trim().split(/\s+/).sort().join(' ');
                const keyWords = key.toLowerCase().trim().split(/\s+/).sort().join(' ');
                if (materialWords === keyWords) {
                    return true;
                }
                
                // Try partial matching for special materials like "lenzing ecovero viscose"
                if (material.toLowerCase().includes('lenzing') && material.toLowerCase().includes('ecovero')) {
                    return key.toLowerCase().includes('lenzing') && key.toLowerCase().includes('ecovero');
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
    const finalScore = totalPercentage > 0 ? Math.round((totalScore * (100 / totalPercentage)) / 10) : 0;
    
    // Set container score attribute for styling
    container.setAttribute('data-score', getColorForScore(finalScore));
    
    // Create composition details section
    const details = document.createElement('div');
    details.className = 'composition-details';
    
    // Group materials by main component (OUTER SHELL or LINING)
    const mainComponents = new Map();
    compositions.forEach(section => {
        const [main, ...subParts] = section.component.split('\n');
        if (!mainComponents.has(main)) {
            mainComponents.set(main, []);
        }
        mainComponents.get(main).push({
            subParts,
            text: section.text
        });
    });
    
    // Add each component section
    mainComponents.forEach((items, mainComponent) => {
        const componentSection = document.createElement('div');
        componentSection.className = 'component-section';
        
        const mainTitle = document.createElement('h3');
        mainTitle.textContent = mainComponent;
        componentSection.appendChild(mainTitle);
        
        items.forEach(item => {
            if (item.subParts.length > 0) {
                // Add sub-parts
                item.subParts.forEach(subPart => {
                    const subTitle = document.createElement('h3');
                    subTitle.textContent = subPart;
                    subTitle.style.marginLeft = '20px';
                    componentSection.appendChild(subTitle);
                });
            }
            
            // Add materials
            const parts = item.text.split(/\s+(?=\d+%)/);
            parts.forEach(part => {
                const [percentage, ...materialParts] = part.split(/\s+/);
                const material = materialParts.join(' ');
                
                const materialDiv = document.createElement('div');
                materialDiv.className = 'material-item';
                
                const materialInfo = Object.entries(window.MATERIALS).find(([key]) => {
                    // Try exact match first
                    if (material === key.toLowerCase().trim()) {
                        return true;
                    }
                    
                    // Try flexible matching for different word orders
                    const materialWords = material.toLowerCase().trim().split(/\s+/).sort().join(' ');
                    const keyWords = key.toLowerCase().trim().split(/\s+/).sort().join(' ');
                    if (materialWords === keyWords) {
                        return true;
                    }
                    
                    // Try partial matching for special materials like "lenzing ecovero viscose"
                    if (material.toLowerCase().includes('lenzing') && material.toLowerCase().includes('ecovero')) {
                        return key.toLowerCase().includes('lenzing') && key.toLowerCase().includes('ecovero');
                    }
                    
                    return false;
                });
                
                if (materialInfo) {
                    materialDiv.setAttribute('data-category', materialInfo[1].category);
                }
                
                materialDiv.style.marginLeft = item.subParts.length > 0 ? '20px' : '0';
                materialDiv.textContent = `${percentage} ${material}`;
                componentSection.appendChild(materialDiv);
            });
        });
        
        details.appendChild(componentSection);
    });
    
    // Add sustainability score
    const scoreSection = document.createElement('div');
    scoreSection.className = 'sustainability-score';
    
    const scoreValue = document.createElement('h3');
    scoreValue.textContent = `${finalScore}/10`;
    scoreSection.appendChild(scoreValue);
    
    // Get existing header
    const header = container.querySelector('.fabric-analysis-header');
    
    // Update container content while preserving header
    const wasMinimized = container.classList.contains('minimized');
    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(details);
    container.appendChild(scoreSection);
    
    // Add bug report section
    const bugReportSection = document.createElement('div');
    bugReportSection.className = 'bug-report-section';
    
    const bugReportText = document.createElement('p');
    bugReportText.textContent = 'Encountered a problem? Tell us!';
    bugReportText.className = 'bug-report-text';
    
    const bugReportButton = document.createElement('button');
    bugReportButton.textContent = 'Report Bug';
    bugReportButton.className = 'bug-report-button';
    bugReportButton.onclick = () => showBugReportForm();
    
    bugReportSection.appendChild(bugReportText);
    bugReportSection.appendChild(bugReportButton);
    container.appendChild(bugReportSection);
    
    if (wasMinimized) {
        container.classList.add('minimized');
    }
}

// Start the analysis when the page is ready
if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}

// Show bug report form
function showBugReportForm() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'bug-report-modal';
    modal.id = 'bug-report-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bug-report-modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'bug-report-modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Report a Bug';
    
    const closeModalBtn = document.createElement('button');
    closeModalBtn.className = 'close-modal-button';
    closeModalBtn.textContent = '✕';
    closeModalBtn.onclick = () => modal.remove();
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeModalBtn);
    
    const form = document.createElement('form');
    form.className = 'bug-report-form';
    
    // URL field
    const urlField = document.createElement('div');
    urlField.className = 'form-field';
    
    const urlLabel = document.createElement('label');
    urlLabel.textContent = 'Page URL:';
    urlLabel.htmlFor = 'bug-url';
    
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.id = 'bug-url';
    urlInput.value = window.location.href;
    urlInput.readOnly = true;
    
    urlField.appendChild(urlLabel);
    urlField.appendChild(urlInput);
    
    // Description field
    const descField = document.createElement('div');
    descField.className = 'form-field';
    
    const descLabel = document.createElement('label');
    descLabel.textContent = 'What went wrong?';
    descLabel.htmlFor = 'bug-description';
    
    const descTextarea = document.createElement('textarea');
    descTextarea.id = 'bug-description';
    descTextarea.placeholder = 'Describe the issue you encountered...';
    descTextarea.rows = 4;
    descTextarea.required = true;
    
    descField.appendChild(descLabel);
    descField.appendChild(descTextarea);
    
    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Submit Report';
    submitBtn.className = 'submit-bug-report';
    
    form.appendChild(urlField);
    form.appendChild(descField);
    form.appendChild(submitBtn);
    
    // Handle form submission
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const description = descTextarea.value.trim();
        if (!description) {
            alert('Please describe the issue.');
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
        navigator.clipboard.writeText(bugReportText).then(() => {
            alert('Bug report copied to clipboard! Please paste it into an email and send to fabricompositionanalysis@gmail.com');
        }).catch(() => {
            // Fallback if clipboard API fails
            const textArea = document.createElement('textarea');
            textArea.value = bugReportText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Bug report copied to clipboard! Please paste it into an email and send to fabricompositionanalysis@gmail.com');
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
    const container = document.getElementById('fabric-analysis-container');
    if (!container) return;
    
    const header = container.querySelector('.fabric-analysis-header');
    
    // Create no composition message
    const noCompositionSection = document.createElement('div');
    noCompositionSection.className = 'no-composition-section';
    
    const noCompositionText = document.createElement('p');
    noCompositionText.textContent = 'No fabric composition found on this page.';
    noCompositionText.className = 'no-composition-text';
    
    noCompositionSection.appendChild(noCompositionText);
    
    // Update container content while preserving header and bug report section
    const bugReportSection = container.querySelector('.bug-report-section');
    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(noCompositionSection);
    if (bugReportSection) {
        container.appendChild(bugReportSection);
    }
}

// Show UI when there's an error
function showErrorUI(error) {
    const container = document.getElementById('fabric-analysis-container');
    if (!container) return;
    
    const header = container.querySelector('.fabric-analysis-header');
    
    // Create error message
    const errorSection = document.createElement('div');
    errorSection.className = 'error-section';
    
    const errorText = document.createElement('p');
    errorText.textContent = 'An error occurred while analyzing this page.';
    errorText.className = 'error-text';
    
    errorSection.appendChild(errorText);
    
    // Update container content while preserving header and bug report section
    const bugReportSection = container.querySelector('.bug-report-section');
    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(errorSection);
    if (bugReportSection) {
        container.appendChild(bugReportSection);
    }
} 