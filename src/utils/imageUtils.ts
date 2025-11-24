
/**
 * Utility to preload images and convert them to local blob URLs to avoid CORS issues
 * when using html-to-image or html2canvas.
 */
export async function preloadImages(element: HTMLElement): Promise<() => void> {
    const images = Array.from(element.querySelectorAll('img'));
    const originalSrcs = new Map<HTMLImageElement, string>();

    // Function to restore original srcs
    const cleanup = () => {
        originalSrcs.forEach((src, img) => {
            img.src = src;
            // Revoke blob url if it was one we created
            if (img.getAttribute('data-blob-url')) {
                URL.revokeObjectURL(img.src);
                img.removeAttribute('data-blob-url');
            }
        });
        originalSrcs.clear();
    };

    try {
        await Promise.all(
            images.map(async (img) => {
                // Skip if no src or already data url
                if (!img.src || img.src.startsWith('data:')) return;

                // Store original src
                originalSrcs.set(img, img.src);

                try {
                    // Fetch image as blob
                    const response = await fetch(img.src, {
                        mode: 'cors',
                        credentials: 'omit', // Important for some CDNs
                    });

                    if (!response.ok) throw new Error(`Failed to fetch ${img.src}`);

                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);

                    // Set new src
                    img.src = blobUrl;
                    img.setAttribute('data-blob-url', 'true');

                    // Wait for image to decode/load
                    await img.decode().catch(() => {
                        // Fallback if decode fails, just wait for onload
                        return new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = reject;
                        });
                    });
                } catch (err) {
                    console.warn('Failed to preload image:', img.src, err);
                    // If fail, keep original src and hope for the best
                }
            })
        );
    } catch (err) {
        console.error('Error in preloadImages:', err);
        cleanup(); // Cleanup on error
        throw err;
    }

    return cleanup;
}

/**
 * Detect if device is iOS
 */
export function isIOS() {
    if (typeof window === 'undefined') return false;
    return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
}
