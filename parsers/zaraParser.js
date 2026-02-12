// Zara specific parser
window.zaraParser = function(element) {
    const sections = [];
    var text = element.textContent.trim();

    // Strip "Which contains at least:" section and everything after it
    // COS/Zara pages repeat materials under this heading with certification details
    var containsIdx = text.indexOf('Which contains at least');
    if (containsIdx !== -1) {
        text = text.substring(0, containsIdx).trim();
        console.log('Stripped "Which contains at least" section');
    }

    console.log('Parsing Zara text:', text);
    console.log('Raw text length:', text.length);
    console.log('Text contains newlines:', text.includes('\n'));
    console.log('Text contains MAIN FABRIC:', text.includes('MAIN FABRIC'));
    console.log('Text contains EMBELLISHMENT:', text.includes('EMBELLISHMENT'));
    
    // Debug: Log the exact text structure
    console.log('Text structure:');
    const lines = text.split('\n');
    console.log('Total lines:', lines.length);
    lines.forEach((line, index) => {
        console.log(`Line ${index}: "${line}" (length: ${line.length})`);
    });

    // Helper function to clean up text
    function cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // Helper function to parse material and percentage using the normalizer
    function parseMaterialPercentage(text) {
        console.log('Parsing material text:', text);
        
        // Use the normalizer to handle both material formats and preserve sections
        if (window.normalizeCompositionText) {
            console.log('Using normalizer for material parsing');
            const normalized = window.normalizeCompositionText(text);
            console.log('Normalizer result:', normalized);
            return normalized;
        } else {
            console.log('Normalizer not available, falling back to basic parsing');
            // Fallback to basic parsing if normalizer isn't available
            const materials = [];
            const materialPattern = /(\d+)%\s*([A-Za-z\s-]+)/gi;
            const materialMatches = Array.from(text.matchAll(materialPattern));
            
            console.log('Found material matches:', materialMatches);
            
            for (const match of materialMatches) {
                const percentage = match[1];
                const material = match[2].toLowerCase().trim();
                const materialEntry = `${percentage}% ${material}`;
                materials.push(materialEntry);
                console.log('Found material entry:', materialEntry);
            }
            
            if (materials.length > 0) {
                const result = materials.join(' ');
                console.log('Final combined materials:', result);
                return result;
            }
        }
        
        console.log('No materials found in text');
        return null;
    }

    // Simple approach: treat each section as a flat component
    let currentSection = null;
    let currentContent = [];
    
    // Since the text might not have newlines, we need to use regex to find sections
    // Look for section headers in the concatenated text (with or without colons)
    const sectionPattern = /(OUTER\s*SHELL|BASE\s*FABRIC|MAIN\s*FABRIC|COATING|FILLING|EMBELLISHMENT|POCKET\s*LINING|LINING|TRIM|SHELL|FABRIC):?\s*/gi;
    const sectionMatches = Array.from(text.matchAll(sectionPattern));
    
    console.log('Found section matches:', sectionMatches);
    
    if (sectionMatches.length > 0) {
        // Build sections: combine parent + child headers (e.g., "OUTER SHELL" + "BASE FABRIC")
        let pendingParent = null;

        for (let i = 0; i < sectionMatches.length; i++) {
            const currentMatch = sectionMatches[i];
            const sectionName = currentMatch[1];
            const sectionStart = currentMatch.index;
            const sectionEnd = currentMatch.index + currentMatch[0].length;

            // Find the end of this section (start of next section or end of text)
            const nextSectionStart = i < sectionMatches.length - 1 ? sectionMatches[i + 1].index : text.length;
            const sectionContent = text.substring(sectionEnd, nextSectionStart).trim();

            console.log(`Processing section: ${sectionName}`);
            console.log(`Section content: "${sectionContent}"`);

            // Check if this section has actual material content (percentages)
            const hasMaterials = /\d+%/.test(sectionContent);

            if (!hasMaterials && !sectionContent) {
                // Empty section - this is a parent header (e.g., "OUTER SHELL" before "BASE FABRIC")
                pendingParent = sectionName;
                console.log(`Pending parent header: ${sectionName}`);
                continue;
            }

            // Build the display name
            let displayName = sectionName;
            if (pendingParent) {
                displayName = pendingParent + ' - ' + sectionName;
                pendingParent = null;
            }

            // Extract materials from this section
            const material = parseMaterialPercentage(sectionContent);
            if (material) {
                sections.push({
                    component: displayName,
                    text: material
                });
                console.log(`Added section: ${displayName} = ${material}`);
            } else {
                pendingParent = null;
            }
        }
    } else {
        // Fallback: if no sections found, try to extract all materials
        console.log('No sections found, trying to extract all materials...');
        const material = parseMaterialPercentage(text);
        if (material) {
            sections.push({
                component: 'MAIN FABRIC',
                text: material
            });
        }
    }

    console.log('Zara parser found sections:', sections);
    
    // If no sections were found, try a fallback approach
    if (sections.length === 0) {
        console.log('No sections found, trying fallback parsing...');
        
        // Look for any percentage-material patterns in the text
        const allMaterials = [];
        const materialMatches = text.matchAll(/(\d+)%\s*([A-Za-z\s-]+)/gi);
        
        for (const match of materialMatches) {
            const percentage = match[1];
            const material = match[2].toLowerCase().trim();
            allMaterials.push(`${percentage}% ${material}`);
        }
        
        if (allMaterials.length > 0) {
            console.log('Found materials with fallback method:', allMaterials);
            sections.push({
                component: 'MAIN FABRIC',
                text: allMaterials.join(' ')
            });
        }
    }
    
    return sections.length > 0 ? sections : null;
} 