/**
 * Utilitaires liés à la gestion du flux audio (HLS) et de l'authentification.
 */

/**
 * Ajoute un jeton d'autorisation à une URL comme paramètre de requête.
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
 * Extrait la première URL de média d'un manifeste M3U8.
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
