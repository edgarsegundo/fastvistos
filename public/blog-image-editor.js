/**
 * blog-image-editor.js
 * Developed by Edgar Segundo with the help of Claude AI. 
 * Claude thread: https://claude.ai/chat/de3b90af-4fe6-460e-91f3-fea34eddaf1a
 * Ferramenta de inserção/edição de imagens em artigos — somente dev local.
 * Injetado condicionalmente pelo [...slug].astro quando import.meta.env.DEV === true.
 *
 * Configuração injetada pelo Astro template em window.__BLOG_EDITOR_CONFIG__:
 *   { slug, siteId, businessId, proxyBase }
 *
 * Arquitetura:
 *   openImagePicker(opts)  → parte comum: escolher fonte + ajustes → retorna { imageUrl, altText, transforms }
 *   onPickedForArticle()   → botão "Inserir imagem": insere no content_md
 *   onPickedForHero()      → botão "Imagem principal": salva no campo image do DB
 */

(function () {
  'use strict';

  // ─── Config ────────────────────────────────────────────────────────────────
  const cfg = window.__BLOG_EDITOR_CONFIG__ || {};
  const SLUG         = cfg.slug       || '';
  const SITE_ID      = cfg.siteId     || 'unknown';
  const BUSINESS_ID  = cfg.businessId || '';
  const PROXY        = cfg.proxyBase  || '';

  // API paths (relative → Vite proxy)
  const API = {
    contentMd:   () => `${PROXY}/image-editor/api/articles/${BUSINESS_ID}/${SLUG}/content-md/`,
    saveMd:      () => `${PROXY}/image-editor/api/articles/${BUSINESS_ID}/${SLUG}/save-content-md/`,
    uploadImage: () => `${PROXY}/image-editor/api/articles/${BUSINESS_ID}/${SLUG}/upload-image/`,
    upload:      () => `${PROXY}/image-upload/upload`,
    articleImage:() => `${PROXY}/article-image`,
    preview:     () => `${PROXY}/image-upload/preview`,
    renderMd:    () => `${PROXY}/image-upload/render-md`,
    files:       (path) => `${PROXY}/image-upload/files/${SITE_ID}${path}`,
  };

  // ─── Global state ──────────────────────────────────────────────────────────
  let lastClickedTarget = null;

  // ─── Init ──────────────────────────────────────────────────────────────────
  function init() {
    if (!SLUG || !BUSINESS_ID) {
      console.warn('[blog-image-editor] Missing slug or businessId — aborting.');
      return;
    }
    injectStyles();
    renderImagePlaceholders();
    setupClickTracking();
    setupPasteHandler();
    setupFabs();
  }

  // ─── FABs ──────────────────────────────────────────────────────────────────
  function setupFabs() {
    const container = document.createElement('div');
    container.id = 'editor-fab-container';
    document.body.appendChild(container);

    // Botão 1 — Inserir imagem no artigo
    const fabInsert = makeFab('img-insert-fab', '🖼️ Inserir imagem no artigo', () => {
      if (!lastClickedTarget) {
        showToast('Clique em um parágrafo do artigo primeiro', 'error');
        return;
      }
      openImagePicker({
        initialTab: 'upload',
        title: '🖼️ Inserir imagem no artigo',
        submitLabel: 'Inserir imagem',
        showLayoutPicker: true,
        onSubmit: onPickedForArticle,
      });
    });

    // Botão 2 — Imagem principal (hero)
    const fabHero = makeFab('hero-image-fab', '📷 Imagem principal', () => {
      openImagePicker({
        initialTab: 'upload',
        title: '📷 Imagem principal do artigo',
        submitLabel: 'Salvar imagem principal',
        showLayoutPicker: false,
        onSubmit: onPickedForHero,
      });
    });

    // Botão 3 — Editor de MD
    const fabMd = makeFab('md-editor-fab', '✏️ Editar MD', openMdEditor);

    container.appendChild(fabInsert);
    container.appendChild(fabHero);
    container.appendChild(fabMd);
  }

  function makeFab(id, label, onClick) {
    const btn = document.createElement('button');
    btn.id = id;
    btn.className = 'editor-fab';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  // ─── Paste handler ─────────────────────────────────────────────────────────
  function setupPasteHandler() {
    document.addEventListener('paste', (e) => {
      // Nunca intercepta paste dentro de inputs/textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Se há um modal aberto, só repassa o paste se a aba ativa for 'clipboard'
      const modal = document.getElementById('img-picker-modal');
      if (modal) {
        const activeTab = modal.querySelector('.tab.active');
        if (!activeTab || activeTab.dataset.tab !== 'clipboard') return;
        // Modal aberto na aba clipboard: deixa o evento chegar ao handler interno
        return;
      }

      const imageFile = extractImageFromClipboard(e);
      if (!imageFile) return;
      e.preventDefault();

      // Abre o picker de inserção no artigo com a imagem do clipboard
      openImagePicker({
        initialTab: 'clipboard',
        initialFile: imageFile,
        title: '🖼️ Inserir imagem no artigo',
        submitLabel: 'Inserir imagem',
        showLayoutPicker: true,
        onSubmit: onPickedForArticle,
      });
    });
  }

  function extractImageFromClipboard(pasteEvent) {
    const items = pasteEvent.clipboardData && pasteEvent.clipboardData.items;
    if (!items) return null;
    for (const item of items) {
      if (item.type.startsWith('image/')) return item.getAsFile();
    }
    return null;
  }

  // ─── onSubmit handlers ─────────────────────────────────────────────────────

  /**
   * Botão 1 — Inserir imagem no artigo.
   * Recebe o resultado do picker e insere no content_md.
   */
  async function onPickedForArticle({ imageUrl, altText, layout, caption, uploadRes }) {
    if (!lastClickedTarget) {
      throw new Error('Clique em um parágrafo do artigo primeiro.');
    }

    // Se o layout for 'hero', também salva no campo image do DB
    if (layout === 'hero') {
      await saveArticleImageToDB({
        image:             imageUrl.replace(/^\//, ''),
        seo_image_url:     imageUrl,
        seo_image_caption: caption || null,
        seo_image_width:   uploadRes?.width  || null,
        seo_image_height:  uploadRes?.height || null,
      });
    }

    const contentMd = await fetchContentMd();
    const imgTag    = buildImgTag(imageUrl, altText, layout, caption);
    const { lineIndex, isPlaceholder } = findInsertionLine(contentMd, lastClickedTarget, 'free', null);
    const newMd     = insertImageInMd(contentMd, lineIndex, imgTag, isPlaceholder);

    await saveContentMd(newMd);
    await hotReloadArticle(newMd);
  }

  /**
   * Botão 2 — Imagem principal.
   * Recebe o resultado do picker e salva apenas no campo image do DB.
   * Não toca no content_md.
   */
  async function onPickedForHero({ imageUrl }) {
    await uploadImageToDjango(imageUrl);
  }

  // ─── openImagePicker ───────────────────────────────────────────────────────
  /**
   * Modal genérico de seleção e ajuste de imagem.
   *
   * opts:
   *   title           string   — título do modal
   *   submitLabel     string   — texto do botão de confirmação
   *   initialTab      string   — 'clipboard' | 'upload' | 'url'
   *   initialFile     File?    — arquivo pré-carregado (ex: paste)
   *   showLayoutPicker bool    — exibe ou não o seletor de layout
   *   onSubmit        async fn — chamado com { imageUrl, altText, layout, caption, uploadRes }
   *                             deve lançar Error em caso de falha
   */
  function openImagePicker(opts) {
    closePicker();

    const {
      title         = '📷 Imagem',
      submitLabel   = 'Confirmar',
      initialTab    = 'upload',
      initialFile   = null,
      showLayoutPicker = true,
      onSubmit,
    } = opts;

    const overlay = document.createElement('div');
    overlay.id = 'img-picker-modal';

    overlay.innerHTML = `
      <div class="modal-box">
        <h2>${escHtml(title)}</h2>

        <!-- ── STEP 1: escolher fonte ── -->
        <div class="step1" id="picker-step1">
          <div class="tabs">
            <button class="tab ${initialTab === 'clipboard' ? 'active' : ''}" data-tab="clipboard">Clipboard</button>
            <button class="tab ${initialTab === 'upload'    ? 'active' : ''}" data-tab="upload">Upload</button>
            <button class="tab ${initialTab === 'url'       ? 'active' : ''}" data-tab="url">URL externa</button>
          </div>

          <div class="tab-panel ${initialTab === 'clipboard' ? 'active' : ''}" data-panel="clipboard">
            <div class="preview-wrap" id="picker-preview-clipboard">
              <span class="preview-hint">Cole uma imagem (Ctrl+V / Cmd+V)</span>
            </div>
          </div>

          <div class="tab-panel ${initialTab === 'upload' ? 'active' : ''}" data-panel="upload">
            <label class="custom-file-label" for="picker-file-input">Escolher arquivo</label>
            <input type="file" id="picker-file-input" accept="image/*" />
            <span class="file-chosen-name" id="picker-file-name">Nenhum arquivo</span>
            <input type="text" id="picker-custom-filename"
              placeholder="Nome do arquivo (opcional)"
              style="margin-left:10px;max-width:180px;font-size:13px;padding:5px 8px;
                     border:1px solid #ccc;border-radius:5px;vertical-align:middle;display:inline-block" />
            <div class="preview-wrap" id="picker-preview-upload">
              <span class="preview-hint">Selecione um arquivo</span>
            </div>
          </div>

          <div class="tab-panel ${initialTab === 'url' ? 'active' : ''}" data-panel="url">
            <label>URL da imagem</label>
            <input type="url" id="picker-url-input" placeholder="https://exemplo.com/imagem.jpg" />
            <div class="preview-wrap" id="picker-preview-url">
              <span class="preview-hint">Cole uma URL acima</span>
            </div>
          </div>

          <details id="img-banks-panel">
            <summary>
              🔗 Bancos de imagens gratuitos
              <span class="img-bank-chevron">▾</span>
            </summary>
            <div class="img-banks-body">
              <div class="img-bank-cat">Fotos</div>
              <div class="img-bank-chips">
                ${['Pixabay|https://pixabay.com','Pexels|https://www.pexels.com','Unsplash|https://unsplash.com',
                   'Freepik|https://www.freepik.com','StockSnap|https://stocksnap.io','Burst|https://burst.shopify.com',
                   'Life of Pix|https://www.lifeofpix.com','Gratisography|https://gratisography.com',
                   'Foodiesfeed|https://www.foodiesfeed.com']
                  .map(s => { const [l,u]=s.split('|'); return `<a href="${u}" target="_blank" rel="noopener" class="img-bank-link">${l}</a>`; }).join('')}
              </div>
              <div class="img-bank-cat">Vetores / Ícones</div>
              <div class="img-bank-chips">
                ${['Vecteezy|https://www.vecteezy.com','Flaticon|https://www.flaticon.com',
                   'unDraw|https://undraw.co','SVG Repo|https://www.svgrepo.com','Rawpixel|https://www.rawpixel.com']
                  .map(s => { const [l,u]=s.split('|'); return `<a href="${u}" target="_blank" rel="noopener" class="img-bank-link vec">${l}</a>`; }).join('')}
              </div>
            </div>
          </details>

          <label>Alt text</label>
          <input type="text" id="picker-alt-input" value="${escHtml(SLUG)}" placeholder="Descrição da imagem" />

          <div class="modal-actions">
            <button class="btn-cancel" id="picker-btn-cancel">Cancelar</button>
            <button class="btn-primary" id="picker-btn-next" disabled>Ajustar →</button>
          </div>
        </div>

        <!-- ── STEP 2: ajustar ── -->
        <div class="step2" id="picker-step2">
          <div class="adjust-preview" id="picker-adjust-preview">
            <span class="preview-hint">Preview</span>
          </div>

          <!-- Crop -->
          <div class="crop-section">
            <label class="toggle-label">
              <input type="checkbox" id="picker-crop-enable" /> Recortar (arraste na imagem abaixo)
            </label>
            <div id="picker-crop-container" style="display:none;margin-top:6px">
              <div class="crop-wrap" id="picker-crop-wrap">
                <img id="picker-crop-img" src="" alt="crop preview" />
                <div class="crop-rect" id="picker-crop-rect" style="display:none"></div>
              </div>
              <div class="crop-coords" id="picker-crop-coords">Arraste para selecionar área</div>
            </div>
          </div>

          <!-- Resize -->
          <div class="size-row">
            <span class="size-label">Tamanho:</span>
            <input type="number" id="picker-adj-w" placeholder="W" min="1" max="3000" />
            <span class="size-sep">×</span>
            <input type="number" id="picker-adj-h" placeholder="H" min="1" max="3000" />
            <button class="lock-btn locked" id="picker-lock-ratio" title="Bloquear proporção">🔒</button>
            <span class="orig-dims" id="picker-orig-dims"></span>
          </div>

          <!-- Sliders -->
          <div class="adjust-grid">
            <div class="adjust-row">
              <label>Brilho <span class="range-val" id="picker-val-brightness">0</span></label>
              <input type="range" id="picker-adj-brightness" min="-100" max="100" value="0" />
            </div>
            <div class="adjust-row">
              <label>Contraste <span class="range-val" id="picker-val-contrast">0</span></label>
              <input type="range" id="picker-adj-contrast" min="-100" max="100" value="0" />
            </div>
            <div class="adjust-row">
              <label>Saturação <span class="range-val" id="picker-val-saturation">0</span></label>
              <input type="range" id="picker-adj-saturation" min="-100" max="100" value="0" />
            </div>
            <div class="adjust-row">
              <label>Qualidade WebP <span class="range-val" id="picker-val-quality">82</span></label>
              <input type="range" id="picker-adj-quality" min="30" max="100" value="82" />
            </div>
          </div>
          <div class="toggle-row">
            <label class="toggle-label"><input type="checkbox" id="picker-adj-sharpen" /> Nitidez</label>
            <label class="toggle-label"><input type="checkbox" id="picker-adj-grayscale" /> Escala de cinza</label>
          </div>

          <!-- Layout (opcional) -->
          ${showLayoutPicker ? `
          <div class="layout-section" id="picker-layout-section">
            <div class="section-label">Layout:</div>
            <div class="layout-grid">
              <div class="layout-opt selected" data-layout="alone"><span class="layout-icon">🖼️</span><span>Sozinha</span></div>
              <div class="layout-opt" data-layout="figure"><span class="layout-icon">📝</span><span>Legenda</span></div>
              <div class="layout-opt" data-layout="float-left"><span class="layout-icon">⬅️🖼️</span><span>Float esq.</span></div>
              <div class="layout-opt" data-layout="float-right"><span class="layout-icon">🖼️➡️</span><span>Float dir.</span></div>
              <div class="layout-opt" data-layout="hero"><span class="layout-icon">🌅</span><span>Hero</span></div>
              <div class="layout-opt" data-layout="grid2"><span class="layout-icon">⬜⬜</span><span>Grid 2</span></div>
            </div>
            <div id="picker-caption-row" style="display:none;margin-top:8px">
              <label>Legenda</label>
              <input type="text" id="picker-caption" placeholder="Texto da legenda…" />
            </div>
          </div>` : ''}

          <div class="step2-actions">
            <button class="btn-cancel" id="picker-btn-back">← Voltar</button>
            <div style="display:flex;gap:8px">
              <button class="btn-secondary" id="picker-btn-preview-refresh">↺ Preview</button>
              <button class="btn-primary" id="picker-btn-submit">${escHtml(submitLabel)}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // ── State local do picker ──
    let currentFile   = initialFile || null;
    let currentUrl    = '';
    let activeTab     = initialTab;
    let selectedLayout = 'alone';
    let origW = 0, origH = 0;
    let ratioLocked   = true;
    let cropData      = null;

    const step1     = overlay.querySelector('#picker-step1');
    const step2     = overlay.querySelector('#picker-step2');
    const nextBtn   = overlay.querySelector('#picker-btn-next');
    const submitBtn = overlay.querySelector('#picker-btn-submit');

    // ── Paste interno (aba clipboard já aberta) ──
    function handleInternalPaste(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (activeTab !== 'clipboard') return;
      const file = extractImageFromClipboard(e);
      if (!file) return;
      e.preventDefault();
      currentFile = file;
      showFilePreview(file, overlay.querySelector('#picker-preview-clipboard'));
      refreshNextBtn();
    }
    document.addEventListener('paste', handleInternalPaste);

    // Limpa o listener de paste quando o modal fechar
    function cleanup() { document.removeEventListener('paste', handleInternalPaste); }

    // ── Se já temos arquivo inicial (paste externo) ──
    if (currentFile) {
      showFilePreview(currentFile, overlay.querySelector('#picker-preview-clipboard'));
      refreshNextBtn();
    }

    // ── Helpers de estado ──
    function refreshNextBtn() {
      const hasSource = (activeTab === 'url') ? !!currentUrl.trim() : !!currentFile;
      nextBtn.disabled = !hasSource;
    }

    // ── Tab switching ──
    overlay.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        overlay.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
        overlay.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        overlay.querySelector(`[data-panel="${activeTab}"]`).classList.add('active');
        refreshNextBtn();
      });
    });

    // ── File input ──
    overlay.querySelector('#picker-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      overlay.querySelector('#picker-file-name').textContent = file.name;
      overlay.querySelector('#picker-custom-filename').value = file.name;
      currentFile = file;
      showFilePreview(file, overlay.querySelector('#picker-preview-upload'));
      refreshNextBtn();
    });

    // ── URL input ──
    overlay.querySelector('#picker-url-input').addEventListener('input', (e) => {
      currentUrl = e.target.value.trim();
      refreshNextBtn();
    });
    overlay.querySelector('#picker-url-input').addEventListener('blur', (e) => {
      const url = e.target.value.trim();
      if (!url) return;
      const wrap = overlay.querySelector('#picker-preview-url');
      wrap.innerHTML = `<img src="${escHtml(url)}" alt="preview"
        onerror="this.parentNode.innerHTML='<span class=preview-hint style=color:#c62828>URL inválida</span>'" />`;
    });

    // ── Fechar ──
    function closeAndCleanup() { cleanup(); closePicker(); }
    overlay.querySelector('#picker-btn-cancel').addEventListener('click', closeAndCleanup);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAndCleanup(); });

    // ── Step 1 → Step 2 ──
    nextBtn.addEventListener('click', () => {
      step1.classList.add('hidden');
      step2.classList.add('active');
      initStep2();
    });

    overlay.querySelector('#picker-btn-back').addEventListener('click', () => {
      step2.classList.remove('active');
      step1.classList.remove('hidden');
    });

    // ── Step 2: inicialização ──
    function initStep2() {
      if (activeTab === 'url') {
        const wrap = overlay.querySelector('#picker-adjust-preview');
        wrap.innerHTML = `<img src="${escHtml(currentUrl)}" alt="preview" style="max-width:100%;max-height:200px" />`;
        loadOrigDimsFromUrl(currentUrl);
      } else if (currentFile) {
        renderLocalPreview(currentFile);
        getFileDims(currentFile).then(({ w, h }) => {
          origW = w; origH = h;
          overlay.querySelector('#picker-orig-dims').textContent = `(${w}×${h})`;
          overlay.querySelector('#picker-adj-w').placeholder = w;
          overlay.querySelector('#picker-adj-h').placeholder = h;
        });
      }
      setupCropInteraction();
    }

    function loadOrigDimsFromUrl(url) {
      const img = new Image();
      img.onload = () => {
        origW = img.naturalWidth; origH = img.naturalHeight;
        overlay.querySelector('#picker-orig-dims').textContent = `(${origW}×${origH})`;
        overlay.querySelector('#picker-adj-w').placeholder = origW;
        overlay.querySelector('#picker-adj-h').placeholder = origH;
      };
      img.src = url;
    }

    function renderLocalPreview(file, withTransforms = false) {
      const wrap = overlay.querySelector('#picker-adjust-preview');
      wrap.innerHTML = '<div class="preview-loading">Carregando…</div>';
      const reader = new FileReader();
      reader.onload = (e) => {
        wrap.innerHTML = `<img src="${e.target.result}" alt="preview" style="max-width:100%;max-height:200px" />`;
        if (!withTransforms) return;
        const t = collectTransforms();
        const hasAdjustments = t.brightness !== 0 || t.contrast !== 0 || t.saturation !== 0
          || t.sharpen || t.grayscale || t.width || t.height || cropData;
        if (!hasAdjustments) return;
        const form = new FormData();
        form.append('file', file);
        Object.entries(t).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v); });
        fetch(API.preview(), { method: 'POST', body: form })
          .then((r) => r.ok ? r.blob() : Promise.reject())
          .then((blob) => {
            wrap.innerHTML = `<img src="${URL.createObjectURL(blob)}" alt="preview" style="max-width:100%;max-height:200px" />`;
          })
          .catch(() => {});
      };
      reader.readAsDataURL(file);
    }

    function getFileDims(file) {
      return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload  = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
        img.onerror = () => resolve({ w: 0, h: 0 });
        img.src = url;
      });
    }

    // ── Sliders ──
    ['brightness', 'contrast', 'saturation'].forEach((key) => {
      const el  = overlay.querySelector(`#picker-adj-${key}`);
      const lbl = overlay.querySelector(`#picker-val-${key}`);
      el.addEventListener('input', () => { lbl.textContent = el.value; });
    });
    const qEl = overlay.querySelector('#picker-adj-quality');
    qEl.addEventListener('input', () => { overlay.querySelector('#picker-val-quality').textContent = qEl.value; });

    // ── Aspect ratio lock ──
    const lockBtn = overlay.querySelector('#picker-lock-ratio');
    lockBtn.addEventListener('click', () => {
      ratioLocked = !ratioLocked;
      lockBtn.classList.toggle('locked', ratioLocked);
      lockBtn.textContent = ratioLocked ? '🔒' : '🔓';
    });
    overlay.querySelector('#picker-adj-w').addEventListener('input', (e) => {
      if (!ratioLocked || !origW || !origH) return;
      const w = parseInt(e.target.value, 10);
      if (w) overlay.querySelector('#picker-adj-h').value = Math.round(w * origH / origW);
    });
    overlay.querySelector('#picker-adj-h').addEventListener('input', (e) => {
      if (!ratioLocked || !origW || !origH) return;
      const h = parseInt(e.target.value, 10);
      if (h) overlay.querySelector('#picker-adj-w').value = Math.round(h * origW / origH);
    });

    // ── Layout selector (opcional) ──
    if (showLayoutPicker) {
      overlay.querySelectorAll('.layout-opt').forEach((opt) => {
        opt.addEventListener('click', () => {
          overlay.querySelectorAll('.layout-opt').forEach((o) => o.classList.remove('selected'));
          opt.classList.add('selected');
          selectedLayout = opt.dataset.layout;
          const captionRow = overlay.querySelector('#picker-caption-row');
          if (captionRow) captionRow.style.display = selectedLayout === 'figure' ? '' : 'none';
        });
      });
    }

    // ── Crop ──
    overlay.querySelector('#picker-crop-enable').addEventListener('change', (e) => {
      overlay.querySelector('#picker-crop-container').style.display = e.target.checked ? '' : 'none';
      if (!e.target.checked) cropData = null;
    });

    function setupCropInteraction() {
      const cropImg    = overlay.querySelector('#picker-crop-img');
      const cropWrap   = overlay.querySelector('#picker-crop-wrap');
      const cropRect   = overlay.querySelector('#picker-crop-rect');
      const cropCoords = overlay.querySelector('#picker-crop-coords');

      if (activeTab === 'url') {
        cropImg.src = currentUrl;
      } else if (currentFile) {
        cropImg.src = URL.createObjectURL(currentFile);
      }

      let dragging = false, startX = 0, startY = 0, rect = {};

      cropWrap.addEventListener('mousedown', (e) => {
        dragging = true;
        const br = cropWrap.getBoundingClientRect();
        startX = e.clientX - br.left;
        startY = e.clientY - br.top;
        cropRect.style.cssText += ';display:block;left:' + startX + 'px;top:' + startY + 'px;width:0;height:0';
        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const br = cropWrap.getBoundingClientRect();
        const x  = Math.max(0, Math.min(e.clientX - br.left, cropImg.offsetWidth));
        const y  = Math.max(0, Math.min(e.clientY - br.top,  cropImg.offsetHeight));
        rect = {
          left:   Math.min(x, startX), top:    Math.min(y, startY),
          width:  Math.abs(x - startX), height: Math.abs(y - startY),
        };
        Object.assign(cropRect.style, {
          left: rect.left + 'px', top: rect.top + 'px',
          width: rect.width + 'px', height: rect.height + 'px',
        });
      });

      document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        if (rect.width < 4 || rect.height < 4) {
          cropData = null;
          cropCoords.textContent = 'Arraste para selecionar área';
          return;
        }
        const scaleX = cropImg.naturalWidth  / cropImg.offsetWidth;
        const scaleY = cropImg.naturalHeight / cropImg.offsetHeight;
        cropData = {
          left:   Math.round(rect.left   * scaleX),
          top:    Math.round(rect.top    * scaleY),
          width:  Math.round(rect.width  * scaleX),
          height: Math.round(rect.height * scaleY),
        };
        cropCoords.textContent = `Crop: ${cropData.left},${cropData.top} — ${cropData.width}×${cropData.height}px`;
      });
    }

    // ── Preview refresh ──
    overlay.querySelector('#picker-btn-preview-refresh').addEventListener('click', () => {
      if (activeTab !== 'url' && currentFile) renderLocalPreview(currentFile, true);
    });

    // ── Collect transforms ──
    function collectTransforms() {
      const w = parseInt(overlay.querySelector('#picker-adj-w').value, 10);
      const h = parseInt(overlay.querySelector('#picker-adj-h').value, 10);
      const t = {
        brightness: parseInt(overlay.querySelector('#picker-adj-brightness').value, 10),
        contrast:   parseInt(overlay.querySelector('#picker-adj-contrast').value, 10),
        saturation: parseInt(overlay.querySelector('#picker-adj-saturation').value, 10),
        quality:    parseInt(overlay.querySelector('#picker-adj-quality').value, 10),
        sharpen:    overlay.querySelector('#picker-adj-sharpen').checked,
        grayscale:  overlay.querySelector('#picker-adj-grayscale').checked,
      };
      if (w > 0) t.width  = w;
      if (h > 0) t.height = h;
      if (cropData) {
        t.cropLeft = cropData.left; t.cropTop  = cropData.top;
        t.cropWidth = cropData.width; t.cropHeight = cropData.height;
      }
      return t;
    }

    // ── Submit ──
    submitBtn.addEventListener('click', async () => {
      const altText = overlay.querySelector('#picker-alt-input').value.trim() || SLUG;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processando…';

      try {
        let imageUrl, uploadRes;

        if (activeTab === 'url') {
          imageUrl = currentUrl;
        } else {
          if (!currentFile) throw new Error('Nenhum arquivo selecionado.');
          const customName = overlay.querySelector('#picker-custom-filename')?.value.trim();
          let fileToSend = currentFile;
          if (customName && customName !== currentFile.name) {
            try { fileToSend = new File([currentFile], customName, { type: currentFile.type }); }
            catch (_) { /* Safari fallback */ }
          }
          uploadRes = await uploadImageToService(fileToSend, collectTransforms());
          imageUrl  = uploadRes.url;
        }

        const caption = overlay.querySelector('#picker-caption')?.value.trim() || '';

        await onSubmit({ imageUrl, altText, layout: selectedLayout, caption, uploadRes });

        closeAndCleanup();
        showToast(`${submitLabel} ✓`, 'success');
      } catch (err) {
        console.error('[blog-image-editor]', err);
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
        showToast(`Erro: ${err.message}`, 'error');
      }
    });
  }

  function closePicker() {
    const m = document.getElementById('img-picker-modal');
    if (m) m.remove();
  }

  // ─── Placeholder rendering ──────────────────────────────────────────────────
  function renderImagePlaceholders() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
    const toReplace = [];
    let node;
    while ((node = walker.nextNode())) {
      const text  = node.nodeValue || '';
      const match = text.match(/^\[\[INSERIR IMAGEM:\s*(.*?)\]\]$/);
      if (match) toReplace.push({ node, description: match[1].trim() });
    }
    toReplace.forEach(({ node, description }) => {
      const btn = document.createElement('button');
      btn.className = 'img-placeholder-btn';
      btn.dataset.placeholderText = description;
      btn.textContent = `📷 ${description}`;
      btn.addEventListener('click', () => {
        openImagePicker({
          initialTab: 'upload',
          title: `🖼️ Inserir: ${description}`,
          submitLabel: 'Inserir imagem',
          showLayoutPicker: true,
          onSubmit: async (result) => {
            const contentMd = await fetchContentMd();
            const imgTag    = buildImgTag(result.imageUrl, result.altText, result.layout, result.caption);
            const { lineIndex, isPlaceholder } = findInsertionLine(contentMd, null, 'placeholder', description);
            const newMd     = insertImageInMd(contentMd, lineIndex, imgTag, isPlaceholder);
            await saveContentMd(newMd);
            await hotReloadArticle(newMd);
          },
        });
      });
      node.parentNode.replaceChild(btn, node);
    });
  }

  // ─── Click tracking ────────────────────────────────────────────────────────
  function setupClickTracking() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('p, li, h2, h3, h4, blockquote, td');
      if (!el) return;
      if (lastClickedTarget) lastClickedTarget.classList.remove('img-target-highlight');
      lastClickedTarget = el;
      el.classList.add('img-target-highlight');
    }, true);
  }

  // ─── Hot reload ────────────────────────────────────────────────────────────
  async function hotReloadArticle(contentMd) {
    try {
      const res = await fetch(API.renderMd(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_md: contentMd }),
      });
      if (!res.ok) throw new Error(`render-md ${res.status}`);
      const { html } = await res.json();
      const current = document.querySelector('.blog-content');
      if (current && html) {
        current.innerHTML = html;
        renderImagePlaceholders();
      }
    } catch (err) {
      console.warn('[blog-image-editor] hotReloadArticle falhou:', err.message);
    }
  }

  // ─── MD Editor ─────────────────────────────────────────────────────────────
  async function openMdEditor() {
    document.getElementById('md-editor-modal')?.remove();
    let content = '';
    try { content = await fetchContentMd(); }
    catch (err) { showToast(`Erro ao carregar: ${err.message}`, 'error'); return; }

    const overlay = document.createElement('div');
    overlay.id = 'md-editor-modal';
    overlay.innerHTML = `
      <div class="md-modal-inner">
        <div class="md-header">
          <span>✏️ Editar content_md — ${escHtml(SLUG)}</span>
          <div class="md-header-actions">
            <button class="md-header-btn" id="md-btn-reload">↺ Recarregar</button>
            <button class="md-header-btn" id="md-btn-close">✕ Fechar</button>
          </div>
        </div>
        <textarea id="md-editor-textarea" spellcheck="false"></textarea>
        <div class="md-footer">
          <span id="md-counter">0 linhas · 0 chars</span>
          <div class="md-footer-actions">
            <button class="btn-cancel" id="md-btn-cancel">Cancelar</button>
            <button class="btn-md-save" id="md-btn-save">💾 Salvar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const textarea = overlay.querySelector('#md-editor-textarea');
    const counter  = overlay.querySelector('#md-counter');
    const saveBtn  = overlay.querySelector('#md-btn-save');

    textarea.value = content;
    updateCounter();

    function updateCounter() {
      counter.textContent = `${textarea.value.split('\n').length} linhas · ${textarea.value.length} chars`;
    }
    textarea.addEventListener('input', updateCounter);

    const close = () => overlay.remove();
    overlay.querySelector('#md-btn-close').addEventListener('click', close);
    overlay.querySelector('#md-btn-cancel').addEventListener('click', close);

    overlay.querySelector('#md-btn-reload').addEventListener('click', async () => {
      try {
        textarea.value = await fetchContentMd();
        updateCounter();
        showToast('Recarregado do DB ✓', 'success');
      } catch (err) { showToast(`Erro: ${err.message}`, 'error'); }
    });

    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Salvando…';
      try {
        await saveContentMd(textarea.value);
        close();
        showToast('content_md salvo ✓', 'success');
        await hotReloadArticle(textarea.value);
      } catch (err) {
        showToast(`Erro ao salvar: ${err.message}`, 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Salvar';
      }
    });
  }

  // ─── Helpers: MD manipulation ───────────────────────────────────────────────
  function buildImgTag(url, altText, layout, caption) {
    const u = escHtml(url), a = escHtml(altText), c = escHtml(caption || '');
    switch (layout) {
      case 'figure':
        return `<figure class="blog-figure">\n  <img src="${u}" alt="${a}" />\n  ${c ? `<figcaption>${c}</figcaption>` : ''}\n</figure>`;
      case 'float-left':
        return `<div class="blog-float-left">\n  <img src="${u}" alt="${a}" />\n</div>`;
      case 'float-right':
        return `<div class="blog-float-right">\n  <img src="${u}" alt="${a}" />\n</div>`;
      case 'hero':
        return `<div class="blog-hero-img">\n  <img src="${u}" alt="${a}" />\n  ${c ? `<span class="blog-hero-caption">${c}</span>` : ''}\n</div>`;
      case 'grid2':
        return `<div class="blog-img-grid2">\n  <img src="${u}" alt="${a}" />\n  <img src="${u}" alt="${a} (2)" />\n</div>`;
      default:
        return `![${altText}](${url})`;
    }
  }

  function findInsertionLine(contentMd, targetEl, mode, placeholderText) {
    const lines = contentMd.split('\n');

    if (mode === 'placeholder' && placeholderText) {
      const needle = `<!--[[INSERIR IMAGEM: ${placeholderText}]]-->`;
      const idx = lines.findIndex((l) => l.includes(needle));
      if (idx >= 0) return { lineIndex: idx, isPlaceholder: true };
      const idx2 = lines.findIndex((l) => l.includes(placeholderText.substring(0, 40)));
      if (idx2 >= 0) return { lineIndex: idx2, isPlaceholder: true };
    }

    if (targetEl) {
      const anchor30 = (targetEl.textContent || '')
        .trim().replace(/\s+/g, ' ').replace(/[\[\]\*_`#]/g, '').substring(0, 30);
      if (anchor30) {
        let bestIdx = -1, bestScore = 0;
        lines.forEach((line, i) => {
          if (line.replace(/[\[\]\*_`#]/g, '').trim().includes(anchor30)) {
            if (anchor30.length > bestScore) { bestScore = anchor30.length; bestIdx = i; }
          }
        });
        if (bestIdx >= 0) return { lineIndex: bestIdx, isPlaceholder: false };
      }
    }

    const sourcesIdx = lines.findIndex((l) => l.includes('sources-section'));
    if (sourcesIdx > 0) return { lineIndex: sourcesIdx - 1, isPlaceholder: false };
    return { lineIndex: lines.length - 1, isPlaceholder: false };
  }

  function insertImageInMd(contentMd, lineIndex, imgTag, isPlaceholder) {
    const lines = contentMd.split('\n');
    if (isPlaceholder) { lines[lineIndex] = imgTag; }
    else { lines.splice(lineIndex + 1, 0, '', imgTag, ''); }
    return lines.join('\n');
  }

  // ─── API calls ─────────────────────────────────────────────────────────────
  async function fetchContentMd() {
    const res  = await fetch(API.contentMd());
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status} ao buscar content_md`);
    return data.content_md ?? '';
  }

  async function saveContentMd(contentMd) {
    const res  = await fetch(API.saveMd(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: SLUG, siteId: SITE_ID, content_md: contentMd }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status} ao salvar content_md`);
    return data;
  }

  async function uploadImageToService(file, transforms) {
    const form = new FormData();
    form.append('file', file);
    form.append('siteId', SITE_ID);
    form.append('slug', SLUG);
    form.append('businessId', BUSINESS_ID);
    if (transforms) {
      Object.entries(transforms).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== false) form.append(k, v);
      });
    }
    const res  = await fetch(API.upload(), { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Upload falhou: ${res.status}`);
    return data; // { url, width, height }
  }

  async function uploadImageToDjango(localImageUrl) {
    const fileRes = await fetch(API.files(localImageUrl));
    if (!fileRes.ok) throw new Error(`Não encontrou imagem local: ${localImageUrl}`);
    const blob     = await fileRes.blob();
    const filename = localImageUrl.split('/').pop();
    const form     = new FormData();
    form.append('image', blob, filename);
    const res  = await fetch(API.uploadImage(), { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status} ao salvar no Django`);
    console.log('[blog-image-editor] Django image saved:', data.image_url);
    return data;
  }

  async function saveArticleImageToDB(data) {
    const res  = await fetch(API.articleImage(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: BUSINESS_ID, slug: SLUG, ...data }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `Erro ${res.status} ao salvar imagem do artigo`);
    return json;
  }

  // ─── Misc helpers ──────────────────────────────────────────────────────────
  function showFilePreview(file, wrap) {
    const reader = new FileReader();
    reader.onload = (e) => { wrap.innerHTML = `<img src="${e.target.result}" alt="preview" />`; };
    reader.readAsDataURL(file);
  }

  function escHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function showToast(message, type) {
    document.querySelector('.img-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = `img-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // ─── Styles ────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('blog-image-editor-styles')) return;
    const style = document.createElement('style');
    style.id = 'blog-image-editor-styles';
    style.textContent = `
      /* ── Placeholders ── */
      .img-placeholder-btn {
        display: inline-flex; align-items: center; gap: 6px;
        margin: 8px 0; padding: 8px 14px;
        background: #fff3e0; border: 2px dashed #ff8f00;
        border-radius: 8px; color: #e65100;
        font-size: 14px; font-family: sans-serif;
        cursor: pointer; transition: background .15s;
      }
      .img-placeholder-btn:hover { background: #ffe0b2; }

      /* ── Click highlight ── */
      .img-target-highlight {
        outline: 2px dashed #1976d2 !important;
        outline-offset: 2px;
        background: rgba(25,118,210,.04) !important;
      }

      /* ── FABs ── */
      #editor-fab-container {
        position: fixed; bottom: 20px; left: 16px; z-index: 8900;
        display: flex; flex-direction: column; gap: 8px; align-items: flex-start;
      }
      .editor-fab {
        padding: 9px 16px; border: none; border-radius: 8px; color: #fff;
        font-size: 13px; font-family: system-ui, sans-serif;
        cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,.3);
        transition: opacity .15s; white-space: nowrap;
      }
      .editor-fab:hover { opacity: .87; }
      #img-insert-fab  { background: #1565c0; }
      #hero-image-fab  { background: #6a1b9a; }
      #md-editor-fab   { background: #263238; }

      /* ── Toast ── */
      .img-toast {
        position: fixed; bottom: 24px; right: 24px; z-index: 9999;
        padding: 12px 20px; border-radius: 8px;
        font-size: 14px; font-family: system-ui, sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,.2);
        animation: toastIn .2s ease;
      }
      .img-toast.success { background: #2e7d32; color: #fff; }
      .img-toast.error   { background: #c62828; color: #fff; }
      @keyframes toastIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

      /* ── Image picker modal ── */
      #img-picker-modal {
        position: fixed; inset: 0; z-index: 9000;
        background: rgba(0,0,0,.55);
        display: flex; align-items: center; justify-content: center;
      }
      #img-picker-modal .modal-box {
        background: #fff; border-radius: 12px;
        width: min(540px, 95vw); max-height: 90vh;
        overflow-y: auto; padding: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,.3);
        font-family: system-ui, sans-serif;
      }
      #img-picker-modal h2 { margin: 0 0 16px; font-size: 18px; }

      /* Tabs */
      #img-picker-modal .tabs { display: flex; gap: 8px; margin-bottom: 16px; }
      #img-picker-modal .tab {
        padding: 6px 16px; border-radius: 6px; border: 1px solid #ddd;
        background: #f5f5f5; cursor: pointer; font-size: 13px;
      }
      #img-picker-modal .tab.active { background: #1976d2; color: #fff; border-color: #1976d2; }
      #img-picker-modal .tab-panel { display: none; }
      #img-picker-modal .tab-panel.active { display: block; }

      /* Preview */
      #img-picker-modal .preview-wrap {
        background: #f5f5f5; border-radius: 8px;
        min-height: 120px; display: flex; align-items: center;
        justify-content: center; margin-bottom: 12px; overflow: hidden;
      }
      #img-picker-modal .preview-wrap img { max-width: 100%; max-height: 240px; }
      #img-picker-modal .preview-hint { color: #999; font-size: 13px; }

      /* Inputs */
      #img-picker-modal label { display: block; font-size: 13px; color: #555; margin-bottom: 4px; }
      #img-picker-modal input[type=text],
      #img-picker-modal input[type=url] {
        width: 100%; box-sizing: border-box;
        padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px;
        font-size: 14px; margin-bottom: 12px;
      }
      #img-picker-modal input[type=file] { display: none; }
      #img-picker-modal .custom-file-label {
        display: inline-block; padding: 8px 18px;
        background: #1976d2; color: #fff; border-radius: 6px;
        cursor: pointer; font-size: 14px; margin-bottom: 12px;
        border: none; transition: background .15s;
      }
      #img-picker-modal .custom-file-label:hover { background: #1565c0; }
      #img-picker-modal .file-chosen-name {
        display: inline-block; margin-left: 10px; font-size: 13px; color: #555;
        max-width: 220px; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;
      }

      /* Buttons */
      #img-picker-modal .modal-actions,
      #img-picker-modal .step2-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
      #img-picker-modal .step2-actions { justify-content: space-between; align-items: center; }
      #img-picker-modal .btn-cancel {
        padding: 8px 18px; border: 1px solid #ccc; border-radius: 6px;
        background: #fff; cursor: pointer; font-size: 14px;
      }
      #img-picker-modal .btn-secondary {
        padding: 8px 18px; border: 1px solid #ccc; border-radius: 6px;
        background: #fff; cursor: pointer; font-size: 14px;
      }
      #img-picker-modal .btn-primary {
        padding: 8px 18px; border: none; border-radius: 6px;
        background: #1976d2; color: #fff; cursor: pointer;
        font-size: 14px; font-weight: 600;
      }
      #img-picker-modal .btn-primary:disabled { opacity: .5; cursor: default; }

      /* Image banks */
      #img-picker-modal details#img-banks-panel {
        margin-bottom: 12px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;
      }
      #img-picker-modal details#img-banks-panel summary {
        padding: 8px 12px; cursor: pointer; font-size: 13px; color: #555;
        background: #f9f9f9; display: flex; align-items: center; gap: 6px;
        user-select: none; list-style: none;
      }
      #img-picker-modal details#img-banks-panel summary::-webkit-details-marker,
      #img-picker-modal details#img-banks-panel summary::marker { display: none; }
      #img-picker-modal details#img-banks-panel summary:hover { background: #f0f0f0; }
      #img-picker-modal details#img-banks-panel[open] summary .img-bank-chevron { transform: rotate(180deg); }
      #img-picker-modal .img-bank-chevron { transition: transform .15s; margin-left: auto; font-size: 11px; color: #aaa; }
      #img-picker-modal .img-banks-body { padding: 10px 12px; }
      #img-picker-modal .img-bank-cat {
        font-size: 10px; color: #999; font-weight: 700;
        text-transform: uppercase; letter-spacing: .6px; margin-bottom: 5px;
      }
      #img-picker-modal .img-bank-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
      #img-picker-modal .img-bank-link {
        padding: 4px 9px; border-radius: 5px; border: 1px solid #ddd;
        background: #fff; font-size: 12px; color: #1565c0;
        text-decoration: none; white-space: nowrap; display: inline-block;
      }
      #img-picker-modal .img-bank-link:hover { background: #e3f2fd; border-color: #90caf9; }
      #img-picker-modal .img-bank-link.vec { color: #6a1b9a; }
      #img-picker-modal .img-bank-link.vec:hover { background: #f3e5f5; border-color: #ce93d8; }

      /* Step transitions */
      #img-picker-modal .step2 { display: none; }
      #img-picker-modal .step2.active { display: block; }
      #img-picker-modal .step1.hidden { display: none; }

      /* Adjust preview */
      #img-picker-modal .adjust-preview {
        background: #f5f5f5; border-radius: 8px; min-height: 100px;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden; margin-bottom: 12px; position: relative;
      }
      #img-picker-modal .adjust-preview img { max-width: 100%; max-height: 200px; }
      #img-picker-modal .preview-loading {
        position: absolute; inset: 0; background: rgba(255,255,255,.7);
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; color: #555;
      }

      /* Crop */
      #img-picker-modal .crop-section { margin-bottom: 10px; }
      #img-picker-modal .crop-wrap {
        position: relative; display: inline-block; cursor: crosshair; user-select: none;
      }
      #img-picker-modal .crop-wrap img { display: block; max-width: 100%; max-height: 220px; }
      #img-picker-modal .crop-rect {
        position: absolute; border: 2px solid #1976d2;
        background: rgba(25,118,210,.12); pointer-events: none;
      }
      #img-picker-modal .crop-coords { font-size: 11px; color: #888; margin-top: 4px; }

      /* Resize */
      #img-picker-modal .size-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
      #img-picker-modal .size-label { font-size: 12px; color: #555; }
      #img-picker-modal .size-sep { color: #999; }
      #img-picker-modal .orig-dims { font-size: 11px; color: #aaa; }
      #img-picker-modal .size-row input[type=number] {
        width: 70px; padding: 5px 7px; border: 1px solid #ccc;
        border-radius: 6px; font-size: 13px;
      }
      #img-picker-modal .lock-btn {
        padding: 4px 8px; border: 1px solid #ccc; border-radius: 6px;
        background: #f5f5f5; cursor: pointer; font-size: 14px;
      }
      #img-picker-modal .lock-btn.locked { background: #e3f2fd; border-color: #1976d2; }

      /* Sliders */
      #img-picker-modal .adjust-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; margin-bottom: 14px;
      }
      #img-picker-modal .adjust-row { display: flex; flex-direction: column; gap: 3px; }
      #img-picker-modal .adjust-row label { font-size: 12px; color: #555; }
      #img-picker-modal .adjust-row input[type=range] { width: 100%; accent-color: #1976d2; }
      #img-picker-modal .range-val { font-size: 11px; color: #888; }

      /* Toggles */
      #img-picker-modal .toggle-row { display: flex; gap: 12px; margin-bottom: 10px; }
      #img-picker-modal .toggle-label {
        display: flex; align-items: center; gap: 5px; font-size: 13px; cursor: pointer;
      }

      /* Layout picker */
      #img-picker-modal .layout-section { margin-bottom: 14px; }
      #img-picker-modal .section-label { font-size: 12px; color: #555; margin-bottom: 6px; }
      #img-picker-modal .layout-grid { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
      #img-picker-modal .layout-opt {
        border: 2px solid #ddd; border-radius: 8px; padding: 6px 10px;
        cursor: pointer; font-size: 12px; background: #fafafa;
        display: flex; flex-direction: column; align-items: center; gap: 3px;
        min-width: 60px; transition: border-color .15s;
      }
      #img-picker-modal .layout-opt:hover { border-color: #90caf9; }
      #img-picker-modal .layout-opt.selected { border-color: #1976d2; background: #e3f2fd; }
      #img-picker-modal .layout-icon { font-size: 20px; }

      /* ── MD Editor modal ── */
      #md-editor-modal {
        position: fixed; inset: 0; z-index: 11001;
        background: rgba(0,0,0,.6);
        display: flex; flex-direction: column;
        font-family: system-ui, sans-serif;
      }
      #md-editor-modal .md-modal-inner {
        background: #fff; flex: 1; display: flex; flex-direction: column;
        margin: 20px; border-radius: 12px; overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,.3);
      }
      #md-editor-modal .md-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 20px; background: #263238; color: #fff;
        font-size: 15px; font-weight: 600;
      }
      #md-editor-modal .md-header-actions { display: flex; gap: 8px; }
      #md-editor-modal .md-header-btn {
        padding: 5px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,.3);
        background: transparent; color: #fff; cursor: pointer; font-size: 13px;
      }
      #md-editor-modal .md-header-btn:hover { background: rgba(255,255,255,.1); }
      #md-editor-modal #md-editor-textarea {
        flex: 1; width: 100%; box-sizing: border-box;
        padding: 16px; font-family: 'Menlo','Monaco','Consolas',monospace;
        font-size: 13px; line-height: 1.6; resize: none;
        border: none; outline: none; background: #fafafa;
      }
      #md-editor-modal .md-footer {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 20px; background: #f5f5f5; border-top: 1px solid #e0e0e0;
        font-size: 12px; color: #777;
      }
      #md-editor-modal .md-footer-actions { display: flex; gap: 8px; }
      #md-editor-modal .btn-cancel {
        padding: 8px 16px; border: 1px solid #ccc; border-radius: 6px;
        background: #fff; cursor: pointer; font-size: 13px;
      }
      #md-editor-modal .btn-md-save {
        padding: 8px 18px; border: none; border-radius: 6px;
        background: #2e7d32; color: #fff; cursor: pointer;
        font-size: 13px; font-weight: 600;
      }
      #md-editor-modal .btn-md-save:disabled { opacity: .5; cursor: default; }
    `;
    document.head.appendChild(style);
  }

  // ─── Boot ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();