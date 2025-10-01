export function normalizeAssetsUrlBase(assetsUrlBase: string): string {
    let base = assetsUrlBase.replace(/\/$/, '');
    return base.startsWith('http') ? base : `https://${base}`;
}
