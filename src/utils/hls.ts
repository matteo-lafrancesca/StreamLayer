/**
 * Appends the authorization token to a URL as a query parameter.
 * Handles existing query parameters safely.
 */
export function appendAuthToUrl(url: string, token: string | null): string {
    if (!token) return url;

    try {
        const urlObj = new URL(url, 'http://dummy.base');

        if (!urlObj.searchParams.has('authorization')) {
            urlObj.searchParams.set('authorization', token);
        }

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return urlObj.toString().replace('http://dummy.base', '');
        }

        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}authorization=${encodeURIComponent(token)}`;

    } catch (e) {
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
