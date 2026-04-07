/**
 * blog-image-editor.js
 * Ferramenta de inserção/edição de imagens em artigos — somente dev local.
 * Injetado condicionalmente pelo [...slug].astro quando import.meta.env.DEV === true.
 *
 * Configuração injetada pelo Astro template em window.__BLOG_EDITOR_CONFIG__:
 *   { slug, siteId, businessId, proxyBase }
 */

(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  const cfg = window.__BLOG_EDITOR_CONFIG__ || {};
  const SLUG = cfg.slug || '';
  const SITE_ID = cfg.siteId || 'unknown';
  const BUSINESS_ID = cfg.businessId || '';
  const PROXY = cfg.proxyBase || '';

  // API paths (relative → Vite proxy)
  const CONTENT_MD_URL = () =>
    `${PROXY}/image-editor/api/articles/${BUSINESS_ID}/${SLUG}/content-md/`;
  const SAVE_MD_URL = () =>
    `${PROXY}/image-editor/api/articles/${BUSINESS_ID}/${SLUG}/save-content-md/`;
  const UPLOAD_IMAGE_URL = () =>
    `${PROXY}/image-editor/api/articles/${BUSINESS_ID}/${SLUG}/upload-image/`;
  const UPLOAD_URL = () => `${PROXY}/image-upload/upload`;
  const ARTICLE_IMAGE_URL = () => `${PROXY}/article-image`;

  // State
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
    setupInsertImageButton();
    setupHeroImageButton();
    setupMdEditorButton();
  }

  // ─── Styles ────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('blog-image-editor-styles')) return;
    const style = document.createElement('style');
    style.id = 'blog-image-editor-styles';
    style.textContent = `
      .img-placeholder-btn {
        display: inline-flex; align-items: center; gap: 6px;
        margin: 8px 0; padding: 8px 14px;
        background: #fff3e0; border: 2px dashed #ff8f00;
        border-radius: 8px; color: #e65100;
        font-size: 14px; font-family: sans-serif;
        cursor: pointer; transition: background .15s;
      }
      .img-placeholder-btn:hover { background: #ffe0b2; }

      .img-target-highlight {
        outline: 2px dashed #1976d2 !important;
        outline-offset: 2px;
        background: rgba(25,118,210,.04) !important;
      }

      #img-insert-modal {
        position: fixed; inset: 0; z-index: 9000;
        background: rgba(0,0,0,.55);
        display: flex; align-items: center; justify-content: center;
      }
      #img-insert-modal .modal-box {
        background: #fff; border-radius: 12px;
        width: min(540px, 95vw); max-height: 90vh;
        overflow-y: auto; padding: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,.3);
        font-family: system-ui, sans-serif;
      }
      #img-insert-modal h2 { margin: 0 0 16px; font-size: 18px; }
      #img-insert-modal .tabs { display: flex; gap: 8px; margin-bottom: 16px; }
      #img-insert-modal .tab {
        padding: 6px 16px; border-radius: 6px; border: 1px solid #ddd;
        background: #f5f5f5; cursor: pointer; font-size: 13px;
      }
      #img-insert-modal .tab.active {
        background: #1976d2; color: #fff; border-color: #1976d2;
      }
      #img-insert-modal .tab-panel { display: none; }
      #img-insert-modal .tab-panel.active { display: block; }
      #img-insert-modal .preview-wrap {
        background: #f5f5f5; border-radius: 8px;
        min-height: 120px; display: flex; align-items: center;
        justify-content: center; margin-bottom: 12px; overflow: hidden;
      }
      #img-insert-modal .preview-wrap img { max-width: 100%; max-height: 240px; }
      #img-insert-modal label { display: block; font-size: 13px; color: #555; margin-bottom: 4px; }
      #img-insert-modal input[type=text], #img-insert-modal input[type=url] {
        width: 100%; box-sizing: border-box;
        padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px;
        font-size: 14px; margin-bottom: 12px;
      }
      #img-insert-modal input[type=file] {
        margin-bottom: 12px;
        font-size: 13px;
        display: none;
      }
      #img-insert-modal .custom-file-label {
        display: inline-block;
        padding: 8px 18px;
        background: #1976d2;
        color: #fff;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-family: inherit;
        margin-bottom: 12px;
        border: none;
        transition: background .15s;
      }
      #img-insert-modal .custom-file-label:hover {
        background: #1565c0;
      }
      #img-insert-modal .file-chosen-name {
        display: inline-block;
        margin-left: 10px;
        font-size: 13px;
        color: #555;
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
      }
      #img-insert-modal .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
      #img-insert-modal .btn-cancel {
        padding: 8px 18px; border: 1px solid #ccc; border-radius: 6px;
        background: #fff; cursor: pointer; font-size: 14px;
      }
      #img-insert-modal .btn-insert {
        padding: 8px 18px; border: none; border-radius: 6px;
        background: #1976d2; color: #fff; cursor: pointer;
        font-size: 14px; font-weight: 600;
      }
      #img-insert-modal .btn-insert:disabled { opacity: .5; cursor: default; }

      #img-insert-modal details#img-banks-panel { margin-bottom: 12px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
      #img-insert-modal details#img-banks-panel summary {
        padding: 8px 12px; cursor: pointer; font-size: 13px; color: #555;
        background: #f9f9f9; display: flex; align-items: center; gap: 6px;
        user-select: none; list-style: none;
      }
      #img-insert-modal details#img-banks-panel summary::-webkit-details-marker { display: none; }
      #img-insert-modal details#img-banks-panel summary::marker { display: none; }
      #img-insert-modal details#img-banks-panel summary:hover { background: #f0f0f0; }
      #img-insert-modal details#img-banks-panel[open] summary .img-bank-chevron { transform: rotate(180deg); }
      #img-insert-modal .img-bank-chevron { transition: transform .15s; display: inline-block; font-style: normal; }
      #img-insert-modal .img-banks-body { padding: 10px 12px; }
      #img-insert-modal .img-bank-cat {
        font-size: 10px; color: #999; font-weight: 700;
        text-transform: uppercase; letter-spacing: .6px; margin-bottom: 5px;
      }
      #img-insert-modal .img-bank-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
      #img-insert-modal .img-bank-chips:last-child { margin-bottom: 0; }
      #img-insert-modal .img-bank-link {
        padding: 4px 9px; border-radius: 5px; border: 1px solid #ddd;
        background: #fff; font-size: 12px; color: #1565c0;
        text-decoration: none; white-space: nowrap; display: inline-block;
      }
      #img-insert-modal .img-bank-link:hover { background: #e3f2fd; border-color: #90caf9; }
      #img-insert-modal .img-bank-link.vec { color: #6a1b9a; }
      #img-insert-modal .img-bank-link.vec:hover { background: #f3e5f5; border-color: #ce93d8; }

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

      /* ── Step 2: adjust panel ── */
      #img-insert-modal .step2 { display: none; }
      #img-insert-modal .step2.active { display: block; }
      #img-insert-modal .step1.hidden { display: none; }

      #img-insert-modal .adjust-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px;
        margin-bottom: 14px;
      }
      #img-insert-modal .adjust-row { display: flex; flex-direction: column; gap: 3px; }
      #img-insert-modal .adjust-row label { font-size: 12px; color: #555; }
      #img-insert-modal .adjust-row input[type=range] { width: 100%; accent-color: #1976d2; }
      #img-insert-modal .adjust-row .range-val {
        font-size: 11px; color: #888; text-align: right;
      }
      #img-insert-modal .size-row {
        display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
      }
      #img-insert-modal .size-row input[type=number] {
        width: 70px; padding: 5px 7px; border: 1px solid #ccc;
        border-radius: 6px; font-size: 13px;
      }
      #img-insert-modal .lock-btn {
        padding: 4px 8px; border: 1px solid #ccc; border-radius: 6px;
        background: #f5f5f5; cursor: pointer; font-size: 14px;
      }
      #img-insert-modal .lock-btn.locked { background: #e3f2fd; border-color: #1976d2; }

      #img-insert-modal .layout-grid {
        display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;
      }
      #img-insert-modal .layout-opt {
        border: 2px solid #ddd; border-radius: 8px; padding: 6px 10px;
        cursor: pointer; font-size: 12px; background: #fafafa;
        display: flex; flex-direction: column; align-items: center; gap: 3px;
        min-width: 60px; transition: border-color .15s;
      }
      #img-insert-modal .layout-opt:hover { border-color: #90caf9; }
      #img-insert-modal .layout-opt.selected { border-color: #1976d2; background: #e3f2fd; }
      #img-insert-modal .layout-opt .layout-icon { font-size: 20px; }

      #img-insert-modal .adjust-preview {
        background: #f5f5f5; border-radius: 8px; min-height: 100px;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden; margin-bottom: 12px; position: relative;
      }
      #img-insert-modal .adjust-preview img { max-width: 100%; max-height: 200px; }
      #img-insert-modal .adjust-preview .preview-loading {
        position: absolute; inset: 0; background: rgba(255,255,255,.7);
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; color: #555;
      }
      #img-insert-modal .toggle-row {
        display: flex; gap: 12px; margin-bottom: 10px;
      }
      #img-insert-modal .toggle-row label {
        display: flex; align-items: center; gap: 5px; font-size: 13px; cursor: pointer;
      }
      #img-insert-modal .step2-actions {
        display: flex; justify-content: space-between; align-items: center; margin-top: 8px;
      }

      /* ── crop overlay ── */
      #img-insert-modal .crop-wrap {
        position: relative; display: inline-block;
        cursor: crosshair; user-select: none;
      }
      #img-insert-modal .crop-wrap img { display: block; max-width: 100%; max-height: 220px; }
      #img-insert-modal .crop-rect {
        position: absolute; border: 2px solid #1976d2;
        background: rgba(25,118,210,.12); pointer-events: none;
      }

      #hero-image-fab:hover { background: #7b1fa2; }

      #md-editor-fab:hover { background: #37474f; }

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
      #md-editor-modal .btn-md-cancel {
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

  // ─── Placeholder rendering ─────────────────────────────────────────────────
  function renderImagePlaceholders() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
    const toReplace = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue || '';
      const match = text.match(/^\[\[INSERIR IMAGEM:\s*(.*?)\]\]$/);
      if (match) {
        toReplace.push({ node, description: match[1].trim() });
      }
    }
    toReplace.forEach(({ node, description }) => {
      const btn = document.createElement('button');
      btn.className = 'img-placeholder-btn';
      btn.dataset.placeholderText = description;
      btn.dataset.mode = 'placeholder';
      btn.textContent = `📷 ${description}`;
      btn.addEventListener('click', () => {
        openModal({ mode: 'placeholder', altText: description, placeholderText: description });
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

  // ─── Paste handler ─────────────────────────────────────────────────────────
  function setupPasteHandler() {
    document.addEventListener('paste', (e) => {
      // Ignore paste inside inputs/textareas (e.g. the MD editor)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      let imageFile = null;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          imageFile = item.getAsFile();
          break;
        }
      }
      if (!imageFile) return;
      e.preventDefault();
      openModal({ mode: 'clipboard', file: imageFile, altText: SLUG });
    });
  }

  // ─── Modal ─────────────────────────────────────────────────────────────────
  function openModal(opts) {
    closeModal();
    const overlay = document.createElement('div');
    overlay.id = 'img-insert-modal';

    const isHeroImageMode = opts.mode === 'hero-image';
    const isPlaceholder = opts.mode === 'placeholder';
    const initialTab = opts.mode === 'url' ? 'url'
      : (opts.mode === 'upload' || opts.mode === 'free') ? 'upload'
      : 'clipboard';

    overlay.innerHTML = `
      <div class="modal-box">
        <h2>${isHeroImageMode ? '📷 Imagem principal' : '📷 Inserir imagem'}</h2>

        <!-- ── STEP 1: choose source ── -->
        <div class="step1" id="modal-step1">
          <div class="tabs">
            <button class="tab ${initialTab === 'clipboard' ? 'active' : ''}" data-tab="clipboard">Clipboard</button>
            <button class="tab ${initialTab === 'upload'    ? 'active' : ''}" data-tab="upload">Upload</button>
            <button class="tab ${initialTab === 'url'       ? 'active' : ''}" data-tab="url">URL externa</button>
          </div>

          <div class="tab-panel ${initialTab === 'clipboard' ? 'active' : ''}" data-panel="clipboard">
            <div class="preview-wrap" id="modal-preview-clipboard">
              <span style="color:#999;font-size:13px">Sem imagem no clipboard</span>
            </div>
          </div>
          <div class="tab-panel ${initialTab === 'upload' ? 'active' : ''}" data-panel="upload">
            <label class="custom-file-label" for="modal-file-input">Escolher arquivo</label>
            <input type="file" id="modal-file-input" accept="image/*" />
            <span class="file-chosen-name" id="file-chosen-name">Nenhum arquivo</span>
            <input type="text" id="custom-filename-input" placeholder="Nome do arquivo (opcional)" style="margin-left:10px;max-width:180px;font-size:13px;padding:5px 8px;border:1px solid #ccc;border-radius:5px;vertical-align:middle;display:inline-block" />
            <div class="preview-wrap" id="modal-preview-upload">
              <span style="color:#999;font-size:13px">Selecione um arquivo</span>
            </div>
          </div>
          <div class="tab-panel ${initialTab === 'url' ? 'active' : ''}" data-panel="url">
            <label>URL da imagem</label>
            <input type="url" id="modal-url-input" placeholder="https://exemplo.com/imagem.jpg" />
            <div class="preview-wrap" id="modal-preview-url">
              <span style="color:#999;font-size:13px">Cole uma URL acima</span>
            </div>
          </div>

          <details id="img-banks-panel">
            <summary>
              🔗 Bancos de imagens gratuitos
              <span class="img-bank-chevron" style="margin-left:auto;font-size:11px;color:#aaa">▾</span>
            </summary>
            <div class="img-banks-body">
              <div class="img-bank-cat">Fotos</div>
              <div class="img-bank-chips">
                <a href="https://pixabay.com/" target="_blank" rel="noopener" class="img-bank-link">Pixabay</a>
                <a href="https://www.pexels.com/" target="_blank" rel="noopener" class="img-bank-link">Pexels</a>
                <a href="https://unsplash.com/" target="_blank" rel="noopener" class="img-bank-link">Unsplash</a>
                <a href="https://www.freepik.com/" target="_blank" rel="noopener" class="img-bank-link">Freepik</a>
                <a href="https://stocksnap.io/" target="_blank" rel="noopener" class="img-bank-link">StockSnap</a>
                <a href="https://burst.shopify.com/" target="_blank" rel="noopener" class="img-bank-link">Burst</a>
                <a href="https://www.lifeofpix.com/" target="_blank" rel="noopener" class="img-bank-link">Life of Pix</a>
                <a href="https://gratisography.com/" target="_blank" rel="noopener" class="img-bank-link">Gratisography</a>
                <a href="https://www.foodiesfeed.com/" target="_blank" rel="noopener" class="img-bank-link">Foodiesfeed</a>
              </div>
              <div class="img-bank-cat">Vetores / Ícones</div>
              <div class="img-bank-chips">
                <a href="https://www.vecteezy.com/" target="_blank" rel="noopener" class="img-bank-link vec">Vecteezy</a>
                <a href="https://www.flaticon.com/" target="_blank" rel="noopener" class="img-bank-link vec">Flaticon</a>
                <a href="https://undraw.co/" target="_blank" rel="noopener" class="img-bank-link vec">unDraw</a>
                <a href="https://www.svgrepo.com/" target="_blank" rel="noopener" class="img-bank-link vec">SVG Repo</a>
                <a href="https://www.rawpixel.com/" target="_blank" rel="noopener" class="img-bank-link vec">Rawpixel</a>
              </div>
            </div>
          </details>

          <label>Alt text</label>
          <input type="text" id="modal-alt-input" value="${escHtml(opts.altText || '')}" placeholder="Descrição da imagem" />

          <div class="modal-actions">
            <button class="btn-cancel" id="modal-btn-cancel">Cancelar</button>
            <button class="btn-insert" id="modal-btn-next" disabled>Ajustar →</button>
          </div>
        </div>

        <!-- ── STEP 2: adjust ── -->
        <div class="step2" id="modal-step2">
          <div class="adjust-preview" id="adjust-preview-wrap">
            <span style="color:#999;font-size:13px">Preview</span>
          </div>

          <!-- Crop -->
          <div style="margin-bottom:10px">
            <label style="font-size:12px;color:#555;display:flex;align-items:center;gap:6px">
              <input type="checkbox" id="crop-enable" /> Recortar (arraste na imagem abaixo)
            </label>
            <div id="crop-container" style="display:none;margin-top:6px">
              <div class="crop-wrap" id="crop-wrap">
                <img id="crop-img" src="" alt="crop preview" />
                <div class="crop-rect" id="crop-rect" style="display:none"></div>
              </div>
              <div style="font-size:11px;color:#888;margin-top:4px" id="crop-coords">Arraste para selecionar área</div>
            </div>
          </div>

          <!-- Resize -->
          <div class="size-row">
            <span style="font-size:12px;color:#555">Tamanho:</span>
            <input type="number" id="adj-w" placeholder="W" min="1" max="3000" />
            <span style="color:#999">×</span>
            <input type="number" id="adj-h" placeholder="H" min="1" max="3000" />
            <button class="lock-btn locked" id="lock-ratio" title="Bloquear proporção">🔒</button>
            <span style="font-size:11px;color:#aaa" id="orig-dims"></span>
          </div>

          <!-- Sliders -->
          <div class="adjust-grid">
            <div class="adjust-row">
              <label>Brilho <span class="range-val" id="val-brightness">0</span></label>
              <input type="range" id="adj-brightness" min="-100" max="100" value="0" />
            </div>
            <div class="adjust-row">
              <label>Contraste <span class="range-val" id="val-contrast">0</span></label>
              <input type="range" id="adj-contrast" min="-100" max="100" value="0" />
            </div>
            <div class="adjust-row">
              <label>Saturação <span class="range-val" id="val-saturation">0</span></label>
              <input type="range" id="adj-saturation" min="-100" max="100" value="0" />
            </div>
            <div class="adjust-row">
              <label>Qualidade WebP <span class="range-val" id="val-quality">82</span></label>
              <input type="range" id="adj-quality" min="30" max="100" value="82" />
            </div>
          </div>
          <div class="toggle-row">
            <label><input type="checkbox" id="adj-sharpen" /> Nitidez</label>
            <label><input type="checkbox" id="adj-grayscale" /> Escala de cinza</label>
          </div>

          <!-- Layout -->
          <div style="${isHeroImageMode ? 'display:none' : ''}">
            <div style="font-size:12px;color:#555;margin-bottom:6px">Layout:</div>
            <div class="layout-grid">
              <div class="layout-opt ${!isHeroImageMode ? 'selected' : ''}" data-layout="alone">
                <span class="layout-icon">🖼️</span><span>Sozinha</span>
              </div>
              <div class="layout-opt" data-layout="figure">
                <span class="layout-icon">📝</span><span>Legenda</span>
              </div>
              <div class="layout-opt" data-layout="float-left">
                <span class="layout-icon">⬅️🖼️</span><span>Float esq.</span>
              </div>
              <div class="layout-opt" data-layout="float-right">
                <span class="layout-icon">🖼️➡️</span><span>Float dir.</span>
              </div>
              <div class="layout-opt ${isHeroImageMode ? 'selected' : ''}" data-layout="hero">
                <span class="layout-icon">🌅</span><span>Hero</span>
              </div>
              <div class="layout-opt" data-layout="grid2">
                <span class="layout-icon">⬜⬜</span><span>Grid 2</span>
              </div>
            </div>
          </div>
          <div id="caption-row" style="display:none;margin-bottom:10px">
            <label style="font-size:12px;color:#555">Legenda</label>
            <input type="text" id="adj-caption" placeholder="Texto da legenda…" style="width:100%;box-sizing:border-box;padding:7px 10px;border:1px solid #ccc;border-radius:6px;font-size:13px" />
          </div>

          <div class="step2-actions">
            <button class="btn-cancel" id="adj-btn-back">← Voltar</button>
            <div style="display:flex;gap:8px">
              <button class="btn-cancel" id="adj-btn-preview-refresh">↺ Preview</button>
              <button class="btn-insert" id="adj-btn-insert">${isHeroImageMode ? 'Salvar imagem principal' : 'Inserir imagem'}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // ── State ──
    let currentFile = opts.file || null;
    let currentUrl  = '';
    let activeTab   = initialTab;
    let selectedLayout = isHeroImageMode ? 'hero' : 'alone';
    let origW = 0, origH = 0;
    let ratioLocked = true;
    let cropData = null; // { left, top, width, height } in natural image px

    const step1 = overlay.querySelector('#modal-step1');
    const step2 = overlay.querySelector('#modal-step2');
    const nextBtn   = overlay.querySelector('#modal-btn-next');
    const insertBtn = overlay.querySelector('#adj-btn-insert');

    function refreshNextBtn() {
      if (activeTab === 'clipboard' || activeTab === 'upload') {
        nextBtn.disabled = !currentFile;
      } else {
        nextBtn.disabled = !currentUrl.trim();
      }
    }

    // Show clipboard preview
    if (opts.file) {
      showFilePreview(opts.file, overlay.querySelector('#modal-preview-clipboard'));
      currentFile = opts.file;
      refreshNextBtn();
    }

    // Tab switching
    overlay.querySelectorAll('.tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        overlay.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
        overlay.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        overlay.querySelector(`[data-panel="${activeTab}"]`).classList.add('active');
        refreshNextBtn();
      });
    });

    // File input
    overlay.querySelector('#modal-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      const fileNameEl = overlay.querySelector('#file-chosen-name');
      const customNameInput = overlay.querySelector('#custom-filename-input');
      if (!file) {
        fileNameEl.textContent = 'Nenhum arquivo';
        customNameInput.value = '';
        return;
      }
      fileNameEl.textContent = file.name;
      customNameInput.value = file.name;
      currentFile = file;
      showFilePreview(file, overlay.querySelector('#modal-preview-upload'));
      refreshNextBtn();
    });

    // URL input
    overlay.querySelector('#modal-url-input').addEventListener('input', (e) => {
      currentUrl = e.target.value.trim();
      refreshNextBtn();
    });
    overlay.querySelector('#modal-url-input').addEventListener('blur', (e) => {
      const url = e.target.value.trim();
      if (url) {
        const wrap = overlay.querySelector('#modal-preview-url');
        wrap.innerHTML = `<img src="${escHtml(url)}" alt="preview" onerror="this.parentNode.innerHTML='<span style=color:#c62828;font-size:13px>Não carregou</span>'" />`;
      }
    });

    // Cancel / close
    overlay.querySelector('#modal-btn-cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    // ── Step 1 → Step 2 ──
    nextBtn.addEventListener('click', () => {
      step1.classList.add('hidden');
      step2.classList.add('active');
      initStep2();
    });

    overlay.querySelector('#adj-btn-back').addEventListener('click', () => {
      step2.classList.remove('active');
      step1.classList.remove('hidden');
    });

    // ── Step 2 init ──
    function initStep2() {
      // Show initial preview
      if (activeTab === 'url') {
        const wrap = overlay.querySelector('#adjust-preview-wrap');
        wrap.innerHTML = `<img src="${escHtml(currentUrl)}" alt="preview" style="max-width:100%;max-height:200px" />`;
        loadOrigDims(currentUrl);
      } else if (currentFile) {
        loadPreviewFromFile(currentFile);
        getFileDims(currentFile).then(({ w, h }) => {
          origW = w; origH = h;
          overlay.querySelector('#orig-dims').textContent = `(${w}×${h})`;
          overlay.querySelector('#adj-w').placeholder = w;
          overlay.querySelector('#adj-h').placeholder = h;
        });
      }
      setupCrop();
    }

    function loadOrigDims(url) {
      const img = new Image();
      img.onload = () => {
        origW = img.naturalWidth; origH = img.naturalHeight;
        overlay.querySelector('#orig-dims').textContent = `(${origW}×${origH})`;
        overlay.querySelector('#adj-w').placeholder = origW;
        overlay.querySelector('#adj-h').placeholder = origH;
      };
      img.src = url;
    }

    // Sliders → update value labels
    ['brightness','contrast','saturation'].forEach((key) => {
      const el = overlay.querySelector(`#adj-${key}`);
      const lbl = overlay.querySelector(`#val-${key}`);
      el.addEventListener('input', () => { lbl.textContent = el.value; });
    });
    const qEl = overlay.querySelector('#adj-quality');
    qEl.addEventListener('input', () => { overlay.querySelector('#val-quality').textContent = qEl.value; });

    // Aspect ratio lock
    const lockBtn = overlay.querySelector('#lock-ratio');
    lockBtn.addEventListener('click', () => {
      ratioLocked = !ratioLocked;
      lockBtn.classList.toggle('locked', ratioLocked);
      lockBtn.textContent = ratioLocked ? '🔒' : '🔓';
    });
    overlay.querySelector('#adj-w').addEventListener('input', (e) => {
      if (ratioLocked && origW && origH) {
        const w = parseInt(e.target.value, 10);
        if (w) overlay.querySelector('#adj-h').value = Math.round(w * origH / origW);
      }
    });
    overlay.querySelector('#adj-h').addEventListener('input', (e) => {
      if (ratioLocked && origW && origH) {
        const h = parseInt(e.target.value, 10);
        if (h) overlay.querySelector('#adj-w').value = Math.round(h * origW / origH);
      }
    });

    // Layout selector
    overlay.querySelectorAll('.layout-opt').forEach((opt) => {
      opt.addEventListener('click', () => {
        overlay.querySelectorAll('.layout-opt').forEach((o) => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedLayout = opt.dataset.layout;
        overlay.querySelector('#caption-row').style.display =
          selectedLayout === 'figure' ? '' : 'none';
      });
    });

    // Crop toggle
    overlay.querySelector('#crop-enable').addEventListener('change', (e) => {
      overlay.querySelector('#crop-container').style.display = e.target.checked ? '' : 'none';
      if (!e.target.checked) cropData = null;
    });

    // Preview refresh button
    overlay.querySelector('#adj-btn-preview-refresh').addEventListener('click', () => {
      if (activeTab !== 'url' && currentFile) loadPreviewFromFile(currentFile, true);
    });

    // ── Insert ──
    insertBtn.addEventListener('click', async () => {
      const altText = overlay.querySelector('#modal-alt-input').value.trim() || SLUG;
      insertBtn.disabled = true;
      insertBtn.textContent = 'Processando…';

      try {
        const transforms = collectTransforms();
        let imageUrl;
        let uploadRes;
        if (activeTab === 'clipboard' || activeTab === 'upload') {
          if (!currentFile) throw new Error('Nenhum arquivo selecionado');
          let fileToSend = currentFile;
          // Se custom filename preenchido, cria novo File
          const customNameInput = overlay.querySelector('#custom-filename-input');
          const customName = customNameInput && customNameInput.value.trim();
          if (customName && customName !== currentFile.name) {
            try {
              fileToSend = new File([currentFile], customName, { type: currentFile.type });
            } catch (e) {
              // Safari não suporta File constructor, fallback
              fileToSend = currentFile;
            }
          }
          uploadRes = await uploadImage(fileToSend, transforms);
          imageUrl = uploadRes.url;
        } else {
          imageUrl = currentUrl;
        }

        const caption = overlay.querySelector('#adj-caption').value.trim();

        if (isHeroImageMode) {
          // Hero image mode: POST processed WebP to Django via Vite proxy (adds X-API-Key)
          await uploadImageToDjango(imageUrl);
          closeModal();
          showToast('Imagem principal salva ✓', 'success');
        } else {
          // Normal mode: optionally save DB fields when layout is hero, then insert into MD
          if (selectedLayout === 'hero') {
            await saveArticleImage({
              image: imageUrl.replace(/^\//, ''),
              seo_image_url: imageUrl,
              seo_image_caption: caption || null,
              seo_image_width:  uploadRes?.width  || null,
              seo_image_height: uploadRes?.height || null,
            });
          }
          await handleInsert(
            imageUrl, altText, opts.mode,
            opts.placeholderText || null,
            lastClickedTarget,
            selectedLayout, caption
          );
          closeModal();
          showToast('Imagem inserida e salva ✓', 'success');
        }
      } catch (err) {
        console.error('[blog-image-editor]', err);
        insertBtn.disabled = false;
        insertBtn.textContent = isHeroImageMode ? 'Salvar imagem principal' : 'Inserir imagem';
        showToast(`Erro: ${err.message}`, 'error');
      }
    });

    // ── Helpers ──
    function collectTransforms() {
      const t = {};
      const w = parseInt(overlay.querySelector('#adj-w').value, 10);
      const h = parseInt(overlay.querySelector('#adj-h').value, 10);
      if (w > 0) t.width = w;
      if (h > 0) t.height = h;
      t.brightness = parseInt(overlay.querySelector('#adj-brightness').value, 10);
      t.contrast   = parseInt(overlay.querySelector('#adj-contrast').value, 10);
      t.saturation = parseInt(overlay.querySelector('#adj-saturation').value, 10);
      t.quality    = parseInt(overlay.querySelector('#adj-quality').value, 10);
      t.sharpen    = overlay.querySelector('#adj-sharpen').checked;
      t.grayscale  = overlay.querySelector('#adj-grayscale').checked;
      if (cropData) {
        t.cropLeft   = cropData.left;
        t.cropTop    = cropData.top;
        t.cropWidth  = cropData.width;
        t.cropHeight = cropData.height;
      }
      return t;
    }

    function loadPreviewFromFile(file, withTransforms) {
      const wrap = overlay.querySelector('#adjust-preview-wrap');
      wrap.innerHTML = '<div class="preview-loading">Carregando…</div>';
      const reader = new FileReader();
      reader.onload = (e) => {
        // Show quick local preview first, then update if transforms needed
        wrap.innerHTML = `<img src="${e.target.result}" alt="preview" style="max-width:100%;max-height:200px" />`;
        if (withTransforms) {
          // Send to /preview endpoint for server-side transform
          const t = collectTransforms();
          const hasAdjustments = t.brightness !== 0 || t.contrast !== 0 || t.saturation !== 0 || t.sharpen || t.grayscale || t.width || t.height || cropData;
          if (!hasAdjustments) return;
          const form = new FormData();
          form.append('file', file);
          Object.entries(t).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v); });
          wrap.innerHTML += '<div class="preview-loading">Processando…</div>';
          fetch(`${PROXY}/image-upload/preview`, { method: 'POST', body: form })
            .then((r) => {
              if (!r.ok) throw new Error('Preview falhou');
              return r.blob();
            })
            .then((blob) => {
              const url = URL.createObjectURL(blob);
              wrap.innerHTML = `<img src="${url}" alt="preview" style="max-width:100%;max-height:200px" />`;
            })
            .catch(() => {});
        }
      };
      reader.readAsDataURL(file);
    }

    function getFileDims(file) {
      return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
        img.onerror = () => resolve({ w: 0, h: 0 });
        img.src = url;
      });
    }

    // ── Crop ──
    function setupCrop() {
      const cropImg = overlay.querySelector('#crop-img');
      const cropWrap = overlay.querySelector('#crop-wrap');
      const cropRect = overlay.querySelector('#crop-rect');
      const cropCoords = overlay.querySelector('#crop-coords');

      // Load image into crop canvas
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
        cropRect.style.display = 'block';
        cropRect.style.left = startX + 'px';
        cropRect.style.top  = startY + 'px';
        cropRect.style.width  = '0';
        cropRect.style.height = '0';
        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const br = cropWrap.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - br.left, cropImg.offsetWidth));
        const y = Math.max(0, Math.min(e.clientY - br.top,  cropImg.offsetHeight));
        rect = {
          left:   Math.min(x, startX),
          top:    Math.min(y, startY),
          width:  Math.abs(x - startX),
          height: Math.abs(y - startY),
        };
        cropRect.style.left   = rect.left   + 'px';
        cropRect.style.top    = rect.top    + 'px';
        cropRect.style.width  = rect.width  + 'px';
        cropRect.style.height = rect.height + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        if (rect.width < 4 || rect.height < 4) { cropData = null; cropCoords.textContent = 'Arraste para selecionar área'; return; }
        // Convert display px → natural image px
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
  }

  function closeModal() {
    const m = document.getElementById('img-insert-modal');
    if (m) m.remove();
  }

  function showFilePreview(file, wrap) {
    const reader = new FileReader();
    reader.onload = (e) => {
      wrap.innerHTML = `<img src="${e.target.result}" alt="preview" />`;
    };
    reader.readAsDataURL(file);
  }

  // ─── Hot-reload article content (Opção B) ──────────────────────────────────
  // Envia o content_md para o image-service /render-md, recebe HTML processado
  // e substitui .blog-content no DOM. O fetch(location.href) NÃO funciona porque
  // o Astro renderiza a partir dos arquivos .md em disco (content collections),
  // não do content_md salvo no Django, então a página seria sempre a mesma.
  async function hotReloadArticle(contentMd) {
    try {
      const res = await fetch(`${PROXY}/image-upload/render-md`, {
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

  // ─── Insert orchestration ──────────────────────────────────────────────────
  async function handleInsert(imageUrl, altText, mode, placeholderText, targetEl, layout, caption) {
    if ((mode === 'clipboard' || mode === 'upload' || mode === 'free') && !targetEl) {
      throw new Error('Clique em um parágrafo do artigo primeiro, depois cole a imagem.');
    }

    const contentMd = await fetchContentMd();
    if (contentMd === undefined || contentMd === null) {
      throw new Error('Artigo não tem content_md no banco de dados');
    }

    const imgTag = buildImgTag(imageUrl, altText, layout || 'alone', caption || '');
    const { lineIndex, isPlaceholder } = findInsertionLine(
      contentMd, targetEl, mode, placeholderText
    );
    const newMd = insertImageInMd(contentMd, lineIndex, imgTag, isPlaceholder);

    await saveContentMd(newMd);

    // Injeta imagem diretamente no DOM (rápido, sem round-trip ao servidor)
    injectImageInDOM(targetEl, imgTag, mode, placeholderText);
  }

  // ─── API calls ─────────────────────────────────────────────────────────────
  async function saveArticleImage(data) {
    const res = await fetch(ARTICLE_IMAGE_URL(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: BUSINESS_ID,
        slug: SLUG,
        ...data,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `Erro ${res.status} ao salvar imagem do artigo`);
    console.log('[blog-image-editor] article image saved:', json);
    return json;
  }

  async function uploadImageToDjango(localImageUrl) {
    // localImageUrl é relativa, ex: /assets/images/blog/slug/slug-ts.webp
    // image-service salva em public/{siteId}/assets/... Buscamos via /image-upload/files/{siteId}/...
    // para não depender do Vite servir arquivos novos durante o dev.
    const fetchUrl = `${PROXY}/image-upload/files/${SITE_ID}${localImageUrl}`;
    const fileRes = await fetch(fetchUrl);
    if (!fileRes.ok) throw new Error(`Não encontrou imagem local: ${fetchUrl}`);
    const blob = await fileRes.blob();
    const filename = localImageUrl.split('/').pop();
    const form = new FormData();
    form.append('image', blob, filename);
    const res = await fetch(UPLOAD_IMAGE_URL(), { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status} ao salvar imagem no Django`);
    console.log('[blog-image-editor] Django image saved:', data.image_url);
    return data;
  }

  async function uploadImage(file, transforms) {
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

    const res = await fetch(UPLOAD_URL(), { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Upload falhou: ${res.status}`);
    return data; // { url, width, height }
  }

  async function fetchContentMd() {
    const res = await fetch(CONTENT_MD_URL());
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status} ao buscar content_md`);
    return data.content_md ?? '';
  }

  async function saveContentMd(contentMd) {
    const res = await fetch(SAVE_MD_URL(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: SLUG, siteId: SITE_ID, content_md: contentMd }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status} ao salvar content_md`);
    return data;
  }

  // ─── Text matching ─────────────────────────────────────────────────────────
  function findInsertionLine(contentMd, targetEl, mode, placeholderText) {
    const lines = contentMd.split('\n');

    // Placeholder mode: find the exact comment line
    if (mode === 'placeholder' && placeholderText) {
      const needle = `<!--[[INSERIR IMAGEM: ${placeholderText}]]-->`;
      const idx = lines.findIndex((l) => l.includes(needle));
      if (idx >= 0) return { lineIndex: idx, isPlaceholder: true };

      // Partial fallback (first 40 chars)
      const partial = placeholderText.substring(0, 40);
      const idx2 = lines.findIndex((l) => l.includes(partial));
      if (idx2 >= 0) return { lineIndex: idx2, isPlaceholder: true };
    }

    // Free mode: text-anchor matching
    if (targetEl) {
      let anchorText = (targetEl.textContent || '')
        .trim()
        .replace(/\s+/g, ' ')
        .substring(0, 80);
      const anchorCleaned = anchorText
        .replace(/[\[\]\*_`#]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 60);
      const anchor30 = anchorCleaned.substring(0, 30);

      if (anchor30) {
        let bestIdx = -1, bestScore = 0;
        lines.forEach((line, i) => {
          const lineCleaned = line.replace(/[\[\]\*_`#]/g, '').trim();
          if (lineCleaned.includes(anchor30)) {
            const score = anchor30.length;
            if (score > bestScore) { bestScore = score; bestIdx = i; }
          }
        });
        if (bestIdx >= 0) return { lineIndex: bestIdx, isPlaceholder: false };
      }
    }

    // Fallback: before sources-section, or end
    const sourcesIdx = lines.findIndex((l) => l.includes('sources-section'));
    if (sourcesIdx > 0) return { lineIndex: sourcesIdx - 1, isPlaceholder: false };

    return { lineIndex: lines.length - 1, isPlaceholder: false };
  }

  function insertImageInMd(contentMd, lineIndex, imgTag, isPlaceholder) {
    const lines = contentMd.split('\n');
    if (isPlaceholder) {
      lines[lineIndex] = imgTag;
    } else {
      lines.splice(lineIndex + 1, 0, '', imgTag, '');
    }
    return lines.join('\n');
  }

  // ─── DOM preview ───────────────────────────────────────────────────────────
  function injectImageInDOM(targetEl, imgTag, mode, placeholderText) {
    const tmp = document.createElement('div');
    // buildImgTag retorna Markdown `![alt](url)` para layout 'alone' — converter para <img>
    const mdMatch = imgTag.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (mdMatch) {
      tmp.innerHTML = `<img src="${escHtml(mdMatch[2])}" alt="${escHtml(mdMatch[1])}" />`;
    } else {
      tmp.innerHTML = imgTag;
    }
    const imgEl = tmp.firstElementChild;
    if (!imgEl) return;

    if (mode === 'placeholder' && placeholderText) {
      // Find placeholder button by data attribute and replace it
      const btn = document.querySelector(
        `.img-placeholder-btn[data-placeholder-text="${CSS.escape(placeholderText)}"]`
      );
      if (btn) { btn.parentNode.replaceChild(imgEl, btn); return; }
    }

    if (targetEl) {
      targetEl.insertAdjacentElement('afterend', imgEl);
      targetEl.classList.remove('img-target-highlight');
      lastClickedTarget = null;
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function buildImgTag(url, altText, layout, caption) {
    const u = escHtml(url);
    const a = escHtml(altText);
    const c = escHtml(caption || '');
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
      default: // 'alone'
        return `![${a}](${url})`;
    }
  }

  function escHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function showToast(message, type) {
    const existing = document.querySelector('.img-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `img-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // ─── FAB container ──────────────────────────────────────────────────────────
  function getOrCreateFabContainer() {
    let c = document.getElementById('editor-fab-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'editor-fab-container';
      document.body.appendChild(c);
    }
    return c;
  }

  // ─── Hero Image FAB ────────────────────────────────────────────────────────
  function setupHeroImageButton() {
    const fab = document.createElement('button');
    fab.id = 'hero-image-fab';
    fab.className = 'editor-fab';
    fab.textContent = '📷 Imagem principal';
    fab.addEventListener('click', () => {
      openModal({ mode: 'hero-image', altText: SLUG });
    });
    getOrCreateFabContainer().appendChild(fab);
  }

  // ─── Insert Image FAB ──────────────────────────────────────────────────────
  function setupInsertImageButton() {
    const fab = document.createElement('button');
    fab.id = 'img-insert-fab';
    fab.className = 'editor-fab';
    fab.textContent = '🖼️ Inserir imagem no artigo';
    fab.addEventListener('click', () => {
      if (!lastClickedTarget) {
        showToast('Clique em um parágrafo do artigo primeiro', 'error');
        return;
      }
      openModal({ mode: 'free', altText: SLUG });
    });
    getOrCreateFabContainer().appendChild(fab);
  }

  // ─── MD Editor FAB ────────────────────────────────────────────────────────
  function setupMdEditorButton() {
    const fab = document.createElement('button');
    fab.id = 'md-editor-fab';
    fab.className = 'editor-fab';
    fab.textContent = '✏️ Editar MD';
    fab.addEventListener('click', openMdEditor);
    getOrCreateFabContainer().appendChild(fab);
  }

  async function openMdEditor() {
    closeMdEditor();
    let content = '';
    try {
      content = await fetchContentMd();
    } catch (err) {
      showToast(`Erro ao carregar: ${err.message}`, 'error');
      return;
    }

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
            <button class="btn-md-cancel" id="md-btn-cancel">Cancelar</button>
            <button class="btn-md-save" id="md-btn-save">💾 Salvar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const textarea = overlay.querySelector('#md-editor-textarea');
    const counter = overlay.querySelector('#md-counter');
    const saveBtn = overlay.querySelector('#md-btn-save');

    textarea.value = content;
    updateCounter();

    function updateCounter() {
      const v = textarea.value;
      const lines = v.split('\n').length;
      const chars = v.length;
      counter.textContent = `${lines} linhas · ${chars} chars`;
    }

    textarea.addEventListener('input', updateCounter);

    overlay.querySelector('#md-btn-close').addEventListener('click', closeMdEditor);
    overlay.querySelector('#md-btn-cancel').addEventListener('click', closeMdEditor);

    overlay.querySelector('#md-btn-reload').addEventListener('click', async () => {
      try {
        textarea.value = await fetchContentMd();
        updateCounter();
        showToast('Recarregado do DB ✓', 'success');
      } catch (err) {
        showToast(`Erro: ${err.message}`, 'error');
      }
    });

    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Salvando…';
      try {
        await saveMdFromEditor(textarea.value);
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Salvar';
      }
    });
  }

  function closeMdEditor() {
    const m = document.getElementById('md-editor-modal');
    if (m) m.remove();
  }

  async function saveMdFromEditor(newContentMd) {
    try {
      await saveContentMd(newContentMd);
      closeMdEditor();
      showToast('content_md salvo ✓', 'success');
      // Opção B para MD editor: renderiza o MD no image-service e troca .blog-content
      await hotReloadArticle(newContentMd);
    } catch (err) {
      // keep modal open
      showToast(`Erro ao salvar: ${err.message}`, 'error');
    }
  }

  // ─── Boot ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
