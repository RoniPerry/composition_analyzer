// Normalizes different composition text formats into a unified format
// Input examples:
// "55% tencel 45% Cotton"
// "55% tencel, 45% Cotton"
// "55% tencel\n45% Cotton"
// "55% tencel,\n45% Cotton"
// "Cotton 75%, Polyester 25%" (H&M format)
// "100% Makò Cotton" (Special characters)
// Output format: "55% tencel 45% cotton" (space-separated, lowercase)

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
            if (/^\d/.test(pair)) {
                // "75% cotton" format
                [percentage, ...materialParts] = pair.split(/\s+/);
                materialText = materialParts.join(' '); // Remove toLowerCase()
            } else {
                // "cotton 75%" format
                const parts = pair.split(/\s+/);
                percentage = parts.pop(); // Get the last part (percentage)
                materialText = parts.join(' '); // Remove toLowerCase()
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
        .toLowerCase()                    // Convert to lowercase
        .trim();                         // Remove leading/trailing spaces
    
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
    const sectionPattern = /(shell|lining|trim|outer|main\s+fabric|fabric|material):\s*([^.;]*(?:[.;]|$))/gi;
    const sectionMatches = Array.from(normalized.matchAll(sectionPattern));
    
    if (sectionMatches.length > 0) {
        console.log('🔍 Found section headers:', sectionMatches.length);
        
        for (const match of sectionMatches) {
            const sectionType = match[1]; // Keep original casing
            const sectionContent = match[2].trim();
            console.log(`📋 Processing section: ${sectionType} = "${sectionContent}"`);
            
            // Extract materials from this section
            const sectionMaterials = extractMaterialsFromText(sectionContent);
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
        const material = match[2].trim()
            .replace(/[,.;]$/, '') // Remove trailing punctuation
            .replace(/^[,.;]/, ''); // Remove leading punctuation
        
        console.log(`📊 Processing match: percentage=${percentage}, material="${material}"`);
        
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
    
    // Validate total percentage (allow for small rounding differences)
    if (materials.length > 0 && Math.abs(totalPercentage - 100) <= 0.2) {
        const result = materials.join(' '); // Remove commas, use spaces
        console.log('✅ Validation passed! Returning:', result);
        return result;
    } else {
        console.log(`❌ Validation failed! Total: ${totalPercentage}%, expected: 100% (±0.2)`);
        console.log('❌ Materials found:', materials);
        
        // If validation fails, try to find a subset that adds up to 100%
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
                        const result = subset.join(' '); // Remove commas, use spaces
                        console.log(`✅ Found valid subset: ${result} (total: ${subsetTotal}%)`);
                        return result;
                    }
                }
            }
        }
        
        return ''; // Return empty string if validation fails
    }
}

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.normalizeCompositionText = normalizeCompositionText;
} else {
    module.exports = normalizeCompositionText;
} 