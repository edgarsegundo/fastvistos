/*
 * Aba Stock: sub-abas Pexels/Pixabay/Unsplash (busca paginada, barra
 * fixa no topo) + URL (import direto). Clicar numa foto baixa via proxy
 * same-origin e vira um candidato "blob" — só sobe pro storage quando o
 * usuário confirmar.
 */
import React, { useState } from 'react';
import { searchStock, proxyImageUrl, type StockProvider, type StockPhoto } from './api';
import type { Candidate } from './ImagePickerModal';

type Source = StockProvider | 'url';

const SOURCE_LABEL: Record<Source, string> = {
    pexels: 'Pexels', pixabay: 'Pixabay', unsplash: 'Unsplash', url: 'URL',
};

function photoDisplay(source: Source, photo: StockPhoto) {
    if (source === 'pexels') {
        return { thumb: photo.src_medium || '', large: photo.src_large || '', label: photo.photographer || '', alt: photo.alt || photo.photographer || '' };
    }
    if (source === 'pixabay') {
        return { thumb: photo.medium_url || '', large: photo.large_url || '', label: photo.user || '', alt: photo.tags || photo.user || '' };
    }
    return { thumb: photo.thumb_url || '', large: photo.large_url || '', label: photo.user || '', alt: photo.alt || photo.user || '' };
}

export function StockTab({ onSelect }: { onSelect: (c: Candidate) => void }) {
    const [source, setSource] = useState<Source>('pexels');
    const [query, setQuery] = useState('');
    const [photos, setPhotos] = useState<StockPhoto[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [searched, setSearched] = useState(false);

    function switchSource(s: Source) {
        setSource(s);
        setPhotos([]);
        setSearched(false);
        setError('');
    }

    async function search(p: number) {
        if (source === 'url' || !query.trim()) return;
        setLoading(true);
        setError('');
        try {
            const data = await searchStock(source, query.trim(), p);
            setPhotos(data.photos);
            setPage(data.page);
            setPages(data.pages || 1);
            setSearched(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    async function pickPhoto(photo: StockPhoto, idx: number) {
        const { large, alt } = photoDisplay(source, photo);
        if (!large) return;
        setDownloading(true);
        setError('');
        try {
            const blob = await proxyImageUrl(large);
            const filename = `stock-${source}-${photo.id ?? idx}-${Date.now()}.jpg`;
            onSelect({ kind: 'blob', blob, filename, source: 'stock', alt });
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setDownloading(false);
        }
    }

    async function loadFromUrl() {
        const raw = urlInput.trim();
        if (!raw) return;
        let parsed: URL;
        try {
            parsed = new URL(raw);
        } catch {
            setError('URL inválida.');
            return;
        }
        if (parsed.protocol !== 'https:') {
            setError('Apenas URLs https são suportadas.');
            return;
        }
        setDownloading(true);
        setError('');
        try {
            const blob = await proxyImageUrl(raw);
            onSelect({ kind: 'blob', blob, filename: `url-import-${Date.now()}.jpg`, source: 'url' });
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setDownloading(false);
        }
    }

    return (
        <div className="image-picker-tab-body">
            <div className="image-picker-subtabs">
                {(['pexels', 'pixabay', 'unsplash', 'url'] as Source[]).map((s) => (
                    <button key={s} type="button" className={s === source ? 'is-active' : ''} onClick={() => switchSource(s)}>
                        {SOURCE_LABEL[s]}
                    </button>
                ))}
            </div>

            {source !== 'url' ? (
                <>
                    <div className="image-picker-search-bar image-picker-search-bar--sticky">
                        <input
                            type="text"
                            placeholder="Buscar imagens…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') search(1); }}
                        />
                        <button type="button" onClick={() => search(1)}>🔍</button>
                    </div>

                    {error && <p className="image-picker-error">{error}</p>}
                    {downloading && <p className="image-picker-hint">Baixando imagem…</p>}

                    {loading ? (
                        <div className="image-picker-grid">
                            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="image-picker-skeleton" />)}
                        </div>
                    ) : !searched ? (
                        <p className="image-picker-hint">Digite um termo pra buscar imagens.</p>
                    ) : photos.length === 0 && !error ? (
                        <p className="image-picker-hint">Nenhuma imagem encontrada.</p>
                    ) : (
                        <div className="image-picker-grid">
                            {photos.map((photo, idx) => {
                                const { thumb, label } = photoDisplay(source, photo);
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="image-picker-thumb"
                                        title={label}
                                        onClick={() => pickPhoto(photo, idx)}
                                    >
                                        <img src={thumb} alt={label} loading="lazy" />
                                        <span className="image-picker-thumb-label">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {pages > 1 && (
                        <div className="image-picker-pagination">
                            <button type="button" disabled={page <= 1} onClick={() => search(page - 1)}>‹ Anterior</button>
                            <span>{page} / {pages}</span>
                            <button type="button" disabled={page >= pages} onClick={() => search(page + 1)}>Próxima ›</button>
                        </div>
                    )}
                </>
            ) : (
                <div className="image-picker-url-panel">
                    <p className="image-picker-hint">Cole a URL de qualquer imagem (https).</p>
                    <div className="image-picker-search-bar">
                        <input
                            type="url"
                            placeholder="https://…"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') loadFromUrl(); }}
                        />
                        <button type="button" onClick={loadFromUrl} disabled={downloading}>
                            {downloading ? '…' : 'Carregar'}
                        </button>
                    </div>
                    {error && <p className="image-picker-error">{error}</p>}
                </div>
            )}
        </div>
    );
}
