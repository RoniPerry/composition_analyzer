// Zara specific parser
window.zaraParser = function(element) {
    const sections = [];
    const text = element.textContent.trim();
    console.log('Parsing Zara text:', text);

    // Helper function to clean up text
    function cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // Helper function to parse material and percentage
    function parseMaterialPercentage(text) {
        console.log('Parsing material text:', text);
        // More flexible pattern that looks for percentage at start or end
        const match = text.match(/(?:^|\s)(\d+)%\s*([A-Za-z\s-]+)|([A-Za-z\s-]+)\s*(\d+)%(?:\s|$)/i);
        if (match) {
            // Handle both formats: "100% polyester" and "polyester 100%"
            const [, percent1, material1, material2, percent2] = match;
            const percentage = percent1 || percent2;
            const material = (material1 || material2).toLowerCase().trim();
            const result = `${percentage}% ${material}`;
            console.log('Found material:', result);
            return result;
        }
        console.log('No material match found');
        return null;
    }

    // Define Zara's specific format patterns
    const components = [
        { 
            label: 'OUTER SHELL',
            startPattern: /OUTER\s*SHELL/i,
            endPattern: /(?=LINING|$)/i
        },
        { 
            label: 'LINING\nUPPER PART',
            startPattern: /LINING.*?UPPER\s*PART|UPPER\s*PART/i,
            endPattern: /(?=LOWER\s*PART|$)/i
        },
        { 
            label: 'LINING\nLOWER PART',
            startPattern: /LOWER\s*PART/i,
            endPattern: /$/i
        }
    ];

    // Try each component pattern
    let lastIndex = 0;
    for (const { label, startPattern, endPattern } of components) {
        console.log(`Looking for component "${label}" starting at index ${lastIndex}`);
        // Find the start of this component
        const textFromLastIndex = text.slice(lastIndex);
        console.log('Text to search:', textFromLastIndex);
        
        const startMatch = textFromLastIndex.match(startPattern);
        if (startMatch) {
            console.log(`Found ${label} start at index ${startMatch.index}`);
            // Move past the component label
            const componentStart = lastIndex + startMatch.index + startMatch[0].length;
            // Find the end of this component
            const remainingText = text.slice(componentStart);
            console.log(`Remaining text for ${label}:`, remainingText);
            
            const endMatch = remainingText.match(endPattern);
            if (endMatch) {
                // Extract the text between start and end
                const componentText = remainingText.slice(0, endMatch.index).trim();
                console.log(`Component text for ${label}:`, componentText);
                
                const material = parseMaterialPercentage(componentText);
                if (material) {
                    sections.push({
                        component: label,
                        text: material
                    });
                }
                // Update lastIndex to continue after this component
                lastIndex = componentStart + endMatch.index;
                console.log(`Updated lastIndex to ${lastIndex}`);
            }
        } else {
            console.log(`No match found for ${label}`);
        }
    }

    console.log('Zara parser found sections:', sections);
    return sections.length > 0 ? sections : null;
} 