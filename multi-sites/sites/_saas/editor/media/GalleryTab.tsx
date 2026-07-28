/*
 * Aba Galeria: dropzone de upload (drag-and-drop + clique) no topo + grid
 * paginado das imagens já enviadas por este client. Upload local sobe pra
 * R2/storage na hora (POST upload-image/) e já vira um candidato
 * "existing" — sem re-upload ao confirmar.
 */
import React, { useEffect, useRef, useState } from 'react';
import { listGallery, uploadImage, type GalleryImage } from './api';
import type { Candidate } from './ImagePickerModal';

export function GalleryTab({ selected, onSelect }: { selected: Candidate | null; onSelect: (c: Candidate) => void }) {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        load(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function load(p: number) {
        setLoading(true);
        setError('');
        try {
            const data = await listGallery(p);
            setImages(data.images);
            setPage(data.page);
            setPages(data.pages || 1);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    async function handleFile(file: File | undefined) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Selecione um arquivo de imagem válido.');
            return;
        }
        setUploading(true);
        setError('');
        try {
            const url = await uploadImage(file, file.name, 'upload');
            onSelect({ kind: 'existing', url });
            load(1);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setUploading(false);
        }
    }

    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
    }

    return (
        <div className="image-picker-tab-body">
            <div
                className={`image-picker-dropzone${dragOver ? ' is-dragover' : ''}${uploading ? ' is-uploading' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
            >
                <span className="image-picker-dropzone-icon">{uploading ? '⏳' : '📤'}</span>
                <span>
                    {uploading
                        ? 'Enviando…'
                        : <>Arraste uma imagem aqui ou <strong>clique para enviar</strong></>}
                </span>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
                />
            </div>

            {error && <p className="image-picker-error">{error}</p>}

            {loading ? (
                <div className="image-picker-grid">
                    {Array.from({ length: 9 }).map((_, i) => <div key={i} className="image-picker-skeleton" />)}
                </div>
            ) : images.length === 0 && !error ? (
                <p className="image-picker-hint">Nenhuma imagem enviada ainda.</p>
            ) : (
                <div className="image-picker-grid">
                    {images.map((img) => {
                        const isSelected = selected?.kind === 'existing' && selected.url === img.url;
                        return (
                            <button
                                key={img.id}
                                type="button"
                                className={`image-picker-thumb${isSelected ? ' is-selected' : ''}`}
                                title={img.filename}
                                onClick={() => onSelect({ kind: 'existing', url: img.url, mediaAssetId: img.id })}
                            >
                                <img src={img.url} alt={img.alt || img.filename} loading="lazy" />
                                {isSelected && <span className="image-picker-thumb-check">✓</span>}
                            </button>
                        );
                    })}
                </div>
            )}

            {pages > 1 && (
                <div className="image-picker-pagination">
                    <button type="button" disabled={page <= 1} onClick={() => load(page - 1)}>‹ Anterior</button>
                    <span>{page} / {pages}</span>
                    <button type="button" disabled={page >= pages} onClick={() => load(page + 1)}>Próxima ›</button>
                </div>
            )}
        </div>
    );
}
