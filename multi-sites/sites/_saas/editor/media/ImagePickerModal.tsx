/*
 * Seletor de imagem: abas Galeria/Stock, preview do candidato atual,
 * Ajustar e confirmar/remover/cancelar. Construído sobre o primitivo
 * genérico `ui/Modal` (portal, foco, a11y) — nenhuma lógica de overlay/
 * portal/foco vive aqui, só o conteúdo específico de imagem.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { GalleryTab } from './GalleryTab';
import { StockTab } from './StockTab';
import { AdjustPanel } from './AdjustPanel';
import { proxyImageUrl, uploadImage } from './api';

export type Candidate =
    | { kind: 'existing'; url: string; mediaAssetId?: number }
    | { kind: 'blob'; blob: Blob; filename: string; source: string; alt?: string };

type Tab = 'gallery' | 'stock';

const SOURCE_LABEL: Record<string, string> = {
    upload: 'Upload', stock: 'Stock', url: 'URL', adjusted: 'Ajustada',
};

function sourceLabel(c: Candidate): string {
    return c.kind === 'existing' ? 'Galeria' : (SOURCE_LABEL[c.source] || c.source);
}

export function ImagePickerModal({
    initialUrl,
    onConfirm,
    onClose,
}: {
    initialUrl?: string;
    onConfirm: (url: string) => void;
    onClose: () => void;
}) {
    const [tab, setTab] = useState<Tab>('gallery');
    const [candidate, setCandidate] = useState<Candidate | null>(
        initialUrl ? { kind: 'existing', url: initialUrl } : null,
    );
    const [adjustSourceBlob, setAdjustSourceBlob] = useState<Blob | null>(null);
    const [preparingAdjust, setPreparingAdjust] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState('');

    const previewUrl = useMemo(() => {
        if (!candidate) return null;
        return candidate.kind === 'existing' ? candidate.url : URL.createObjectURL(candidate.blob);
    }, [candidate]);

    useEffect(() => {
        return () => { if (candidate?.kind === 'blob' && previewUrl) URL.revokeObjectURL(previewUrl); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewUrl]);

    const adjustImageUrl = useMemo(
        () => (adjustSourceBlob ? URL.createObjectURL(adjustSourceBlob) : null),
        [adjustSourceBlob],
    );
    useEffect(() => {
        return () => { if (adjustImageUrl) URL.revokeObjectURL(adjustImageUrl); };
    }, [adjustImageUrl]);

    async function startAdjust() {
        if (!candidate) return;
        setError('');
        if (candidate.kind === 'blob') {
            setAdjustSourceBlob(candidate.blob);
            return;
        }
        setPreparingAdjust(true);
        try {
            const blob = await proxyImageUrl(candidate.url);
            setAdjustSourceBlob(blob);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setPreparingAdjust(false);
        }
    }

    function onAdjustApplied(blob: Blob, alt: string) {
        setAdjustSourceBlob(null);
        setCandidate({ kind: 'blob', blob, filename: `ajustada-${Date.now()}.webp`, source: 'adjusted', alt });
    }

    async function confirm() {
        if (!candidate) return;
        setConfirming(true);
        setError('');
        try {
            if (candidate.kind === 'existing') {
                onConfirm(candidate.url);
                return;
            }
            const url = await uploadImage(candidate.blob, candidate.filename, candidate.source);
            onConfirm(url);
        } catch (err) {
            setError((err as Error).message);
            setConfirming(false);
        }
    }

    if (adjustSourceBlob && adjustImageUrl) {
        return (
            <Modal titleId="image-picker-title" title="Ajustar imagem" onClose={onClose} size="lg">
                <AdjustPanel
                    imageUrl={adjustImageUrl}
                    initialAlt={candidate?.kind === 'blob' ? candidate.alt : ''}
                    onApply={onAdjustApplied}
                    onCancel={() => setAdjustSourceBlob(null)}
                />
            </Modal>
        );
    }

    const footer = (
        <>
            <button type="button" className="modal-btn-secondary" onClick={onClose}>Cancelar</button>
            {initialUrl && (
                <button type="button" className="modal-btn-danger" onClick={() => onConfirm('')}>
                    Remover imagem
                </button>
            )}
            <button
                type="button"
                className="modal-btn-primary"
                style={{ marginLeft: 'auto' }}
                disabled={!candidate || confirming}
                onClick={confirm}
            >
                {confirming ? 'Salvando…' : 'Usar esta imagem'}
            </button>
        </>
    );

    return (
        <Modal titleId="image-picker-title" title="Escolher imagem" onClose={onClose} size="lg" footer={footer}>
            <div className="image-picker-tabs">
                <button type="button" className={tab === 'gallery' ? 'is-active' : ''} onClick={() => setTab('gallery')}>🖼️ Galeria</button>
                <button type="button" className={tab === 'stock' ? 'is-active' : ''} onClick={() => setTab('stock')}>🌐 Stock</button>
            </div>

            {candidate && (
                <div className="image-picker-current">
                    <img src={previewUrl ?? ''} alt="" />
                    <div className="image-picker-current-meta">
                        <span className="image-picker-current-chip">{sourceLabel(candidate)}</span>
                        <button type="button" className="modal-btn-secondary" disabled={preparingAdjust} onClick={startAdjust}>
                            {preparingAdjust ? 'Preparando…' : '✎ Ajustar'}
                        </button>
                    </div>
                </div>
            )}

            {tab === 'gallery'
                ? <GalleryTab selected={candidate} onSelect={setCandidate} />
                : <StockTab onSelect={setCandidate} />}

            {error && <p className="image-picker-error">{error}</p>}
        </Modal>
    );
}
