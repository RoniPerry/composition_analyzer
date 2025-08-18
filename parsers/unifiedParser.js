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

        // Look for section headers (like "Pocket lining:", "Trim:", etc.)
        const sectionHeaderMatch = text.match(/(?:pocket\s+lining|lining|trim|outer|main\s+fabric|fabric|material|self\s*1|self\s*2):\s*$/i);
        if (sectionHeaderMatch) {
            console.log('✅ Found section header:', sectionHeaderMatch[0]);
            return text; // Return the section header text
        }
        console.log('❌ No section header match found');

        // Look for percentage followed by or preceded by fabric words
        const percentageMatch = text.match(new RegExp(`(?:\\b\\d+%\\s*(?:${fabricWords}))|(?:(?:${fabricWords})\s+\\d+%)`, 'i'));
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
        
        // Check if this is just a section header (like "Pocket lining:")
        const isSectionHeader = /(?:pocket\s+lining|lining|trim|outer|main\s+fabric|fabric|material|self\s*1|self\s*2):\s*$/i.test(compositionText);
        
        if (isSectionHeader) {
            console.log('🔍 Found section header, using parent text for full context');
            // For section headers, look for a higher-level parent that contains the full composition
            let parentElement = element.parentElement;
            let aggregated = '';
            
            // Try to find a parent that contains both the main fabric and the section
            while (parentElement && !aggregated.includes('67%') && !aggregated.includes('33%')) {
                aggregated = parentElement.textContent.trim();
                console.log('🔄 Checking parent level:', aggregated);
                
                // Look for a parent that contains both the main fabric composition and section headers
                if (aggregated.includes('67%') && aggregated.includes('33%') && 
                    (aggregated.includes('pocket lining:') || aggregated.includes('trim:') || aggregated.includes('lining:'))) {
                    console.log('✅ Found parent with full composition:', aggregated);
                    break;
                }
                
                parentElement = parentElement.parentElement;
            }
            
            if (aggregated) {
                try {
                    console.log('🔄 Using aggregated text for section header:', aggregated);
                    const normalized = window.normalizeCompositionText(aggregated);
                    console.log('Normalized text from aggregated:', normalized);
                    
                    if (normalized) {
                        // Use the shared utility to parse sections into components
                        const parsedSections = window.parseSectionsToComponents(normalized);
                        console.log('🔍 parseSectionsToComponents returned:', parsedSections);
                        
                        // Clear any existing sections and use the complete set from aggregated text
                        sections.length = 0;
                        sections.push(...parsedSections);
                        console.log('✅ Replaced sections with complete set from aggregated text:', parsedSections);
                        console.log('📋 Total sections array now contains:', sections);
                        
                        // Return immediately since we have the complete set
                        console.log('🏁 Returning complete sections from aggregated text');
                        return sections;
                    }
                } catch (e) {
                    console.log('Aggregated text processing failed:', e && e.message);
                }
            }
        } else {
            // Use the normalizer to convert to unified format
            let normalized = window.normalizeCompositionText(compositionText);
            console.log('Normalized text:', normalized);
            
            // Fallback: some sites split composition across sibling/parent nodes (e.g., Arket)
            if (!normalized && element && element.parentElement) {
                try {
                    const aggregated = element.parentElement.textContent.trim();
                    console.log('🔄 Fallback to parent aggregated text:', aggregated);
                    normalized = window.normalizeCompositionText(aggregated);
                    console.log('Fallback normalized text:', normalized);
                    
                    if (normalized) {
                        console.log('✅ Fallback succeeded, parsing aggregated text');
                        console.log('🔍 Aggregated text contains sections:', /(pocket\s+lining|lining|trim|outer|main\s+fabric|fabric|material|self\s*1|self\s*2):/i.test(aggregated));
                    }
                } catch (e) {
                    console.log('Fallback aggregation failed:', e && e.message);
                }
            }

            if (normalized) {
                console.log('🔍 Final normalized text before parsing:', normalized);
                console.log('🔍 Text contains section headers:', /(pocket\s+lining|lining|trim|outer|main\s+fabric|fabric|material|self\s*1|self\s*2):/i.test(normalized));
                
                // Use the shared utility to parse sections into components
                const parsedSections = window.parseSectionsToComponents(normalized);
                sections.push(...parsedSections);
                console.log('✅ Added sections using shared utility:', parsedSections);
            } else {
                console.log('❌ Normalizer returned null/empty');
            }
        }
    } else {
        console.log('❌ No composition text found');
    }

    console.log('Unified parser found sections:', sections);
    console.log('Sections structure:', sections.map(s => ({ component: s.component, text: s.text })));
    return sections.length > 0 ? sections : null;
}; 