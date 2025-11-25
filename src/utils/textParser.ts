
export interface ParsedProductInfo {
    title?: string;
    price?: string;
    description?: string;
}

export function parseProductInfo(text: string): ParsedProductInfo {
    const result: ParsedProductInfo = {};

    // Clean up text
    const cleanText = text.trim();
    if (!cleanText) return result;

    // 1. Extract Price
    // Look for patterns like ¥100, $100, 100元, 100块
    const priceRegex = /(?:¥|\$|￥)\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:元|块|CNY|USD)/i;
    const priceMatch = cleanText.match(priceRegex);

    if (priceMatch) {
        // Group 1 is for symbol prefix, Group 2 is for suffix
        result.price = priceMatch[1] || priceMatch[2];
    }

    // 2. Extract Title and Description
    // Heuristic: The first non-empty line is often the title.
    // If the text is short (< 50 chars), it might all be the title.

    const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length > 0) {
        // Assume first line is title
        let potentialTitle = lines[0];

        // If title seems too long (> 30 chars), maybe truncate or just use it
        // For now, let's keep it simple.
        result.title = potentialTitle;

        // The rest is description
        // We also want to remove the price from description if it's isolated, 
        // but often price is embedded "Price: 100", so keeping it is safer.
        // Let's just join the rest.
        if (lines.length > 1) {
            result.description = lines.slice(1).join('\n');
        } else {
            // If only one line, and we extracted a price, maybe the rest is title?
            // Let's just duplicate it to description for safety if it's long enough
            if (cleanText.length > 20) {
                result.description = cleanText;
            }
        }
    }

    return result;
}
