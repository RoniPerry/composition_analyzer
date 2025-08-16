// Shared utilities for fabric composition parsers

// Normalize material names and text
function normalizeMaterial(text) {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/[\u00A0]/g, " ")
    .replace(/[™®©]/g, "")
    .trim();
}

// Clean up text (remove extra whitespace)
function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Check if two materials are effectively the same
function areMaterialsSame(mat1, mat2) {
  return normalizeMaterial(mat1) === normalizeMaterial(mat2);
}

// Get all material/percentage matches from text using provided regexes
function getMaterialMatches(text, regexes) {
  const matches = [];
  for (const regex of regexes) {
    let match;
    // Reset regex lastIndex for global regexes
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match);
    }
  }
  return matches;
}

// Parse material and percentage from text using provided regexes
function parseMaterialPercentage(text, regexes) {
  const matches = getMaterialMatches(text, regexes);
  if (matches.length > 0) {
    // Return the first match as { percentage, material }
    const match = matches[0];
    // Try to find which group is percentage and which is material
    let percentage, material;
    if (/\d+%/.test(match[0])) {
      // Try to find the number and the material
      percentage = match[1] && /\d+/.test(match[1]) ? match[1] : match[2];
      material = match[2] && /[a-zA-Z]/.test(match[2]) ? match[2] : match[1];
    }
    if (percentage && material) {
      return { percentage, material: material.toLowerCase().trim() };
    }
  }
  return null;
}

// Add section to array if not a duplicate
function addUniqueSection(sections, newSection) {
  const exists = sections.some(
    (section) =>
      section.component === newSection.component &&
      areMaterialsSame(section.text, newSection.text)
  );
  if (!exists) {
    sections.push(newSection);
  }
}

// At the end, assign all helpers to window.utils
window.utils = {
  normalizeMaterial,
  cleanText,
  areMaterialsSame,
  parseMaterialPercentage,
  addUniqueSection,
  getMaterialMatches,
};
