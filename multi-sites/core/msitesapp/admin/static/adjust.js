/**
 * adjust.js — Overlay de ajuste de imagem
 *
 * Responsabilidades:
 *  - Abrir/fechar o overlay de ajuste
 *  - Inicializar e destruir o Cropper
 *  - Aplicar transformações (crop, brilho, contraste, saturação, nitidez, escala de cinza) via canvas
 *  - Notificar app.js quando a imagem ajustada estiver pronta (callback onAdjustApplied)
 */

const AdjustOverlay = (() => {
  // --- Estado interno ---
  let cropper = null;
  let onAppliedCallback = null; // chamado com o novo dataUrl após aplicar

  // --- Referências ao DOM (resolvidas uma vez em init) ---
  const el = {
    overlay:    () => document.getElementById('overlay-adjust'),
    img:        () => document.getElementById('adjust-img'),
    cropCheck:  () => document.getElementById('crop-check'),
    width:      () => document.getElementById('adj-width'),
    height:     () => document.getElementById('adj-height'),
    origSize:   () => document.getElementById('adj-orig-size'),
    brightness: () => document.getElementById('adj-brightness'),
    contrast:   () => document.getElementById('adj-contrast'),
    saturation: () => document.getElementById('adj-saturation'),
    quality:    () => document.getElementById('adj-quality'),
    sharpen:    () => document.getElementById('adj-sharpen'),
    grayscale:  () => document.getElementById('adj-grayscale'),
    alt:        () => document.getElementById('adj-alt'),
    lblBrightness: () => document.getElementById('lbl-brightness'),
    lblContrast:   () => document.getElementById('lbl-contrast'),
    lblSaturation: () => document.getElementById('lbl-saturation'),
    lblQuality:    () => document.getElementById('lbl-quality'),
    btnApply:      () => document.getElementById('btn-apply-adjust'),
    btnClose:      () => document.getElementById('btn-close-adjust'),
  };

  // --- Inicializa eventos (chamado uma vez pelo app.js) ---
  function init(callback) {
    onAppliedCallback = callback;

    el.btnClose().addEventListener('click', close);
    el.btnApply().addEventListener('click', applyAdjust);

    el.cropCheck().addEventListener('change', (e) => {
      if (!cropper) return;
      cropper.setDragMode(e.target.checked ? 'crop' : 'move');
    });

    // Sliders: atualizar label em tempo real sem re-render
    const sliders = [
      ['adj-brightness', 'lbl-brightness'],
      ['adj-contrast',   'lbl-contrast'],
      ['adj-saturation', 'lbl-saturation'],
      ['adj-quality',    'lbl-quality'],
    ];
    sliders.forEach(([inputId, lblId]) => {
      document.getElementById(inputId).addEventListener('input', (e) => {
        document.getElementById(lblId).textContent = e.target.value;
      });
    });

    // Dimensões: proporcional ao alterar width
    el.width().addEventListener('change', onWidthChange);
  }

  // --- Abre o overlay com a imagem atual ---
  function open(imageDataUrl) {
    // Reseta controles para defaults
    resetControls();

    // Carrega a imagem no elemento de ajuste
    const imgEl = el.img();
    imgEl.src = imageDataUrl;

    // Destrói cropper anterior se houver
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    // Quando a imagem carregar, inicializa o Cropper e preenche dimensões originais
    imgEl.onload = () => {
      el.origSize().textContent = `(${imgEl.naturalWidth}×${imgEl.naturalHeight})`;
      el.width().value  = imgEl.naturalWidth;
      el.height().value = imgEl.naturalHeight;

      cropper = new Cropper(imgEl, {
        viewMode: 1,
        autoCrop: false,
        dragMode: 'move',
      });
    };

    // Mostra overlay
    el.overlay().classList.add('open');
  }

  // --- Fecha o overlay sem aplicar ---
  function close() {
    el.overlay().classList.remove('open');
    // Cropper fica vivo para reabertura ser mais rápida;
    // será destruído e recriado quando open() for chamado novamente com nova imagem
  }

  // --- Reseta todos os controles para os valores padrão ---
  function resetControls() {
    el.cropCheck().checked  = false;
    el.brightness().value   = 0;
    el.contrast().value     = 0;
    el.saturation().value   = 0;
    el.quality().value      = 82;
    el.sharpen().checked    = false;
    el.grayscale().checked  = false;
    el.alt().value          = '';
    el.lblBrightness().textContent = '0';
    el.lblContrast().textContent   = '0';
    el.lblSaturation().textContent = '0';
    el.lblQuality().textContent    = '82';
  }

  // --- Mantém proporção ao alterar width ---
  function onWidthChange() {
    const imgEl = el.img();
    if (!imgEl.naturalWidth) return;
    const ratio = imgEl.naturalHeight / imgEl.naturalWidth;
    const newW  = parseInt(el.width().value) || imgEl.naturalWidth;
    el.height().value = Math.round(newW * ratio);
  }

  // --- Aplica ajustes via canvas e retorna dataUrl ---
  async function applyAdjust() {
    el.btnApply().disabled = true;
    el.btnApply().textContent = 'Processando...';

    try {
      const imgEl    = el.img();
      const isCrop   = el.cropCheck().checked;
      const quality  = parseInt(el.quality().value) / 100;
      const brightness = parseInt(el.brightness().value); // -100..100
      const contrast   = parseInt(el.contrast().value);
      const saturation = parseInt(el.saturation().value);
      const doSharpen  = el.sharpen().checked;
      const doGray     = el.grayscale().checked;
      const targetW    = parseInt(el.width().value)  || imgEl.naturalWidth;
      const targetH    = parseInt(el.height().value) || imgEl.naturalHeight;

      // 1. Obtém canvas base (com crop se ativo, senão imagem original)
      let sourceCanvas;
      if (isCrop && cropper) {
        sourceCanvas = cropper.getCroppedCanvas({ imageSmoothingQuality: 'high' });
      } else {
        // Cria canvas com a imagem original
        sourceCanvas = document.createElement('canvas');
        sourceCanvas.width  = imgEl.naturalWidth;
        sourceCanvas.height = imgEl.naturalHeight;
        sourceCanvas.getContext('2d').drawImage(imgEl, 0, 0);
      }

      // 2. Redimensiona para o tamanho alvo
      const canvas = document.createElement('canvas');
      canvas.width  = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);

      // 3. Aplica filtros pixel a pixel
      const imageData = ctx.getImageData(0, 0, targetW, targetH);
      applyPixelFilters(imageData, { brightness, contrast, saturation, doGray });
      ctx.putImageData(imageData, 0, 0);

      // 4. Aplica nitidez via convolução (se ativado)
      if (doSharpen) {
        applyConvolution(ctx, canvas, sharpenKernel());
      }

      // 5. Exporta como webp com a qualidade definida
      const resultDataUrl = canvas.toDataURL('image/webp', quality);

      close();
      if (onAppliedCallback) onAppliedCallback(resultDataUrl);

    } catch (err) {
      console.error('Erro ao aplicar ajustes:', err);
      alert('Erro ao processar a imagem: ' + err.message);
    } finally {
      el.btnApply().disabled = false;
      el.btnApply().textContent = 'Aplicar ajustes';
    }
  }

  // --- Filtros pixel a pixel ---
  function applyPixelFilters(imageData, { brightness, contrast, saturation, doGray }) {
    const data = imageData.data;
    const len  = data.length;

    // Pre-computa fator de contraste (CSS-like)
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < len; i += 4) {
      let r = data[i], g = data[i+1], b = data[i+2];

      // Brilho
      if (brightness !== 0) {
        const bv = brightness * 2.55;
        r = clamp(r + bv);
        g = clamp(g + bv);
        b = clamp(b + bv);
      }

      // Contraste
      if (contrast !== 0) {
        r = clamp(contrastFactor * (r - 128) + 128);
        g = clamp(contrastFactor * (g - 128) + 128);
        b = clamp(contrastFactor * (b - 128) + 128);
      }

      // Saturação
      if (saturation !== 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const sf   = 1 + saturation / 100;
        r = clamp(gray + sf * (r - gray));
        g = clamp(gray + sf * (g - gray));
        b = clamp(gray + sf * (b - gray));
      }

      // Escala de cinza
      if (doGray) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = g = b = lum;
      }

      data[i] = r; data[i+1] = g; data[i+2] = b;
    }
  }

  // --- Kernel de nitidez (unsharp mask simples) ---
  function sharpenKernel() {
    return [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0,
    ];
  }

  // --- Aplica convolução 3x3 ---
  function applyConvolution(ctx, canvas, kernel) {
    const w = canvas.width, h = canvas.height;
    const src  = ctx.getImageData(0, 0, w, h);
    const dst  = ctx.createImageData(w, h);
    const s    = src.data, d = dst.data;

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

  function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

  // --- API pública ---
  return { init, open, close };
})();