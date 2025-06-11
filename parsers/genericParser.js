// Generic parser that handles common composition formats
window.genericParser = function(element) {
    const sections = [];
    const text = element.textContent.trim();
    console.log('Generic parser analyzing text:', text);

    // Helper function to normalize material names and text
    function normalizeMaterial(text) {
        return text
            .normalize('NFC')  // Use NFC normalization to preserve special characters
            .toLowerCase()
            .replace(/\s+/g, ' ')  // normalize whitespace
            .replace(/&nbsp;/g, ' ')  // replace HTML non-breaking spaces
            .replace(/[\u00A0]/g, ' ')  // replace Unicode non-breaking spaces
            .replace(/[™®©]/g, '')  // Remove trademark symbols
            .trim();
    }

    // Helper function to check if two materials are effectively the same
    function areMaterialsSame(mat1, mat2) {
        return normalizeMaterial(mat1) === normalizeMaterial(mat2);
    }

    // Helper function to add section without duplicates
    function addUniqueSection(newSection) {
        const exists = sections.some(section => 
            section.component === newSection.component && 
            areMaterialsSame(section.text, newSection.text)
        );
        if (!exists) {
            sections.push(newSection);
        }
    }

    // Helper function to parse material and percentage
    function parseMaterialPercentage(text) {
        // Get the original text before normalization for preserving special characters
        const originalText = text.trim();
        const normalizedText = normalizeMaterial(text);
        
        // Match patterns like "100% Makō Cotton" or "Makō Cotton 100%"
        const patterns = [
            {
                regex: /(\d+)%\s*([\p{L}\p{M}\s-]+)/u,  // "100% Makō Cotton"
                percentageIndex: 1,
                materialIndex: 2
            },
            {
                regex: /([\p{L}\p{M}\s-]+)\s*(\d+)%/u,   // "Makō Cotton 100%"
                percentageIndex: 2,
                materialIndex: 1
            }
        ];

        for (const pattern of patterns) {
            const match = originalText.match(pattern.regex);
            if (match) {
                const percentage = match[pattern.percentageIndex];
                // Extract the material name from the original text using the match indices
                const materialStart = match.index + match[0].indexOf(match[pattern.materialIndex]);
                const materialEnd = materialStart + match[pattern.materialIndex].length;
                const material = originalText.slice(materialStart, materialEnd).trim();
                
                return {
                    percentage,
                    material: material.toLowerCase()  // Only lowercase, preserve special chars
                };
            }
        }
        return null;
    }

    // Try to parse the text
    const parsed = parseMaterialPercentage(text);
    if (parsed) {
        addUniqueSection({
            component: "MAIN FABRIC",
            text: `${parsed.percentage}% ${parsed.material}`
        });
    }

    // If no direct match, try to find composition in a larger text block
    if (sections.length === 0) {
        const compositionMatch = text.match(/(?:Composition|Shell|Outer|Main fabric)[:\s]*([^.]+)/i);
        if (compositionMatch) {
            const compositionText = compositionMatch[1].trim();
            const parsed = parseMaterialPercentage(compositionText);
            if (parsed) {
                addUniqueSection({
                    component: "MAIN FABRIC",
                    text: `${parsed.percentage}% ${parsed.material}`
                });
            }
        }
    }

    // First try to find structured format (e.g., "70% Cotton 30% Linen")
    const fullMatch = text.match(/(\d+)%\s*([A-Za-z\s-]+)\s+(\d+)%\s*([A-Za-z\s-]+)/);
    if (fullMatch) {
        addUniqueSection({
            component: "MAIN FABRIC",
            text: `${fullMatch[1]}% ${fullMatch[2].toLowerCase().trim()}`
        });
        addUniqueSection({
            component: "MAIN FABRIC",
            text: `${fullMatch[3]}% ${fullMatch[4].toLowerCase().trim()}`
        });
    }
    
    // Try to parse comma-separated format (e.g., "79% acrylic, 9% rayon, 5% angora")
    const commaSeparatedMatch = text.match(/(\d+%\s*[A-Za-z\s-]+(?:\s*,\s*\d+%\s*[A-Za-z\s-]+)*)/);
    if (commaSeparatedMatch && !fullMatch) {  // Only try this if fullMatch didn't work
        const materialsText = commaSeparatedMatch[1];
        // Split by commas and clean up each part
        const materials = materialsText.split(',')
            .map(part => {
                const parsed = parseMaterialPercentage(part.trim());
                return parsed ? `${parsed.percentage}% ${parsed.material}` : null;
            })
            .filter(Boolean);

        if (materials.length > 0) {
            // Join all materials with spaces and add as a single section
            addUniqueSection({
                component: "MAIN FABRIC",
                text: materials.join(' ')
            });
        }
    }

    // If no sections found yet, try to find individual material percentages
    if (sections.length === 0) {
        // Try simple "Material 100%" format first
        const simpleMatch = text.match(/([A-Za-z\s-]+)\s+100%/i);
        if (simpleMatch) {
            sections.push({
                component: "MAIN FABRIC",
                text: `100% ${simpleMatch[1].toLowerCase().trim()}`
            });
        } else {
            // Try other individual percentages
            const materials = [];
            let match;
            const regex = /(\d+)%\s*([A-Za-z\s-]+)(?:$|,|\s+(?=\d)|(?=[A-Z]))/g;
            
            while ((match = regex.exec(text)) !== null) {
                materials.push(`${match[1]}% ${match[2].toLowerCase().trim()}`);
            }
            
            if (materials.length > 0) {
                sections.push({
                    component: "MAIN FABRIC",
                    text: materials.join(' ')
                });
            }
        }
    }

    // Look for recycled content
    const recycledMatch = text.match(/(\d+)%\s*[Rr]ecycled\s+([A-Za-z\s-]+)/);
    if (recycledMatch) {
        addUniqueSection({
            component: "RECYCLED CONTENT",
            text: `${recycledMatch[1]}% recycled ${recycledMatch[2].toLowerCase().trim()}`
        });
    }

    console.log('Generic parser found sections:', sections);
    return sections.length > 0 ? sections : null;
} 