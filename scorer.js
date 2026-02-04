// Scoring module
// Handles material matching and sustainability score calculation

function matchMaterialInfo(material) {
    const lowered = material.toLowerCase().trim();
    const entry = Object.entries(window.MATERIALS).find(([key]) => {
        if (lowered === key.toLowerCase().trim()) {
            return true;
        }
        const materialWords = lowered.split(/\s+/).sort().join(' ');
        const keyWords = key.toLowerCase().trim().split(/\s+/).sort().join(' ');
        if (materialWords === keyWords) {
            return true;
        }
        if (lowered.includes('lenzing') && lowered.includes('ecovero')) {
            return key.toLowerCase().includes('lenzing') && key.toLowerCase().includes('ecovero');
        }
        return false;
    });
    return entry || null;
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
