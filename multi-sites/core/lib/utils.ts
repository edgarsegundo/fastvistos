export function normalizeAssetsUrlBase(assetsUrlBase: string): string {
    let base = assetsUrlBase.replace(/\/$/, '');
    return base.startsWith('http') ? base : `https://${base}`;
}

export function slugify(str: string): string {
    return str
        .normalize('NFD') // Remove accents
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
        .replace(/^-+|-+$/g, '');    // Trim hyphens
}