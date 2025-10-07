/**
 * Estimate reading time in minutes from word count.
 * @param wordCount Number of words in the article
 * @param wordsPerMinute Average reading speed (default 220)
 * @returns Number of minutes (minimum 1)
 */
export function estimateReadingTime(wordCount: number, wordsPerMinute: number = 220): number {
    if (!wordCount || wordCount < 0) return 0;
    return Math.max(1, Math.round(wordCount / wordsPerMinute));
}
// export function normalizeAssetsUrlBase(assetsUrlBase: string): string {
//     let base = assetsUrlBase.replace(/\/$/, '');
//     return base.startsWith('http') ? base : `https://${base}`;
// }

export function ensureTrailingSlash(url: string): string {
    // Remove all trailing slashes
    let base = url.replace(/\/+$/, '');

    // Ensure it starts with http/https
    base = base.startsWith('http') ? base : `https://${base}`;
    
    // Add exactly one trailing slash
    return `${base}/`;
}

export function slugify(str: string): string {
    return str
        .normalize('NFD') // Remove accents
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
        .replace(/^-+|-+$/g, ''); // Trim hyphens
}

export function parseKeywords(keywords: string | undefined | null): string[] {
    if (!keywords) return [];
    // If contains comma, split and trim
    if (keywords.includes(',')) {
        return keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);
    }
    // Otherwise, return as single keyword if not empty
    const trimmed = keywords.trim();
    return trimmed ? [trimmed] : [];
}

export function toThumbnailUrl(url: string): string {
    if (!url) return url;
    // Find last dot for extension
    const lastDot = url.lastIndexOf('.');
    if (lastDot === -1) return url + '_thumb';
    return url.slice(0, lastDot) + '_thumb' + url.slice(lastDot);
}
