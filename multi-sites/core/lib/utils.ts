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

export function getValidatedImageUrl({
    image,
    imageUrl,
    assetsUrlBase,
}: {
    image?: string | null;
    imageUrl?: string | null;
    assetsUrlBase: string;
}): string {
    const base = ensureTrailingSlash(assetsUrlBase);
    if (image && typeof image === 'string') {
        // Remove any folder path from image and concatenate with base
        return `${base}${image.replace(/^.*\//, '')}`;
    }
    return imageUrl ?? '';
}

export function getImageType(imageUrl: string): string {
    if (!imageUrl) return '';
    const ext = imageUrl.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'webp':
            return 'image/webp';
        case 'gif':
            return 'image/gif';
        case 'svg':
            return 'image/svg+xml';
        case 'bmp':
            return 'image/bmp';
        case 'ico':
            return 'image/x-icon';
        case 'tiff':
        case 'tif':
            return 'image/tiff';
        default:
            return 'image/jpeg'; // Fallback
    }
}

export function ensureTrailingSlash(url: string): string {
    if (!url || typeof url !== 'string') return '';

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

/**
 * Parse content and handle HIDDEN-REF tags based on article existence and publish status
 * @param content The HTML content to parse
 * @param checkArticleExists Function to check if article exists and is published
 * @returns Promise<string> The processed content
 */
export async function parseHiddenRefs(
    content: string, 
    checkArticleExists: (uuid: string) => Promise<boolean>
): Promise<string> {
    if (!content || typeof content !== 'string') {
        return content;
    }

    // Regex to match [[HIDDEN-REF]]uuid[[/HIDDEN-REF]]
    // This captures the UUID and the content between the tags
    const hiddenRefRegex = /\[\[HIDDEN-REF\]\](.*?)\[\[\/HIDDEN-REF\]\]/gs;
    
    let processedContent = content;
    const matches = Array.from(content.matchAll(hiddenRefRegex));

    for (const match of matches) {
        const fullMatch = match[0]; // Full matched string including tags
        const uuid = match[1]; // The UUID content between the tags

        if (!uuid || !uuid.trim()) {
            // If no UUID, remove the entire tag and content
            processedContent = processedContent.replace(fullMatch, '');
            continue;
        }

        const trimmedUuid = uuid.trim();
        
        try {
            // Check if the article exists and is published
            const articleExists = await checkArticleExists(trimmedUuid);
            
            if (articleExists) {
                // Article exists and is published - remove tags but keep content
                processedContent = processedContent.replace(fullMatch, uuid);
            } else {
                // Article doesn't exist or not published - remove everything
                processedContent = processedContent.replace(fullMatch, '');
            }
        } catch (error) {
            console.error(`Error checking article existence for UUID ${trimmedUuid}:`, error);
            // On error, remove the entire tag and content for safety
            processedContent = processedContent.replace(fullMatch, '');
        }
    }

    return processedContent;
}
