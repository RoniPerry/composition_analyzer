// Farfetch specific parser
window.farfetchParser = function(element) {
    const sections = [];
    const text = element.textContent.trim();
    console.log('Parsing Farfetch text:', text);

    // Helper function to clean up text
    function cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // Match percentages and materials directly from text
    const materials = text.match(/([A-Za-z]+)\s+(\d+)%/g);
    if (materials) {
        const cleanedMaterials = materials.map(m => {
            const [, material, percentage] = m.match(/([A-Za-z]+)\s+(\d+)%/);
            return `${percentage}% ${material.toLowerCase()}`;
        });
        
        sections.push({
            component: "MAIN FABRIC",
            text: cleanText(cleanedMaterials.join(' '))
        });
    }

    // If no sections found through specific parsing, try generic parser
    if (sections.length === 0) {
        const genericSections = window.genericParser(element);
        if (genericSections) {
            sections.push(...genericSections);
        }
    }

    console.log('Farfetch parser found sections:', sections);
    return sections.length > 0 ? sections : null;
} 