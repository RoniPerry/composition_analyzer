// H&M specific parser
window.hmParser = function(element) {
    const sections = [];
    const text = element.textContent.trim();
    console.log('Parsing H&M text:', text);

    // Helper function to clean up text
    function cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // Helper function to parse material and percentage
    function parseMaterialPercentage(text) {
        // Try "Material XX%" format
        let match = text.match(/([A-Za-z\s]+)\s*(\d+)%/);
        if (match) {
            return {
                material: match[1].trim(),
                percentage: match[2]
            };
        }
        // Try "XX% Material" format
        match = text.match(/(\d+)%\s*([A-Za-z\s]+)/);
        if (match) {
            return {
                material: match[2].trim(),
                percentage: match[1]
            };
        }
        return null;
    }

    // Try to parse comma-separated format (e.g., "Cotton 75%, Polyester 25%")
    const materials = text.split(',').map(part => {
        const parsed = parseMaterialPercentage(part.trim());
        if (parsed) {
            return `${parsed.percentage}% ${parsed.material.toLowerCase()}`;
        }
        return null;
    }).filter(Boolean);

    if (materials.length > 0) {
        sections.push({
            component: "MAIN FABRIC",
            text: materials.join(' ')
        });
        return sections;
    }

    // Try to find composition directly
    const compositionMatch = text.match(/(?:Composition|Shell|Outer|Main fabric)[:\s]*([^.]+)/i);
    if (compositionMatch) {
        const compositionText = compositionMatch[1].trim();
        // Match percentages and materials
        const materials = compositionText.match(/(\d+)%\s*([A-Za-z\s]+)(?:,|\s+|$)/g);
        if (materials) {
            sections.push({
                component: "MAIN FABRIC",
                text: cleanText(materials.join(' '))
            });
        }
    }

    // Look for additional material information
    const additionalInfoMatch = text.match(/ADDITIONAL MATERIAL INFORMATION[^]*?contains[^]*?:([^]*?)(?:$|[A-Z]{2,})/i);
    if (additionalInfoMatch) {
        // Try to parse the additional info section
        const additionalSections = window.genericParser({
            textContent: additionalInfoMatch[1]
        });
        if (additionalSections) {
            sections.push(...additionalSections);
        }
    }

    // If no sections found through specific parsing, try generic parser
    if (sections.length === 0) {
        const genericSections = window.genericParser(element);
        if (genericSections) {
            sections.push(...genericSections);
        }
    }

    console.log('H&M parser found sections:', sections);
    return sections.length > 0 ? sections : null;
} 