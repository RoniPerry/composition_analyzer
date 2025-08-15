// Import the normalizer
const normalizeCompositionText = require('./normalizer');

// Test cases for the composition text normalizer
function runNormalizerTests() {
    const testCases = [
        // Basic format tests
        {
            name: "Space separated",
            input: "55% tencel 45% Cotton",
            expected: "55% tencel 45% cotton"
        },
        {
            name: "Comma separated",
            input: "55% tencel, 45% Cotton",
            expected: "55% tencel 45% cotton"
        },
        {
            name: "Line break separated",
            input: "55% tencel\n45% Cotton",
            expected: "55% tencel 45% cotton"
        },
        {
            name: "Comma and line break",
            input: "55% tencel,\n45% Cotton",
            expected: "55% tencel 45% cotton"
        },

        // Special material names
        {
            name: "Special material - Makò Cotton",
            input: "100% Makò Cotton",
            expected: "100% mako cotton"
        },
        {
            name: "Special material - Pima Cotton",
            input: "100% Pima Cotton",
            expected: "100% pima cotton"
        },
        {
            name: "Special material - BCI Cotton",
            input: "100% BCI Cotton",
            expected: "100% bci cotton"
        },

        // Case variations
        {
            name: "Mixed case materials",
            input: "55% TenCEL 45% COTTON",
            expected: "55% tencel 45% cotton"
        },
        {
            name: "Extra spaces",
            input: "55%    Tencel    45%     Cotton",
            expected: "55% tencel 45% cotton"
        },

        // Unicode and special characters
        {
            name: "With special characters",
            input: "55% Tencel™ 45% Cotton®",
            expected: "55% tencel 45% cotton"
        },
        {
            name: "With accented characters",
            input: "60% Coton égyptien, 40% Polyestère",
            expected: "60% coton egyptien 40% polyestere"
        },
        {
            name: "With Unicode dashes",
            input: "55% Cotton–Polyester 45% Elastane",
            expected: "55% cotton-polyester 45% elastane"
        },

        // Numbers in materials
        {
            name: "Numbers in material names",
            input: "55% Cotton-T400 45% Elastane",
            expected: "55% cotton-t400 45% elastane"
        },
        {
            name: "Material with size specification",
            input: "100% Cotton 40s",
            expected: "100% cotton 40s"
        },

        // Composition prefixes
        {
            name: "With composition prefix",
            input: "Composition: 55% tencel, 45% Cotton",
            input2: "Materials: 55% tencel, 45% Cotton",
            input3: "Fabric: 55% tencel, 45% Cotton",
            expected: "55% tencel 45% cotton"
        },

        // Multiple materials
        {
            name: "Multiple materials",
            input: "79% acrylic, 9% rayon, 5% angora, 7% spandex",
            expected: "79% acrylic 9% rayon 5% angora 7% spandex"
        },
        {
            name: "Multiple materials with mixed formats",
            input: "79% acrylic,\n9% rayon,    5% angora,\n  7% spandex",
            expected: "79% acrylic 9% rayon 5% angora 7% spandex"
        },

        // Edge cases
        {
            name: "Invalid total percentage",
            input: "55% tencel 40% Cotton", // Only 95%
            expected: "" // Should fail validation
        },
        {
            name: "Exactly 100% with many materials",
            input: "40% cotton, 30% polyester, 20% viscose, 10% elastane",
            expected: "40% cotton 30% polyester 20% viscose 10% elastane"
        },
        {
            name: "Rounding edge case - 99.9%",
            input: "33.3% cotton, 33.3% polyester, 33.3% viscose",
            expected: "33.3% cotton 33.3% polyester 33.3% viscose"
        },
        {
            name: "With registered trademark",
            input: "60% LYCRA® 40% Nylon",
            expected: "60% lycra 40% nylon"
        }
    ];

    console.log('Running normalizer tests...');
    console.log('----------------------------');

    let passedTests = 0;
    let totalTests = 0;

    testCases.forEach(testCase => {
        console.log(`Test: ${testCase.name}`);
        console.log('Input:', testCase.input);
        const result = normalizeCompositionText(testCase.input);
        console.log('Result:', result);
        
        if (testCase.expected !== undefined) {
            console.log('Expected:', testCase.expected);
            const passed = result === testCase.expected;
            console.log('Pass:', passed);
            passedTests += passed ? 1 : 0;
            totalTests++;
        }
        
        if (testCase.input2) {
            console.log('Input 2:', testCase.input2);
            const result2 = normalizeCompositionText(testCase.input2);
            console.log('Result 2:', result2);
            if (testCase.expected) {
                const passed = result2 === testCase.expected;
                console.log('Pass 2:', passed);
                passedTests += passed ? 1 : 0;
                totalTests++;
            }
        }
        
        if (testCase.input3) {
            console.log('Input 3:', testCase.input3);
            const result3 = normalizeCompositionText(testCase.input3);
            console.log('Result 3:', result3);
            if (testCase.expected) {
                const passed = result3 === testCase.expected;
                console.log('Pass 3:', passed);
                passedTests += passed ? 1 : 0;
                totalTests++;
            }
        }
        console.log('----------------------------');
    });

    console.log(`Test Summary: ${passedTests}/${totalTests} tests passed`);
}

// Test cases for parsers
function testZaraParser() {
    console.log('Testing Zara Parser...');
    
    // Test case 1: Original format
    const testElement1 = {
        textContent: `OUTER SHELL
68% cotton
32% polyester
LINING
100% cotton`
    };
    
    const result1 = window.zaraParser(testElement1);
    console.log('Test 1 result:', result1);
    
    // Test case 2: New format with MAIN FABRIC and EMBELLISHMENT
    const testElement2 = {
        textContent: `OUTER SHELL
MAIN FABRIC
68% cotton
32% polyester
EMBELLISHMENT
100% polyester
LINING
100% cotton`
    };
    
    const result2 = window.zaraParser(testElement2);
    console.log('Test 2 result:', result2);
    
    // Test case 3: Just MAIN FABRIC format
    const testElement3 = {
        textContent: `MAIN FABRIC
68% cotton
32% polyester
LINING
100% cotton`
    };
    
    const result3 = window.zaraParser(testElement3);
    console.log('Test 3 result:', result3);
}

// Run tests when the file is loaded
runNormalizerTests(); 

// Run tests if this file is loaded
if (typeof window !== 'undefined') {
    window.testZaraParser = testZaraParser;
} 