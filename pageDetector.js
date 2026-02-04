// Page detection module
// Determines if the current page is likely a product page

function isProductPage() {
    // Common product page URL patterns
    const urlPatterns = [
        /\/p\/|\/product\/|\/item\/|\/goods\/|\/detail\/|\/productpage[\/\.]/i,
        /\/products?\//i,
        /\/shop\/[^\/]+\/[^\/]+$/i,
        /-pid-/i,
        /\/shopping\/[^\/]+\/[^\/]+/i,  // For Farfetch URLs
        /p\d{8}\.html/i,  // For Zara URLs (e.g., p08074911.html)
        /\/prd\/\d+/i  // For ASOS URLs (e.g., /prd/208118633)
    ];

    // Check URL patterns
    if (urlPatterns.some(pattern => pattern.test(window.location.href))) {
        return true;
    }

    // Common product page elements
    const productIndicators = [
        'button[class*="add-to-cart"]',
        'button[class*="buy-now"]',
        'div[class*="product-detail"]',
        'div[class*="product-info"]',
        'div[class*="product-description"]',
        'div[class*="product-composition"]'
    ];

    // Check for product page elements
    const productElements = productIndicators
        .map(selector => document.querySelector(selector))
        .filter(Boolean);

    return productElements.length >= 2;  // Require at least 2 product elements
}

// Export to global scope for use by other content scripts
window.isProductPage = isProductPage;
