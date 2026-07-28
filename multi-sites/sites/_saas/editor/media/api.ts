/*
 * Fetch helpers do seletor de imagem. Paths hardcoded — nenhuma rota nova
 * depende de page_id na URL. Lê csrf/projectId de window.__EDITOR_DATA__
 * (mesmo global que App.tsx já usa), não precisa de prop-drilling desde
 * puck.config.tsx (que monta os componentes uma única vez, fora de
 * qualquer componente React).
 */

const UPLOAD_URL = '/admin/core/page/upload-image/';
const GALLERY_URL = '/admin/core/mediaasset/gallery/';
const STOCK_SEARCH_URL: Record<StockProvider, string> = {
    pexels: '/admin/core/mediaasset/stock/pexels/',
    pixabay: '/admin/core/mediaasset/stock/pixabay/',
    unsplash: '/admin/core/mediaasset/stock/unsplash/',
};
const PROXY_URL = '/admin/core/mediaasset/stock/proxy/';
const GOOGLE_PROXY_URL = '/admin/core/mediaasset/stock/google-proxy/';

export type StockProvider = 'pexels' | 'pixabay' | 'unsplash';

export interface GalleryImage {
    id: number;
    url: string;
    filename: string;
    alt: string;
    source: string;
    created: string;
}

export interface GalleryPage {
    images: GalleryImage[];
    page: number;
    pages: number;
    total: number;
    limit: number;
}

export interface StockPhoto {
    id: number | string;
    // Pexels
    photographer?: string;
    src_medium?: string;
    src_large?: string;
    // Pixabay
    user?: string;
    medium_url?: string;
    large_url?: string;
    tags?: string;
    // Unsplash
    thumb_url?: string;
    alt?: string;
    width?: number;
    height?: number;
}

export interface StockPage {
    photos: StockPhoto[];
    page: number;
    pages: number;
    per_page: number;
    total_results: number;
    error?: string;
}

function csrf(): string {
    return window.__EDITOR_DATA__?.csrf ?? '';
}

function projectId(): number | undefined {
    return window.__EDITOR_DATA__?.projectId;
}

async function asJson<T>(res: Response): Promise<T> {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data as T;
}

export async function uploadImage(blob: Blob, filename: string, source: string): Promise<string> {
    const form = new FormData();
    form.append('file', blob, filename);
    form.append('source', source);
    form.append('project_id', String(projectId() ?? ''));
    const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrf() },
        body: form,
    });
    const data = await asJson<{ url: string }>(res);
    return data.url;
}

export async function listGallery(page: number, limit = 24): Promise<GalleryPage> {
    const res = await fetch(`${GALLERY_URL}?page=${page}&limit=${limit}`);
    return asJson<GalleryPage>(res);
}

export async function searchStock(provider: StockProvider, query: string, page: number): Promise<StockPage> {
    const url = `${STOCK_SEARCH_URL[provider]}?q=${encodeURIComponent(query)}&page=${page}`;
    const res = await fetch(url);
    return asJson<StockPage>(res);
}

async function downloadAsBlob(url: string): Promise<Blob> {
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${res.status}`);
    }
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) throw new Error('URL não retornou uma imagem válida.');
    return blob;
}

/**
 * Baixa bytes de uma URL via proxy same-origin com allowlist (fontes stock
 * fixas + host do storage do client — ver admin_media.py). Usado tanto pra
 * fotos stock quanto pra reler uma imagem já existente da Galeria antes de
 * abrir o Ajustar (evita canvas "tainted" por CORS).
 */
export async function proxyImageUrl(url: string): Promise<Blob> {
    return downloadAsBlob(`${PROXY_URL}?url=${encodeURIComponent(url)}`);
}

export async function proxyExternalUrl(rawUrl: string): Promise<Blob> {
    return downloadAsBlob(`${GOOGLE_PROXY_URL}?url=${encodeURIComponent(rawUrl)}`);
}
