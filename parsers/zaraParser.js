// Zara specific parser
window.zaraParser = function(element) {
    const sections = [];
    const text = element.textContent.trim();
    console.log('Parsing Zara text:', text);

    // Helper function to clean up text
    function cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // Try to parse Zara's specific format first
    const components = [
        { label: 'OUTER SHELL', regex: /OUTER\s*SHELL\s*(\d+%[^L]+)/ },
        { label: 'LINING\nUPPER PART', regex: /UPPER\s*PART\s*(\d+%[^L]+)/ },
        { label: 'LINING\nLOWER PART', regex: /LOWER\s*PART\s*(\d+%[^L]+)/ }
    ];

    // Try each component pattern
    for (const { label, regex } of components) {
        const match = text.match(regex);
        if (match) {
            const materialText = cleanText(match[1]);
            sections.push({
                component: label,
                text: materialText.toLowerCase()
            });
        }
    }

    // If no sections found through specific parsing, try generic parser
    if (sections.length === 0) {
        const genericSections = window.genericParser(element);
        if (genericSections) {
            sections.push(...genericSections);
        }
    }

    console.log('Zara parser found sections:', sections);
    return sections.length > 0 ? sections : null;
} 