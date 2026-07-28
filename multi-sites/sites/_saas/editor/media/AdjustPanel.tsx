/*
 * Porte de multi-sites/core/msitesapp/admin/static/adjust.js: crop
 * (CropperJS) + brilho/contraste/saturação/nitidez/escala de cinza/resize
 * via canvas 2D, exportado como WebP. 100% client-side — nada aqui bate no
 * backend, só devolve um Blob pro chamador decidir o que fazer (upload).
 */
import React, { useEffect, useRef, useState } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { applyConvolution, applyPixelFilters, sharpenKernel } from './canvasFilters';

const labelStyle: React.CSSProperties = { fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 2 };
const inputStyle: React.CSSProperties = {
    border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px', fontSize: 13, width: 72,
};

export function AdjustPanel({
    imageUrl,
    initialAlt = '',
    onApply,
    onCancel,
}: {
    imageUrl: string;
    initialAlt?: string;
    onApply: (blob: Blob, alt: string) => void;
    onCancel: () => void;
}) {
    const imgRef = useRef<HTMLImageElement>(null);
    const cropperRef = useRef<Cropper | null>(null);

    const [origSize, setOrigSize] = useState('');
    const [cropOn, setCropOn] = useState(false);
    const [width, setWidth] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const [quality, setQuality] = useState(82);
    const [sharpen, setSharpen] = useState(false);
    const [grayscale, setGrayscale] = useState(false);
    const [alt, setAlt] = useState(initialAlt);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        const imgEl = imgRef.current;
        if (!imgEl) return;

        cropperRef.current?.destroy();
        cropperRef.current = null;
        setCropOn(false);

        const onLoad = () => {
            setOrigSize(`(${imgEl.naturalWidth}×${imgEl.naturalHeight})`);
            setWidth(imgEl.naturalWidth);
            setHeight(imgEl.naturalHeight);
            cropperRef.current = new Cropper(imgEl, { viewMode: 1, autoCrop: false, dragMode: 'move' });
        };
        imgEl.addEventListener('load', onLoad);
        imgEl.src = imageUrl;

        return () => {
            imgEl.removeEventListener('load', onLoad);
            cropperRef.current?.destroy();
            cropperRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageUrl]);

    function onCropToggle(checked: boolean) {
        setCropOn(checked);
        cropperRef.current?.setDragMode(checked ? 'crop' : 'move');
    }

    function onWidthChange(v: string) {
        const imgEl = imgRef.current;
        const newW = parseInt(v, 10);
        setWidth(Number.isNaN(newW) ? '' : newW);
        if (!imgEl?.naturalWidth || Number.isNaN(newW)) return;
        const ratio = imgEl.naturalHeight / imgEl.naturalWidth;
        setHeight(Math.round(newW * ratio));
    }

    async function applyAdjust() {
        const imgEl = imgRef.current;
        if (!imgEl) return;
        setApplying(true);
        try {
            const targetW = typeof width === 'number' ? width : imgEl.naturalWidth;
            const targetH = typeof height === 'number' ? height : imgEl.naturalHeight;

            let sourceCanvas: HTMLCanvasElement;
            if (cropOn && cropperRef.current) {
                sourceCanvas = cropperRef.current.getCroppedCanvas({ imageSmoothingQuality: 'high' } as any);
            } else {
                sourceCanvas = document.createElement('canvas');
                sourceCanvas.width = imgEl.naturalWidth;
                sourceCanvas.height = imgEl.naturalHeight;
                sourceCanvas.getContext('2d')!.drawImage(imgEl, 0, 0);
            }

            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);

            const imageData = ctx.getImageData(0, 0, targetW, targetH);
            applyPixelFilters(imageData, { brightness, contrast, saturation, doGray: grayscale });
            ctx.putImageData(imageData, 0, 0);

            if (sharpen) {
                applyConvolution(ctx, canvas, sharpenKernel());
            }

            canvas.toBlob(
                (blob) => {
                    setApplying(false);
                    if (blob) onApply(blob, alt);
                },
                'image/webp',
                quality / 100,
            );
        } catch (err) {
            setApplying(false);
            // eslint-disable-next-line no-alert
            alert('Erro ao processar a imagem: ' + (err as Error).message);
        }
    }

    return (
        <div className="adjust-panel">
            <div className="adjust-panel-preview-col">
                <div className="adjust-panel-preview">
                    <img ref={imgRef} alt="" />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginTop: 10 }}>
                    <input type="checkbox" checked={cropOn} onChange={(e) => onCropToggle(e.target.checked)} />
                    Recortar (arraste na imagem acima)
                </label>
            </div>

            <div className="adjust-panel-controls-col">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>Tamanho:</span>
                    <input style={inputStyle} type="number" placeholder="W" value={width}
                        onChange={(e) => onWidthChange(e.target.value)} />
                    <span style={{ color: '#9ca3af' }}>×</span>
                    <input style={inputStyle} type="number" placeholder="H" value={height}
                        onChange={(e) => setHeight(e.target.value === '' ? '' : parseInt(e.target.value, 10))} />
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{origSize}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                        <span style={labelStyle}>Brilho {brightness}</span>
                        <input type="range" min={-100} max={100} value={brightness} style={{ width: '100%' }}
                            onChange={(e) => setBrightness(parseInt(e.target.value, 10))} />
                    </div>
                    <div>
                        <span style={labelStyle}>Contraste {contrast}</span>
                        <input type="range" min={-100} max={100} value={contrast} style={{ width: '100%' }}
                            onChange={(e) => setContrast(parseInt(e.target.value, 10))} />
                    </div>
                    <div>
                        <span style={labelStyle}>Saturação {saturation}</span>
                        <input type="range" min={-100} max={100} value={saturation} style={{ width: '100%' }}
                            onChange={(e) => setSaturation(parseInt(e.target.value, 10))} />
                    </div>
                    <div>
                        <span style={labelStyle}>Qualidade WebP {quality}</span>
                        <input type="range" min={1} max={100} value={quality} style={{ width: '100%' }}
                            onChange={(e) => setQuality(parseInt(e.target.value, 10))} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 20, marginBottom: 14, fontSize: 13 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="checkbox" checked={sharpen} onChange={(e) => setSharpen(e.target.checked)} /> Nitidez
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="checkbox" checked={grayscale} onChange={(e) => setGrayscale(e.target.checked)} /> Escala de cinza
                    </label>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <span style={labelStyle}>Alt text</span>
                    <input style={{ ...inputStyle, width: '100%' }} type="text" placeholder="Descrição da imagem"
                        value={alt} onChange={(e) => setAlt(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button type="button" className="modal-btn-primary" disabled={applying} onClick={applyAdjust}>
                        {applying ? 'Processando…' : 'Aplicar ajustes'}
                    </button>
                    <button type="button" className="modal-btn-secondary" onClick={onCancel}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}
