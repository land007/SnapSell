/**
 * Retrieves a Google API key from the configured pool.
 * Supports load balancing by randomly selecting a key from the available keys.
 * 
 * Keys are read from:
 * 1. GOOGLE_API_KEYS environment variable (comma-separated list)
 * 2. GOOGLE_API_KEY environment variable (single key)
 * 
 * @returns A single API key string or undefined if no keys are found.
 */
export function getGoogleApiKey(): string | undefined {
    const keys: string[] = [];

    // 1. Parse comma-separated keys from GOOGLE_API_KEYS
    const multiKeysEnv = process.env.GOOGLE_API_KEYS;
    if (multiKeysEnv) {
        const splitKeys = multiKeysEnv.split(',').map(k => k.trim()).filter(k => k.length > 0);
        keys.push(...splitKeys);
    }

    // 2. Add single key from GOOGLE_API_KEY
    const singleKeyEnv = process.env.GOOGLE_API_KEY;
    if (singleKeyEnv && singleKeyEnv.trim().length > 0) {
        keys.push(singleKeyEnv.trim());
    }

    // Deduplicate keys
    const uniqueKeys = Array.from(new Set(keys));

    if (uniqueKeys.length === 0) {
        return undefined;
    }

    // Randomly select one key
    const randomIndex = Math.floor(Math.random() * uniqueKeys.length);
    return uniqueKeys[randomIndex];
}
