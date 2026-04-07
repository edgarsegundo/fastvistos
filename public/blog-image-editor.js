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
  const UPLOAD_URL = () => `${PROXY}/image-upload/upload`;

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
      #img-insert-modal input[type=file] { margin-bottom: 12px; font-size: 13px; }
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

      #img-insert-fab {
        position: fixed; bottom: 24px; left: 20px; z-index: 8900;
        padding: 10px 18px; border: none; border-radius: 8px;
        background: #1565c0; color: #fff;
        font-size: 14px; font-family: system-ui, sans-serif;
        cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,.3);
        transition: background .15s;
      }
      #img-insert-fab:hover { background: #1976d2; }

      #md-editor-fab {
        position: fixed; bottom: 80px; left: 20px; z-index: 8900;
        padding: 10px 18px; border: none; border-radius: 8px;
        background: #263238; color: #fff;
        font-size: 14px; font-family: system-ui, sans-serif;
        cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,.3);
        transition: background .15s;
      }
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

      #md-editor-banner {
        position: fixed; top: 0; left: 0; right: 0; z-index: 9200;
        background: #f57f17; color: #fff;
        padding: 10px 20px; font-size: 14px; font-family: system-ui, sans-serif;
        display: flex; align-items: center; justify-content: space-between;
        box-shadow: 0 2px 8px rgba(0,0,0,.2);
      }
      #md-editor-banner button {
        background: none; border: none; color: #fff;
        font-size: 18px; cursor: pointer; padding: 0 4px;
      }
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
    // Close any existing modal
    closeModal();

    const overlay = document.createElement('div');
    overlay.id = 'img-insert-modal';

    const isPlaceholder = opts.mode === 'placeholder';
    const initialTab = opts.mode === 'url' ? 'url'
      : (opts.mode === 'upload' || opts.mode === 'free') ? 'upload'
      : 'clipboard';

    overlay.innerHTML = `
      <div class="modal-box">
        <h2>📷 Inserir imagem</h2>
        <div class="tabs">
          <button class="tab ${initialTab === 'clipboard' ? 'active' : ''}" data-tab="clipboard">Clipboard</button>
          <button class="tab ${initialTab === 'upload' ? 'active' : ''}" data-tab="upload">Upload</button>
          <button class="tab ${initialTab === 'url' ? 'active' : ''}" data-tab="url">URL externa</button>
        </div>

        <!-- Clipboard tab -->
        <div class="tab-panel ${initialTab === 'clipboard' ? 'active' : ''}" data-panel="clipboard">
          <div class="preview-wrap" id="modal-preview-clipboard">
            <span style="color:#999;font-size:13px">Sem imagem no clipboard</span>
          </div>
        </div>

        <!-- Upload tab -->
        <div class="tab-panel ${initialTab === 'upload' ? 'active' : ''}" data-panel="upload">
          <input type="file" id="modal-file-input" accept="image/*" />
          <div class="preview-wrap" id="modal-preview-upload">
            <span style="color:#999;font-size:13px">Selecione um arquivo</span>
          </div>
        </div>

        <!-- URL tab -->
        <div class="tab-panel ${initialTab === 'url' ? 'active' : ''}" data-panel="url">
          <label>URL da imagem</label>
          <input type="url" id="modal-url-input" placeholder="https://exemplo.com/imagem.jpg" />
          <div class="preview-wrap" id="modal-preview-url">
            <span style="color:#999;font-size:13px">Cole uma URL acima</span>
          </div>
        </div>

        <label>Alt text</label>
        <input type="text" id="modal-alt-input" value="${escHtml(opts.altText || '')}" placeholder="Descrição da imagem" />

        <div class="modal-actions">
          <button class="btn-cancel" id="modal-btn-cancel">Cancelar</button>
          <button class="btn-insert" id="modal-btn-insert" disabled>Inserir imagem</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // State
    let currentFile = opts.file || null;
    let currentUrl = '';
    let activeTab = initialTab;

    const insertBtn = overlay.querySelector('#modal-btn-insert');

    function refreshInsertBtn() {
      if (activeTab === 'clipboard' || activeTab === 'upload') {
        insertBtn.disabled = !currentFile;
      } else {
        insertBtn.disabled = !currentUrl.trim();
      }
    }

    // Show clipboard preview if we have a file
    if (opts.file) {
      showFilePreview(opts.file, overlay.querySelector('#modal-preview-clipboard'));
      currentFile = opts.file;
      refreshInsertBtn();
    }

    // Tab switching
    overlay.querySelectorAll('.tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        overlay.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
        overlay.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        overlay.querySelector(`[data-panel="${activeTab}"]`).classList.add('active');
        if (activeTab !== 'url') {
          // Reset file when switching away from url
        }
        refreshInsertBtn();
      });
    });

    // File input
    overlay.querySelector('#modal-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      currentFile = file;
      showFilePreview(file, overlay.querySelector('#modal-preview-upload'));
      refreshInsertBtn();
    });

    // URL input
    overlay.querySelector('#modal-url-input').addEventListener('input', (e) => {
      currentUrl = e.target.value.trim();
      refreshInsertBtn();
    });
    overlay.querySelector('#modal-url-input').addEventListener('blur', (e) => {
      const url = e.target.value.trim();
      if (url) {
        const wrap = overlay.querySelector('#modal-preview-url');
        wrap.innerHTML = `<img src="${escHtml(url)}" alt="preview" onerror="this.parentNode.innerHTML='<span style=color:#c62828;font-size:13px>Imagem não carregada</span>'" />`;
      }
    });

    // Cancel
    overlay.querySelector('#modal-btn-cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    // Insert
    insertBtn.addEventListener('click', async () => {
      const altText = overlay.querySelector('#modal-alt-input').value.trim() || SLUG;
      insertBtn.disabled = true;
      insertBtn.textContent = 'Processando…';

      try {
        let imageUrl;
        if (activeTab === 'clipboard' || activeTab === 'upload') {
          if (!currentFile) throw new Error('Nenhum arquivo selecionado');
          const res = await uploadImage(currentFile);
          imageUrl = res.url;
        } else {
          imageUrl = currentUrl;
        }

        await handleInsert(
          imageUrl, altText, opts.mode,
          opts.placeholderText || null,
          lastClickedTarget
        );
        closeModal();
        showToast('Imagem inserida e salva ✓', 'success');
      } catch (err) {
        console.error('[blog-image-editor]', err);
        insertBtn.disabled = false;
        insertBtn.textContent = 'Inserir imagem';
        showToast(`Erro: ${err.message}`, 'error');
      }
    });
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

  // ─── Insert orchestration ──────────────────────────────────────────────────
  async function handleInsert(imageUrl, altText, mode, placeholderText, targetEl) {
    // For clipboard/upload mode, require a clicked target
    if ((mode === 'clipboard' || mode === 'upload') && !targetEl) {
      throw new Error('Clique em um parágrafo do artigo primeiro, depois cole a imagem.');
    }

    const contentMd = await fetchContentMd();
    if (!contentMd && contentMd !== '') {
      throw new Error('Artigo não tem content_md no banco de dados');
    }

    const imgTag = buildImgTag(imageUrl, altText);
    const { lineIndex, isPlaceholder } = findInsertionLine(
      contentMd, targetEl, mode, placeholderText
    );
    const newMd = insertImageInMd(contentMd, lineIndex, imgTag, isPlaceholder);

    await saveContentMd(newMd);

    injectImageInDOM(targetEl, imgTag, mode, placeholderText);
  }

  // ─── API calls ─────────────────────────────────────────────────────────────
  async function uploadImage(file) {
    const form = new FormData();
    form.append('file', file);
    form.append('siteId', SITE_ID);
    form.append('slug', SLUG);
    form.append('businessId', BUSINESS_ID);

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
    tmp.innerHTML = imgTag;
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
  function buildImgTag(url, altText) {
    return `<img src="${escHtml(url)}" alt="${escHtml(altText)}" />`;
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

  // ─── Insert Image FAB ──────────────────────────────────────────────────────
  function setupInsertImageButton() {
    const fab = document.createElement('button');
    fab.id = 'img-insert-fab';
    fab.textContent = '🖼️ Inserir imagem';
    fab.addEventListener('click', () => {
      if (!lastClickedTarget) {
        showToast('Clique em um parágrafo do artigo primeiro', 'error');
        return;
      }
      openModal({ mode: 'free', altText: SLUG });
    });
    document.body.appendChild(fab);
  }

  // ─── MD Editor FAB ────────────────────────────────────────────────────────
  function setupMdEditorButton() {
    const fab = document.createElement('button');
    fab.id = 'md-editor-fab';
    fab.textContent = '✏️ Editar MD';
    fab.addEventListener('click', openMdEditor);
    document.body.appendChild(fab);
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
      showReloadBanner();
    } catch (err) {
      // keep modal open
      showToast(`Erro ao salvar: ${err.message}`, 'error');
    }
  }

  function showReloadBanner() {
    if (document.getElementById('md-editor-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'md-editor-banner';
    banner.innerHTML = `
      <span>📝 content_md atualizado no DB. Recarregue a página ou rode <code>pubpre</code> para ver as mudanças.</span>
      <button onclick="this.parentNode.remove()" title="Fechar">✕</button>
    `;
    document.body.prepend(banner);
  }

  // ─── Boot ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
