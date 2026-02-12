// Scoring module
// Handles material matching and sustainability score calculation

function matchMaterialInfo(material) {
    const lowered = material.toLowerCase().trim();

    // Step 1: Try exact match
    const exactEntry = Object.entries(window.MATERIALS).find(([key]) => {
        if (lowered === key.toLowerCase().trim()) return true;
        const materialWords = lowered.split(/\s+/).sort().join(' ');
        const keyWords = key.toLowerCase().trim().split(/\s+/).sort().join(' ');
        if (materialWords === keyWords) return true;
        if (lowered.includes('lenzing') && lowered.includes('ecovero')) {
            return key.toLowerCase().includes('lenzing') && key.toLowerCase().includes('ecovero');
        }
        return false;
    });
    if (exactEntry) return exactEntry;

    // Step 2: Keyword-based fallback matching
    // Check for certification prefixes that indicate sustainability
    var hasCertification = /\b(rws|gots|ocs|grs|rcs|bci|oeko-tex|oekotex)\b/i.test(lowered);
    var hasRecycled = /\b(recycled|regen|upcycled)\b/i.test(lowered);
    var hasOrganic = /\borganic\b/i.test(lowered);

    // Map material type keywords to base materials
    var baseMaterial = null;
    if (/\b(merino|lambswool|lamb wool|cashmere|alpaca|mohair|angora)\b/i.test(lowered)) {
        baseMaterial = 'wool';
    } else if (/\b(cotton|denim)\b/i.test(lowered)) {
        baseMaterial = 'cotton';
    } else if (/\b(polyester|poly)\b/i.test(lowered)) {
        baseMaterial = 'polyester';
    } else if (/\b(nylon|polyamide)\b/i.test(lowered)) {
        baseMaterial = 'nylon';
    } else if (/\b(viscose|rayon)\b/i.test(lowered)) {
        baseMaterial = 'viscose';
    } else if (/\b(linen|flax)\b/i.test(lowered)) {
        baseMaterial = 'linen';
    } else if (/\b(silk)\b/i.test(lowered)) {
        baseMaterial = 'silk';
    } else if (/\b(hemp)\b/i.test(lowered)) {
        baseMaterial = 'hemp';
    } else if (/\b(lyocell|tencel)\b/i.test(lowered)) {
        baseMaterial = 'tencel';
    }

    if (baseMaterial) {
        // Try to find the best matching variant
        var searchKey = baseMaterial;
        if (hasRecycled) {
            searchKey = 'recycled ' + baseMaterial;
        } else if (hasOrganic) {
            searchKey = 'organic ' + baseMaterial;
        } else if (hasCertification && (baseMaterial === 'wool' || baseMaterial === 'cotton')) {
            // RWS wool, GOTS cotton, etc. - look for certified variant or boost base
            searchKey = 'rws ' + baseMaterial;
        }

        // Find in materials database
        var fallbackEntry = Object.entries(window.MATERIALS).find(([key]) =>
            key.toLowerCase() === searchKey.toLowerCase()
        );
        if (fallbackEntry) return fallbackEntry;

        // If certified variant not found, use base material but note it's certified
        var baseEntry = Object.entries(window.MATERIALS).find(([key]) =>
            key.toLowerCase() === baseMaterial.toLowerCase()
        );
        if (baseEntry && hasCertification) {
            // Return base material with boosted score for certification
            return [baseEntry[0], {
                score: Math.min(baseEntry[1].score + 15, 90),
                category: 'sustainable'
            }];
        }
        return baseEntry || null;
    }

    return null;
}

function calculateScore(compositions) {
    let totalScore = 0;
    let totalPercentage = 0;

    compositions.forEach(section => {
        // Parse the normalized text which is in format "55% material 45% material"
        const parts = section.text.split(/\s+(?=\d+%)/);
        parts.forEach(part => {
            const [percentage, ...materialParts] = part.split(/\s+/);
            const material = materialParts.join(' ');
            const percentageValue = parseInt(percentage, 10);

            const materialInfo = matchMaterialInfo(material);

            if (materialInfo) {
                totalScore += materialInfo[1].score * (percentageValue / 100);
                totalPercentage += percentageValue;
            }
        });
    });

    // Normalize score if we have valid percentages and convert to 0-10 scale
    const finalScore = totalPercentage > 0 ? Math.round((totalScore * (100 / totalPercentage)) / 10) : 0;
    return finalScore;
}

function getColorForScore(score) {
    if (score > 5) return 'high';  // Green for scores > 5
    if (score === 5) return 'medium';  // Orange for score = 5
    return 'low';  // Red for scores < 5
}

// Export to global scope for use by other content scripts
window.matchMaterialInfo = matchMaterialInfo;
window.calculateScore = calculateScore;
window.getColorForScore = getColorForScore;
