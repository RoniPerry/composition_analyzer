# Fabric Composition Analyzer Chrome Extension

A Chrome extension that analyzes fabric composition on fashion product pages and provides sustainability alerts and scores.

## Installation for Development/Testing

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

## Testing the Extension

1. Visit any fashion product page that lists fabric composition (e.g., Zara, H&M, ASOS)
2. Click the extension icon in your toolbar
3. The popup will show:
   - Overall sustainability score
   - List of detected materials
   - Color-coded sustainability indicators
   - Percentage compositions when available

## Example Test Sites
- [Zara](https://www.zara.com) - Usually has detailed composition
- [H&M](https://www2.hm.com) - Lists materials clearly
- [ASOS](https://www.asos.com) - Good for testing multiple materials
- [Everlane](https://www.everlane.com) - Often includes sustainable materials

## Distribution

To package the extension for distribution:

1. Create a .zip file containing all extension files
2. Submit to Chrome Web Store:
   - Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Pay one-time developer fee ($5)
   - Create a new item
   - Upload the .zip file
   - Fill in store listing details
   - Submit for review

## Contributing

Feel free to submit issues and enhancement requests!

## Features

- Analyzes product pages for fabric composition
- Provides a sustainability score (0-100)
- Highlights sustainable materials in green
- Warns about synthetic materials in red
- Identifies animal welfare concerns
- Shows percentage composition when available

## Material Categories

- 🟢 Sustainable (80-95): Organic cotton, hemp, recycled materials, etc.
- 🟡 Moderate (55-75): Regular cotton, wool, recycled synthetics, etc.
- 🔴 Synthetic (20-30): Polyester, nylon, acrylic, etc.
- 🔴 Animal Concern (5-40): Angora, fur, exotic leather, etc. 