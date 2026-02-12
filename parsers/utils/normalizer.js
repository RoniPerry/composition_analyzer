// Normalizes different composition text formats into a unified format
// Input examples:
// "55% tencel 45% Cotton"
// "55% tencel, 45% Cotton"
// "55% tencel\n45% Cotton"
// "55% tencel,\n45% Cotton"
// "Cotton 75%, Polyester 25%" (H&M format)
// "100% Makò Cotton" (Special characters)
// Output format: "55% tencel 45% cotton" (space-separated, lowercase)

// Material synonym map for normalization
const MATERIAL_SYNONYMS = {
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

// Helper function to normalize material name using synonym map
function normalizeMaterialName(material) {
    // Remove trademark symbols and normalize case
    material = material.toLowerCase().replace(/[™®©]/g, '').trim();

    // Check for material variations
    for (const [standard, variations] of Object.entries(MATERIAL_SYNONYMS)) {
        if (variations.some(v => material.includes(v))) {
            return standard;
        }
        // Also check if material exactly matches the standard name
        if (material === standard) {
            return standard;
        }
    }

    return material;
}

// Helper function to clean text of material names in non-composition contexts
function cleanNonCompositionMaterials(text) {
    console.log('🧽 cleanNonCompositionMaterials called with:', text);
    
    // Check if materials database is available
    const materialsDB = (typeof window !== 'undefined' ? window.MATERIALS : global.MATERIALS);
    if (!materialsDB || typeof materialsDB !== 'object') {
        console.log('⚠️ Materials database not available, skipping material cleaning');
        return text; // Return original text if no database
    }
    
    // First try to find complete valid compositions (adding up to 100%)
    const compositions = text.split(/[.;\n]/).map(part => {
        console.log('🔍 Processing part:', part);
        
        // Extract all percentage-material pairs in both formats:
        // - "75% cotton" (percentage first)
        // - "cotton 75%" (material first)
        const pairs = part.match(/(?:\d+(?:\.\d+)?%\s*[\p{L}\p{M}\s-]+|[\p{L}\p{M}\s-]+\s+\d+(?:\.\d+)?%)/gu) || [];
        console.log('📊 Found pairs in part:', pairs);
        
        if (!pairs.length) {
            console.log('❌ No pairs found in part');
            return null;
        }

        // For each pair, clean up material name if needed
        const cleanedPairs = pairs.map(pair => {
            console.log('🔧 Processing pair:', pair);
            
            // Handle both formats
            let percentage, materialText;
            let materialParts;
            if (/^\d/.test(pair)) {
                // "75% cotton" format
                [percentage, ...materialParts] = pair.split(/\s+/);
                materialText = materialParts.join(' ').trim(); // Remove toLowerCase()
            } else {
                // "cotton 75%" format
                const parts = pair.split(/\s+/);
                percentage = parts.pop(); // Get the last part (percentage)
                materialText = parts.join(' ').trim(); // Remove toLowerCase()
            }
            
            console.log(`📊 Extracted: percentage=${percentage}, material="${materialText}"`);
            
            // Check if this exact material exists in our database
            if (Object.keys(materialsDB).some(m => m.toLowerCase() === materialText.toLowerCase())) {
                const result = `${percentage} ${materialText}`;
                console.log(`✅ Exact match found: ${result}`);
                return result; // Always output in percentage-first format
            }
            
            // Check for special material patterns that should be preserved
            // Special handling for materials like "Lenzing Ecovero Viscose", "Makò Cotton", "Pima Cotton", "BCI Cotton"
            if (materialText.toLowerCase().includes('lenzing') || 
                materialText.toLowerCase().includes('ecovero') ||
                (materialText.toLowerCase().includes('cotton') && materialText.toLowerCase() !== 'cotton')) {
                // This is a special material variety, keep the full name
                const result = `${percentage} ${materialText}`;
                console.log(`✅ Special material variety preserved: ${result}`);
                return result;
            }
            
            // If no exact match, look for partial matches
            const words = materialText.split(/\s+/);
            for (const word of words) {
                if (Object.keys(materialsDB).some(m => m.toLowerCase() === word.toLowerCase())) {
                    const result = `${percentage} ${word}`;
                    console.log(`✅ Partial match found: ${result}`);
                    return result; // Keep just the matching material word
                }
            }
            
            const result = `${percentage} ${materialText}`;
            console.log(`⚠️ No match found, keeping original: ${result}`);
            return result; // Keep original if no matches found, but in consistent format
        });
        
        console.log('🧹 Cleaned pairs:', cleanedPairs);
        
        // Calculate total percentage
        const total = cleanedPairs.reduce((sum, pair) => {
            const percentage = parseFloat(pair.match(/\d+(?:\.\d+)?/)[0]);
            return sum + percentage;
        }, 0);
        
        console.log(`🧮 Total percentage for part: ${total}%`);
        
        // If it adds up to 100% (±0.2), this is a valid composition
        if (Math.abs(total - 100) <= 0.2) {
            const result = cleanedPairs.join(' ');
            console.log(`✅ Valid composition found: ${result}`);
            return result;
        }
        console.log(`❌ Part does not add up to 100%`);
        return null;
    }).filter(Boolean);
    
    console.log('📋 Valid compositions found:', compositions);
    
    // If we found valid compositions, return them
    if (compositions.length > 0) {
        const result = compositions[0]; // Take the first valid composition
        console.log(`🎯 Returning first valid composition: ${result}`);
        return result;
    }
    
    console.log('❌ No valid compositions found, returning empty string');
    return '';
}

function normalizeCompositionText(text) {
    if (!text) return '';
    
    console.log('🔄 normalizeCompositionText called with:', text);
    
    // Step 1: Remove common prefixes
    let normalized = text
        .replace(/^(composition:|materials:|fabric:)/i, '')
        .trim();
    
    console.log('📝 After removing prefixes:', normalized);

    // Step 2: Basic cleanup
    normalized = normalized
        .replace(/\s+/g, ' ')            // Normalize multiple spaces to single space
        .replace(/[\u00A0]/g, ' ')       // Replace non-breaking spaces
        .replace(/&nbsp;/g, ' ')         // Replace HTML non-breaking spaces
        .replace(/[™®©]/g, '')           // Remove trademark symbols
        // Normalize various unicode dashes to ASCII hyphen
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
        .toLowerCase()                    // Convert to lowercase
        .trim();                         // Remove leading/trailing spaces

    // Step 2.1: Remove diacritics (accents)
    try {
        normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    } catch (e) {
        // If normalize not supported, skip diacritic removal
    }
    
    console.log('✨ After basic cleanup:', normalized);
    
    // Step 3: Handle line breaks and commas
    normalized = normalized
        .replace(/,\s*\n/g, ' ')         // Replace comma + newline with space
        .replace(/\n/g, ' ')             // Replace newlines with space
        .replace(/\s+/g, ' ')            // Clean up any double spaces
        .trim();                         // Final trim
    
    console.log('🔧 After handling line breaks and commas:', normalized);
    
    // NEW: Step 4: Smart composition grouping by sections (BEFORE cleaning)
    const sections = [];
    // Use non-greedy pattern that looks ahead for the next section header
    const sectionPattern = /(shell|pocket\s+lining|lining|filling|coating|base\s+fabric|trim|outer|main\s+fabric|fabric|material|self\s*1|self\s*2):\s*(.*?)(?=\s*(?:shell|pocket\s+lining|lining|filling|coating|base\s+fabric|trim|outer|main\s+fabric|fabric|material|self\s*1|self\s*2):|$)/gi;
    const sectionMatches = Array.from(normalized.matchAll(sectionPattern));
    
    if (sectionMatches.length > 0) {
        console.log('🔍 Found section headers:', sectionMatches.length);
        
        // Capture any leading unlabeled composition before the first labeled section
        const preambleStart = 0;
        const firstSectionStart = sectionMatches[0].index;
        if (typeof firstSectionStart === 'number' && firstSectionStart > preambleStart) {
            const preambleText = normalized.slice(preambleStart, firstSectionStart).trim();
            if (preambleText) {
                // Clean preamble using robust cleaner that supports both material-first and percentage-first
                const cleaned = cleanNonCompositionMaterials(preambleText);
                const preambleMaterials = cleaned ? extractMaterialsFromText(cleaned) : '';
                if (preambleMaterials && preambleMaterials.length > 0) {
                    sections.push({
                        type: 'main fabric',
                        materials: preambleMaterials
                    });
                    console.log('✅ Added unlabeled preamble as MAIN FABRIC:', preambleMaterials);
                }
            }
        }

        for (const match of sectionMatches) {
            const sectionType = match[1]; // Keep original casing
            const sectionContent = match[2].trim();
            console.log(`📋 Processing section: ${sectionType} = "${sectionContent}"`);
            
            // Extract materials from this section
            const sectionMaterials = extractMaterialsFromText(cleanNonCompositionMaterials(sectionContent));
            if (sectionMaterials && sectionMaterials.length > 0) {
                sections.push({
                    type: sectionType,
                    materials: sectionMaterials
                });
                console.log(`✅ Added section ${sectionType}:`, sectionMaterials);
            }
        }
        
        if (sections.length > 0) {
            // Return all sections with preserved formatting
            const result = sections.map(section => 
                `${section.type}: ${section.materials}`
            ).join('. '); // Use periods instead of newlines
            
            console.log('🎯 Returning grouped sections:', result);
            return result;
        }
    }
    
    // Step 5: Clean up non-composition material mentions (fallback)
    console.log('🔄 No sections found, cleaning non-composition materials...');
    normalized = cleanNonCompositionMaterials(normalized);
    console.log('🧹 After cleaning non-composition materials:', normalized);
    
    // Step 6: Fallback to original logic if no sections found
    console.log('🔄 Using fallback logic...');
    return extractMaterialsFromText(normalized);
}

// Convert normalized composition text into an array of { component, text } objects
// Accepts either:
// - Sectioned text: "shell: 55% recycled polyester 45% rws wool. lining: 100% cotton"
// - Flat text: "55% tencel 45% cotton"
function parseSectionsToComponents(normalized) {
    if (!normalized || typeof normalized !== 'string') {
        return [];
    }

    const results = [];

    // Detect labeled sections; non-greedy up to next section label or end
    const sectionPattern = /(shell|pocket\s+lining|lining|filling|coating|base\s+fabric|trim|outer|main\s+fabric|fabric|material|self\s*1|self\s*2):\s*(.*?)(?=\s*(?:shell|pocket\s+lining|lining|filling|coating|base\s+fabric|trim|outer|main\s+fabric|fabric|material|self\s*1|self\s*2):|$)/gi;
    const matches = Array.from(normalized.matchAll(sectionPattern));

    if (matches.length > 0) {
        for (const match of matches) {
            const rawComponent = match[1];
            const content = match[2].trim()
                .replace(/^[.\s;]+/, '')
                .replace(/[.\s;]+$/, '');

            // Normalize component label to upper case (to align with Zara parser style)
            const component = rawComponent.replace(/\s+/g, ' ').toUpperCase();

            if (content) {
                results.push({ component, text: content });
            }
        }

        return results.length > 0 ? results : [];
    }

    // Fallback: treat as a single MAIN FABRIC component if it looks like composition text
    const looksLikeComposition = /\d+(?:\.\d+)?%\s+[^%\d]+/.test(normalized);
    if (looksLikeComposition) {
        return [
            {
                component: 'MAIN FABRIC',
                text: normalized.trim()
            }
        ];
    }

    return [];
}

// Helper function to extract materials from text
function extractMaterialsFromText(text) {
    const materials = [];
    let totalPercentage = 0;

    // Simple pattern that captures each percentage-material pair
    const regex = /(\d+(?:\.\d+)?)%\s*([^0-9%]+?)(?=\s*\d+%|$)/gi;
    const matches = Array.from(text.matchAll(regex));

    console.log('🔍 Regex matches found:', matches.length);
    matches.forEach((match, index) => {
        console.log(`  Match ${index}:`, match);
    });

    for (const match of matches) {
        // Handle percentage-first format: "55% cotton"
        const percentage = parseFloat(match[1]);
        let material = match[2].trim()
            .replace(/[,.;]$/, '') // Remove trailing punctuation
            .replace(/^[,.;]/, ''); // Remove leading punctuation

        console.log(`📊 Processing match: percentage=${percentage}, material="${material}"`);

        // Apply synonym normalization to material name
        const normalizedMaterial = normalizeMaterialName(material);
        if (normalizedMaterial !== material) {
            console.log(`🔄 Normalized "${material}" to "${normalizedMaterial}"`);
            material = normalizedMaterial;
        }

        if (percentage && material) {
            totalPercentage += percentage;
            materials.push(`${percentage}% ${material}`);
            console.log(`✅ Added material: ${percentage}% ${material} (total now: ${totalPercentage}%)`);
        } else {
            console.log(`❌ Invalid match: percentage=${percentage}, material="${material}"`);
        }
    }
    
    console.log('📋 Final materials array:', materials);
    console.log('🧮 Total percentage calculated:', totalPercentage);

    // Relaxed validation: accept compositions with reasonable coverage
    if (materials.length > 0) {
        // Accept if total is close to 100% (within ±0.2%)
        if (Math.abs(totalPercentage - 100) <= 0.2) {
            const result = materials.join(' ');
            console.log('✅ Validation passed (100%)! Returning:', result);
            return result;
        }

        // Accept if total is at least 90% (partial composition)
        if (totalPercentage >= 90) {
            const result = materials.join(' ');
            console.log(`✅ Partial composition accepted (${totalPercentage}%)! Returning:`, result);
            return result;
        }

        // Accept if total is between 80-89% (approximate composition)
        if (totalPercentage >= 80) {
            const result = materials.join(' ');
            console.log(`⚠️ Approximate composition accepted (${totalPercentage}%)! Returning:`, result);
            return result;
        }

        // If below 80%, try to find a subset that adds up to 100%
        console.log(`❌ Validation failed! Total: ${totalPercentage}%, below 80% threshold`);
        console.log('❌ Materials found:', materials);

        if (materials.length > 1) {
            console.log('🔄 Trying to find valid subset...');
            for (let i = 0; i < materials.length; i++) {
                for (let j = i + 1; j <= materials.length; j++) {
                    const subset = materials.slice(i, j);
                    const subsetTotal = subset.reduce((sum, mat) => {
                        const percent = parseFloat(mat.match(/\d+(?:\.\d+)?/)[0]);
                        return sum + percent;
                    }, 0);

                    if (Math.abs(subsetTotal - 100) <= 0.2) {
                        const result = subset.join(' ');
                        console.log(`✅ Found valid subset: ${result} (total: ${subsetTotal}%)`);
                        return result;
                    }
                }
            }
        }

        return ''; // Return empty string if validation fails
    }

    return '';
}

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.normalizeCompositionText = normalizeCompositionText;
    window.parseSectionsToComponents = parseSectionsToComponents;
    window.normalizeMaterialName = normalizeMaterialName;
} else {
    // Expose to global for Node-based tests while also exporting the function
    global.normalizeCompositionText = normalizeCompositionText;
    global.parseSectionsToComponents = parseSectionsToComponents;
    global.normalizeMaterialName = normalizeMaterialName;
    module.exports = normalizeCompositionText;
}