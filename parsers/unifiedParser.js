// Unified parser for fabric composition
// This parser expects text in the normalized format: "55% tencel 45% cotton"
window.unifiedParser = function(element) {
    const sections = [];
    const text = element.textContent.trim();
    console.log('Unified parser analyzing text:', text);

    // Helper function to clean up text
    function cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // Helper function to find composition text
    function findCompositionText(text) {
        // Get fabric words from MATERIALS constant
        const fabricWords = Object.keys(window.MATERIALS).join('|');
        
        // Look for composition prefix followed by content
        const compositionMatch = text.match(new RegExp(`(?:composition|materials?|fabric):\\s*([^.]+)`, 'i'));
        if (compositionMatch) {
            return compositionMatch[1].trim();
        }

        // Look for percentage followed by or preceded by fabric words
        const percentageMatch = text.match(new RegExp(`(?:\\b\\d+%\\s*(?:${fabricWords}))|(?:(?:${fabricWords})\\s+\\d+%)`, 'i'));
        if (percentageMatch) {
            return text;
        }

        return '';
    }

    // Try to find and parse composition text
    const compositionText = findCompositionText(text);
    if (compositionText) {
        console.log('Found composition text:', compositionText);
        
        // Use the normalizer to convert to unified format
        const normalized = window.normalizeCompositionText(compositionText);
        console.log('Normalized text:', normalized);
        
        if (normalized) {
            sections.push({
                component: "MAIN FABRIC",
                text: normalized
            });
        }
    }

    console.log('Unified parser found sections:', sections);
    return sections.length > 0 ? sections : null;
}; 