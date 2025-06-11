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
    // First try to find complete valid compositions (adding up to 100%)
    const compositions = text.split(/[.;\n]/).map(part => {
        // Extract all percentage-material pairs in both formats:
        // - "75% cotton" (percentage first)
        // - "cotton 75%" (material first)
        const pairs = part.match(/(?:\d+(?:\.\d+)?%\s*[\p{L}\p{M}\s-]+|[\p{L}\p{M}\s-]+\s+\d+(?:\.\d+)?%)/gu) || [];
        if (!pairs.length) return null;

        // For each pair, clean up material name if needed
        const cleanedPairs = pairs.map(pair => {
            // Handle both formats
            let percentage, materialText;
            if (/^\d/.test(pair)) {
                // "75% cotton" format
                [percentage, ...materialParts] = pair.split(/\s+/);
                materialText = materialParts.join(' ').toLowerCase();
            } else {
                // "cotton 75%" format
                const parts = pair.split(/\s+/);
                percentage = parts.pop(); // Get the last part (percentage)
                materialText = parts.join(' ').toLowerCase();
            }
            
            // Check if this exact material exists in our database
            if (Object.keys(window.MATERIALS).some(m => m.toLowerCase() === materialText)) {
                return `${percentage} ${materialText}`; // Always output in percentage-first format
            }
            
            // If no exact match, look for partial matches
            const words = materialText.split(/\s+/);
            for (const word of words) {
                if (Object.keys(window.MATERIALS).some(m => m.toLowerCase() === word)) {
                    return `${percentage} ${word}`; // Keep just the matching material word
                }
            }
            
            return `${percentage} ${materialText}`; // Keep original if no matches found, but in consistent format
        });
        
        // Calculate total percentage
        const total = cleanedPairs.reduce((sum, pair) => {
            const percentage = parseFloat(pair.match(/\d+(?:\.\d+)?/)[0]);
            return sum + percentage;
        }, 0);
        
        // If it adds up to 100% (±0.2), this is a valid composition
        if (Math.abs(total - 100) <= 0.2) {
            return cleanedPairs.join(' ');
        }
        return null;
    }).filter(Boolean);
    
    // If we found valid compositions, return them
    if (compositions.length > 0) {
        return compositions[0]; // Take the first valid composition
    }
    
    return ''; // Return empty string if no valid compositions found
}

function normalizeCompositionText(text) {
    if (!text) return '';
    
    // Step 1: Remove common prefixes
    let normalized = text
        .replace(/^(composition:|materials:|fabric:)/i, '')
        .trim();

    // Step 2: Clean up non-composition material mentions
    normalized = cleanNonCompositionMaterials(normalized);

    // Step 3: Basic text cleanup
    normalized = normalized
        .replace(/\s+/g, ' ')            // Normalize multiple spaces to single space
        .replace(/[\u00A0]/g, ' ')       // Replace non-breaking spaces
        .replace(/&nbsp;/g, ' ')         // Replace HTML non-breaking spaces
        .replace(/[™®©]/g, '')           // Remove trademark symbols
        .toLowerCase();                   // Convert to lowercase
    
    // Step 4: Handle line breaks and commas
    normalized = normalized
        .replace(/,\s*\n/g, ' ')         // Replace comma + newline with space
        .replace(/\n/g, ' ')             // Replace newlines with space
        .replace(/,\s*/g, ' ')           // Replace commas with space
        .replace(/\s+/g, ' ')            // Clean up any double spaces
        .trim();                         // Final trim
    
    // Step 5: Extract and validate percentages
    const materials = [];
    let totalPercentage = 0;
    
    // Unified pattern that matches both formats:
    // 1. "55% cotton" or "55% makò cotton" (percentage first)
    // 2. "cotton 55%" or "makò cotton 55%" (material first)
    const regex = /(?:(\d+(?:\.\d+)?)%\s*([a-zà-ÿ\s-]+?)(?=\s+\d+%|$))|(?:([a-zà-ÿ\s-]+?)\s+(\d+(?:\.\d+)?)%)/gi;
    const matches = Array.from(normalized.matchAll(regex));
    
    for (const match of matches) {
        // Handle both formats
        const percentage = parseFloat(match[1] || match[4]);
        const material = (match[2] || match[3] || '').trim();
        
        if (percentage && material) {
            totalPercentage += percentage;
            materials.push(`${percentage}% ${material}`);
        }
    }
    
    // Step 6: Validate total percentage (allow for small rounding differences)
    if (materials.length > 0 && Math.abs(totalPercentage - 100) <= 0.2) {
        return materials.join(' ');
    }
    
    return ''; // Return empty string if validation fails
}

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.normalizeCompositionText = normalizeCompositionText;
} else {
    module.exports = normalizeCompositionText;
} 