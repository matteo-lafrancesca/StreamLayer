/**
 * Appends the authorization token to a URL as a query parameter.
 * Handles existing query parameters safely.
 */
export function appendAuthToUrl(url: string, token: string | null): string {
    if (!token) return url;

    // Check if URL is relative or absolute
    try {
        const urlObj = new URL(url, 'http://dummy.base'); // Use dummy base for relative URLs

        // Use URLSearchParams to handle existing params safely
        if (!urlObj.searchParams.has('authorization')) {
            urlObj.searchParams.set('authorization', token);
        }

        // Return appropriate format
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return urlObj.toString().replace('http://dummy.base', ''); // Should technically match input, but let's be safer
        }

        // Simple string manipulation is often safer for preserving relative paths/formatting 
        // if we don't want to fully normalize the URL
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}authorization=${encodeURIComponent(token)}`;

    } catch (e) {
        // Fallback for very weird strings
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}authorization=${encodeURIComponent(token)}`;
    }
}

/**
 * Extracts the URL of the first segment or variant playlist from an M3U8 manifest.
 * Ignores comments (#).
 */
export function extractFirstHlsUrl(manifestText: string): string | null {
    const lines = manifestText.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            return trimmed;
        }
    }
    return null;
}
