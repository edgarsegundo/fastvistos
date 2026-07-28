/*
 * Porte de multi-sites/core/msitesapp/admin/static/adjust.js (filtros pixel
 * a pixel + convolução de nitidez) — mesmas fórmulas, agora em TypeScript.
 */

export function clamp(v: number): number {
    return Math.max(0, Math.min(255, Math.round(v)));
}

export function applyPixelFilters(
    imageData: ImageData,
    { brightness, contrast, saturation, doGray }: { brightness: number; contrast: number; saturation: number; doGray: boolean },
) {
    const data = imageData.data;
    const len = data.length;

    // Pre-computa fator de contraste (CSS-like)
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        if (brightness !== 0) {
            const bv = brightness * 2.55;
            r = clamp(r + bv);
            g = clamp(g + bv);
            b = clamp(b + bv);
        }

        if (contrast !== 0) {
            r = clamp(contrastFactor * (r - 128) + 128);
            g = clamp(contrastFactor * (g - 128) + 128);
            b = clamp(contrastFactor * (b - 128) + 128);
        }

        if (saturation !== 0) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const sf = 1 + saturation / 100;
            r = clamp(gray + sf * (r - gray));
            g = clamp(gray + sf * (g - gray));
            b = clamp(gray + sf * (b - gray));
        }

        if (doGray) {
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            r = g = b = lum;
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }
}

export function sharpenKernel(): number[] {
    return [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0,
    ];
}

export function applyConvolution(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, kernel: number[]) {
    const w = canvas.width;
    const h = canvas.height;
    const src = ctx.getImageData(0, 0, w, h);
    const dst = ctx.createImageData(w, h);
    const s = src.data;
    const d = dst.data;

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const ni = ((y + ky) * w + (x + kx)) * 4;
                        sum += s[ni + c] * kernel[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                d[idx + c] = clamp(sum);
            }
            d[idx + 3] = s[idx + 3]; // alpha intacto
        }
    }
    ctx.putImageData(dst, 0, 0);
}
