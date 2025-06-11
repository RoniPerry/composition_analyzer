// Frett specific parser
window.frettParser = function(element) {
    const text = element.textContent.trim();
    console.log('Parsing Frett text:', text);
    
    // Use the original text content to preserve special characters
    const sections = [];
    const match = text.match(/(\d+)%\s*([\p{L}\p{M}\s-]+)/u);
    
    if (match) {
        const [, percentage, material] = match;
        sections.push({
            component: "MAIN FABRIC",
            text: `${percentage}% ${material.toLowerCase().trim()}`
        });
    }
    
    // If no match found, try generic parser
    if (sections.length === 0) {
        const genericSections = window.genericParser(element);
        if (genericSections) {
            sections.push(...genericSections);
        }
    }
    
    console.log('Frett parser found sections:', sections);
    return sections.length > 0 ? sections : null;
} 