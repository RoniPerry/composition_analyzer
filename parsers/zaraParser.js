// Zara specific parser
window.zaraParser = function(element) {
    const sections = [];
    const text = element.textContent.trim();
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

    // Helper function to parse material and percentage
    function parseMaterialPercentage(text) {
        console.log('Parsing material text:', text);
        
        // Handle multiple materials in one section (e.g., "68% cotton 32% polyester")
        const materials = [];
        
        // Since text might not have newlines, use regex to find all percentage-material pairs
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
        
        console.log('No materials found in text');
        return null;
    }

    // Simple approach: treat each section as a flat component
    let currentSection = null;
    let currentContent = [];
    
    // Since the text might not have newlines, we need to use regex to find sections
    // Look for section headers in the concatenated text
    const sectionPattern = /(OUTER\s*SHELL|MAIN\s*FABRIC|EMBELLISHMENT|LINING)/gi;
    const sectionMatches = Array.from(text.matchAll(sectionPattern));
    
    console.log('Found section matches:', sectionMatches);
    
    if (sectionMatches.length > 0) {
        // Process each section
        for (let i = 0; i < sectionMatches.length; i++) {
            const currentMatch = sectionMatches[i];
            const sectionName = currentMatch[1];
            const sectionStart = currentMatch.index;
            
            // Find the end of this section (start of next section or end of text)
            const nextSectionStart = i < sectionMatches.length - 1 ? sectionMatches[i + 1].index : text.length;
            const sectionContent = text.substring(sectionStart + sectionName.length, nextSectionStart).trim();
            
            console.log(`Processing section: ${sectionName}`);
            console.log(`Section content: "${sectionContent}"`);
            
            // Extract materials from this section
            const material = parseMaterialPercentage(sectionContent);
            if (material) {
                sections.push({
                    component: sectionName,
                    text: material
                });
                console.log(`Added section: ${sectionName} = ${material}`);
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