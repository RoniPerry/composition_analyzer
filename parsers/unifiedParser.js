// Unified parser for fabric composition
// This parser expects text in the normalized format: "55% tencel 45% cotton"
window.unifiedParser = function(element) {
    const sections = [];
    const text = element.textContent.trim();
    console.log('Unified parser analyzing text:', text);
    console.log('Text length:', text.length);
    console.log('Text contains percentage signs:', text.includes('%'));

    // Helper function to clean up text
    function cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // Helper function to find composition text
    function findCompositionText(text) {
        console.log('🔍 findCompositionText called with:', text);
        
        // Get fabric words from MATERIALS constant
        const fabricWords = Object.keys(window.MATERIALS).join('|');
        console.log('Available fabric words:', fabricWords);
        
        // Look for composition prefix followed by content
        const compositionMatch = text.match(new RegExp(`(?:composition|materials?|fabric):\\s*([^.]+)`, 'i'));
        if (compositionMatch) {
            console.log('✅ Found composition prefix match:', compositionMatch[1]);
            return compositionMatch[1].trim();
        }
        console.log('❌ No composition prefix match found');

        // Look for percentage followed by or preceded by fabric words
        const percentageMatch = text.match(new RegExp(`(?:\\b\\d+%\\s*(?:${fabricWords}))|(?:(?:${fabricWords})\\s+\\d+%)`, 'i'));
        if (percentageMatch) {
            console.log('✅ Found percentage-fabric match:', percentageMatch[0]);
            return text;
        }
        console.log('❌ No percentage-fabric match found');

        return '';
    }

    // Try to find and parse composition text
    const compositionText = findCompositionText(text);
    console.log('🎯 Final composition text found:', compositionText);
    
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
            console.log('✅ Added section to results:', { component: "MAIN FABRIC", text: normalized });
        } else {
            console.log('❌ Normalizer returned null/empty');
        }
    } else {
        console.log('❌ No composition text found');
    }

    console.log('Unified parser found sections:', sections);
    return sections.length > 0 ? sections : null;
}; 