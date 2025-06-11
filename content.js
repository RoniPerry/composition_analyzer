// Content script for analyzing fabric composition

// Material definitions with sustainability scores and categories
const MATERIALS = {
    // Perfect sustainability (100) - regenerative and closed-loop materials
    'recycled ocean plastic': { score: 100, category: 'regenerative' }, // Removes pollution + closed loop
    'mycelium leather': { score: 100, category: 'regenerative' }, // Carbon negative + biodegradable
    'agricultural waste fiber': { score: 100, category: 'regenerative' }, // Uses waste + improves soil
    
    // Highly sustainable materials (85-95)
    'organic cotton': { score: 90, category: 'sustainable' },
    'hemp': { score: 95, category: 'sustainable' }, // Lower water use than cotton, improves soil
    'recycled cotton': { score: 85, category: 'sustainable' },
    'recycled wool': { score: 80, category: 'sustainable' },
    'linen': { score: 85, category: 'sustainable' },
    'tencel': { score: 85, category: 'sustainable' },
    'tencel modal': { score: 85, category: 'sustainable' }, // Sustainable due to closed-loop production process
    'lyocell': { score: 85, category: 'sustainable' },  // Sustainable cellulose fiber with closed-loop production
    'rws wool': { score: 90, category: 'sustainable' },
    'rws extrafine merino': { score: 90, category: 'sustainable' },
    'extrafine merino': { score: 85, category: 'sustainable' },
    'responsible wool': { score: 85, category: 'sustainable' },
    'merino wool': { score: 80, category: 'sustainable' },
    'merino': { score: 80, category: 'sustainable' },
    
    // Moderate impact materials (60-75)
    'mako cotton': { score: 75, category: 'moderate' },
    'makò cotton': { score: 75, category: 'moderate' },
    'makō cotton': { score: 75, category: 'moderate' },
    'modal': { score: 70, category: 'moderate' },
    'cotton': { score: 60, category: 'moderate' },
    'wool': { score: 65, category: 'moderate' },
    'viscose': { score: 60, category: 'moderate' },
    'silk': { score: 65, category: 'moderate' },
    'rayon': { score: 45, category: 'moderate' },  // Added for geel.us
    
    // Synthetic/Animal Welfare Concern materials (20-40)
    'polyester': { score: 30, category: 'synthetic' },
    'nylon': { score: 25, category: 'synthetic' },
    'elastane': { score: 30, category: 'synthetic' },
    'spandex': { score: 30, category: 'synthetic' },
    'polyamide': { score: 25, category: 'synthetic' },
    'acrylic': { score: 20, category: 'synthetic' },  // Very low score due to microplastic concerns

    // Animal welfare concern materials (5-25)
    'angora': { score: 15, category: 'animal_welfare' },     // Reduced score due to serious animal welfare concerns
    'mohair': { score: 15, category: 'animal_welfare' },     // Similar concerns to angora
    'exotic leather': { score: 5, category: 'animal_welfare' }, // Extremely low score due to endangered species concerns
    'fur': { score: 10, category: 'animal_welfare' },        // Very low score due to animal welfare issues
    'down': { score: 20, category: 'animal_welfare' },       // Unless certified responsible
    'feathers': { score: 20, category: 'animal_welfare' },   // Unless certified responsible
    'exotic fur': { score: 5, category: 'animal_welfare' },  // Extremely low score for exotic animal furs
    'karakul': { score: 5, category: 'animal_welfare' },     // Very low score due to lamb welfare concerns
    'shahtoosh': { score: 5, category: 'animal_welfare' },   // Critically endangered Tibetan antelope
    'snake skin': { score: 10, category: 'animal_welfare' }, // Low score due to reptile welfare concerns
    'alligator': { score: 10, category: 'animal_welfare' },  // Low score due to reptile welfare concerns
    'crocodile': { score: 10, category: 'animal_welfare' },   // Low score due to reptile welfare concerns
};

// Define component patterns for parsing
const COMPONENT_NAMES = {
    MAIN: ['MAIN FABRIC', 'SHELL', 'OUTER SHELL', 'FABRIC', 'MATERIAL'],
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
    
    const siteElements = document.querySelectorAll(siteConfig.selectors.join(','));
    console.log('Found site-specific elements:', siteElements.length);
    
    let foundComposition = false;
    
    // Helper function to normalize material text
    function normalizeMaterialText(text) {
        return text.toLowerCase()
            .replace(/rayon/g, 'viscose')  // Normalize rayon/viscose
            .replace(/spandex/g, 'elastane')  // Normalize spandex/elastane
            .trim();
    }
    
    // Helper function to add section while avoiding duplicates
    function addUniqueSection(section) {
        // Normalize the text to help with deduplication
        section.text = normalizeMaterialText(section.text);
        
        // Check if this section's text is already included in any existing section
        const normalizedNewText = section.text.replace(/\s+/g, ' ').trim();
        const exists = Array.from(sections).some(existingSection => {
            const existingObj = JSON.parse(existingSection);
            const normalizedExistingText = existingObj.text.replace(/\s+/g, ' ').trim();
            return normalizedExistingText === normalizedNewText;
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

// Function to extract materials and their percentages from text
function extractMaterials(text) {
    if (!text) return [];
    
    const materials = [];
    const matches = text.match(/(\d+)%\s*([A-Za-z\s-]+)/g) || [];
    
    matches.forEach(match => {
        const [, percentage, material] = match.match(/(\d+)%\s*([A-Za-z\s-]+)/) || [];
        if (percentage && material) {
            materials.push({
                name: normalizeMaterialName(material.trim()),
                percentage: parseInt(percentage, 10)
            });
        }
    });
    
    return materials;
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
        if (compositionSections && compositionSections.length > 0) {
            // Check if container already exists
            let container = document.getElementById('fabric-analysis-container');
            if (!container) {
                // If not, create new UI
                createFloatingUI();
            }
            updateFloatingUI(compositionSections);
        } else {
            console.log('No fabric composition found on this page');
        }
    } catch (error) {
        console.error('Error analyzing page:', error);
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
        /\/shop\/[^\/]+$/i,
        /-pid-/i,
        /\/shopping\/[^\/]+\/[^\/]+/i,  // For Farfetch URLs
        /p\d{8}\.html/i  // For Zara URLs (e.g., p08074911.html)
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
        const extractedMaterials = extractMaterials(section.text);
        extractedMaterials.forEach(material => {
            const materialInfo = Object.entries(MATERIALS).find(([key]) => 
                material.name.toLowerCase().includes(key)
            );
            
            if (materialInfo) {
                totalScore += materialInfo[1].score * (material.percentage / 100);
                totalPercentage += material.percentage;
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
            materials: extractMaterials(section.text)
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
            item.materials.forEach(material => {
                const materialDiv = document.createElement('div');
                materialDiv.className = 'material-item';
                
                const materialInfo = Object.entries(MATERIALS).find(([key]) => 
                    material.name.toLowerCase().includes(key)
                );
                
                if (materialInfo) {
                    materialDiv.setAttribute('data-category', materialInfo[1].category);
                }
                
                materialDiv.style.marginLeft = item.subParts.length > 0 ? '20px' : '0';
                materialDiv.textContent = `${material.percentage}% ${material.name}`;
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