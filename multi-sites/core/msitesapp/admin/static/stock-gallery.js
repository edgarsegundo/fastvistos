/**
 * stock-gallery.js — Overlay de imagens stock (Pexels + Pixabay + Unsplash + URL direta)
 */

const StockGalleryOverlay = (() => {

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/image-editor/stock'
  : '/msitesapp/api/image-editor/stock';

  let onSelectedCallback = null;
  let currentSource = 'pexels';
  let currentQuery  = '';
  let currentPage   = 1;
  let totalPages    = 1;
  let photos        = [];
  let loading       = false;
  let defaultQuery  = '';
  const SEARCH_KEY = 'stockGalleryLastQuery';

  const el = {
    overlay:        () => document.getElementById('overlay-stock-gallery'),
    btnClose:       () => document.getElementById('btn-close-stock-gallery'),
    tabPexels:      () => document.getElementById('tab-stock-pexels'),
    tabPixabay:     () => document.getElementById('tab-stock-pixabay'),
    tabUnsplash:    () => document.getElementById('tab-stock-unsplash'),
    tabUrl:         () => document.getElementById('tab-stock-url'),
    searchBar:      () => document.getElementById('stock-search-bar'),
    searchInput:    () => document.getElementById('stock-search-input'),
    btnSearch:      () => document.getElementById('btn-stock-search'),
    btnGoogleOpen:  () => document.getElementById('btn-open-google-images'),
    spinner:        () => document.getElementById('stock-gallery-spinner'),
    error:          () => document.getElementById('stock-gallery-error'),
    grid:           () => document.getElementById('stock-gallery-grid'),
    urlPanel:       () => document.getElementById('stock-url-panel'),
    urlInput:       () => document.getElementById('stock-url-input'),
    btnLoadUrl:     () => document.getElementById('btn-stock-load-url'),
    urlPreview:     () => document.getElementById('stock-url-preview'),
    urlPreviewImg:  () => document.getElementById('stock-url-preview-img'),
    pagination:     () => document.getElementById('stock-gallery-pagination'),
    pageInfo:       () => document.getElementById('stock-gallery-page-info'),
    btnPrev:        () => document.getElementById('btn-stock-gallery-prev'),
    btnNext:        () => document.getElementById('btn-stock-gallery-next'),
    attribution:    () => document.getElementById('stock-gallery-attribution'),
    loadingOverlay: () => document.getElementById('stock-img-loading'),
  };

  function init(callback) {
    onSelectedCallback = callback;
    defaultQuery = new URLSearchParams(window.location.search).get('group') || '';

    const lastQuery = localStorage.getItem(SEARCH_KEY);
    if (lastQuery) defaultQuery = lastQuery;

    el.btnClose().addEventListener('click', close);
    el.tabPexels().addEventListener('click',   () => switchSource('pexels'));
    el.tabPixabay().addEventListener('click',  () => switchSource('pixabay'));
    el.tabUnsplash().addEventListener('click', () => switchSource('unsplash'));
    el.tabUrl().addEventListener('click',      () => switchSource('url'));
    el.btnSearch().addEventListener('click', () => triggerSearch());
    el.searchInput().addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerSearch();
    });
    el.btnGoogleOpen().addEventListener('click', () => {
      const q = el.searchInput().value.trim() || currentQuery;
      window.open('https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(q), '_blank');
    });
    el.btnPrev().addEventListener('click', () => { if (currentPage > 1) loadPage(currentPage - 1); });
    el.btnNext().addEventListener('click', () => { if (currentPage < totalPages) loadPage(currentPage + 1); });
    el.btnLoadUrl().addEventListener('click', () => loadFromUrl());
    el.urlInput().addEventListener('keydown', (e) => { if (e.key === 'Enter') loadFromUrl(); });
  }

  function open() {
    currentPage = 1;
    photos      = [];
    const lastQuery = localStorage.getItem(SEARCH_KEY);
    if (lastQuery) {
      el.searchInput().value = lastQuery;
      currentQuery = lastQuery;
    } else if (defaultQuery) {
      el.searchInput().value = defaultQuery;
      currentQuery = defaultQuery;
    } else {
      el.searchInput().value = '';
      currentQuery = '';
    }
    el.overlay().classList.add('open');
    updateTabs();
    updateAttribution();
    if (currentSource === 'url') {
      showUrlPanel(true);
    } else if (currentQuery) {
      loadPage(1);
    } else {
      renderEmpty('Digite um termo para buscar imagens.');
    }
  }

  function close() {
    el.overlay().classList.remove('open');
  }

  function switchSource(source) {
    if (currentSource === source) return;
    currentSource = source;
    currentPage   = 1;
    photos        = [];
    updateTabs();
    updateAttribution();

    if (source === 'url') {
      showUrlPanel(true);
      setError('');
    } else {
      showUrlPanel(false);
      if (currentQuery) loadPage(1);
      else renderEmpty('Digite um termo para buscar imagens.');
    }
  }

  function showUrlPanel(active) {
    el.urlPanel().classList.toggle('hidden', !active);
    el.grid().classList.toggle('hidden', active);
    el.searchBar().classList.toggle('hidden', active);
    el.pagination().classList.toggle('hidden', active);
    el.spinner().classList.add('hidden');
    if (active) {
      el.urlInput().value = '';
      el.urlPreview().classList.add('hidden');
      el.urlPreviewImg().src = '';
    }
  }

  function updateTabs() {
    ['pexels', 'pixabay', 'unsplash', 'url'].forEach(src => {
      const tabEl    = document.getElementById(`tab-stock-${src}`);
      if (!tabEl) return;
      const isActive = currentSource === src;
      tabEl.classList.toggle('bg-blue-600',   isActive);
      tabEl.classList.toggle('text-white',    isActive);
      tabEl.classList.toggle('text-gray-600', !isActive);
    });
  }

  function updateAttribution() {
    const map = {
      pexels:   'Fotos por <a href="https://www.pexels.com" target="_blank" class="text-blue-500 underline">Pexels</a>',
      pixabay:  'Fotos por <a href="https://pixabay.com" target="_blank" class="text-blue-500 underline">Pixabay</a>',
      unsplash: 'Fotos por <a href="https://unsplash.com" target="_blank" class="text-blue-500 underline">Unsplash</a>',
      url:      '',
    };
    el.attribution().innerHTML = map[currentSource] || '';
  }

  function triggerSearch() {
    const q = el.searchInput().value.trim();
    if (!q) return;
    currentQuery = q;
    currentPage  = 1;
    photos       = [];
    localStorage.setItem(SEARCH_KEY, q);
    loadPage(1);
  }

  async function loadPage(page) {
    if (loading || !currentQuery || currentSource === 'url') return;
    loading = true;
    setLoading(true);
    setError('');
    try {
      const endpoints = { pexels: 'pexels', pixabay: 'pixabay', unsplash: 'unsplash' };
      const url = `${API_BASE}/${endpoints[currentSource]}/?q=${encodeURIComponent(currentQuery)}&page=${page}`;
      const res  = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      photos      = data.photos || [];
      currentPage = data.page;
      totalPages  = data.pages;
      updatePagination();
      renderGrid();
    } catch (err) {
      setError(err.message);
    } finally {
      loading = false;
      setLoading(false);
    }
  }

  function renderGrid() {
    const grid = el.grid();
    grid.innerHTML = '';
    if (photos.length === 0) { renderEmpty('Nenhuma imagem encontrada.'); return; }

    photos.forEach((photo, idx) => {
      let thumbUrl, largeUrl, label, alt;
      if (currentSource === 'pexels') {
        thumbUrl = photo.src_medium; largeUrl = photo.src_large;
        label = photo.photographer;  alt = photo.alt || label || '';
      } else if (currentSource === 'pixabay') {
        thumbUrl = photo.medium_url; largeUrl = photo.large_url;
        label = photo.user;          alt = photo.tags || label || '';
      } else {
        // unsplash
        thumbUrl = photo.thumb_url;  largeUrl = photo.large_url;
        label = photo.user || '';    alt = photo.alt || label || '';
      }

      const div = document.createElement('div');
      div.className = 'relative group cursor-pointer overflow-hidden bg-gray-100';
      div.style.cssText = 'width:100%;height:100px;flex-shrink:0;overflow:hidden;';
      div.innerHTML = `
        <img src="${thumbUrl}" alt="${alt}" loading="lazy"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"
          class="transition-transform duration-200 group-hover:scale-105"
          onerror="this.parentElement.style.display='none'"
          onload="this.nextElementSibling && typeof this.nextElementSibling.setAttribute === 'function' && (this.nextElementSibling.textContent = this.naturalWidth && this.naturalHeight ? this.naturalWidth + 'x' + this.naturalHeight : '')"
        >
        <span class="absolute bottom-1 left-1 bg-black/60 text-[9px] text-white px-1 py-0.5 rounded z-10 pointer-events-none select-none" style="font-size:9px;line-height:1;min-width:32px;max-width:60px;white-space:nowrap;"> </span>
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-end">
          <span class="w-full text-white text-xs px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">${label}</span>
        </div>
        <div id="stock-check-${idx}" class="absolute inset-0 flex items-center justify-center text-4xl opacity-0 pointer-events-none transition-opacity duration-300 bg-black/10">✅</div>
      `;
      div.addEventListener('click', () => onPhotoClick(photo, idx, largeUrl, alt));
      grid.appendChild(div);
    });
  }

  function renderEmpty(msg) {
    el.grid().innerHTML = `<p class="col-span-3 text-center text-gray-400 text-sm py-8">${msg}</p>`;
  }

  async function onPhotoClick(photo, idx, largeUrl, alt) {
    const checkEl = document.getElementById(`stock-check-${idx}`);
    if (checkEl) checkEl.style.opacity = '1';
    showImgLoading(true);
    try {
      // Unsplash images are on images.unsplash.com — use the allowlist proxy
      const proxyEndpoint = currentSource === 'unsplash'
        ? `${API_BASE}/proxy/?url=${encodeURIComponent(largeUrl)}`
        : `${API_BASE}/proxy/?url=${encodeURIComponent(largeUrl)}`;

      const response = await fetch(proxyEndpoint);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${response.status}`);
      }
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) throw new Error('URL não retornou uma imagem válida.');

      const name = `stock-${currentSource}-${photo.id || Date.now()}-${Date.now()}`;
      if (onSelectedCallback) {
        onSelectedCallback({
          file:    new File([blob], name + '.jpg', { type: blob.type }),
          dataUrl: URL.createObjectURL(blob),
          name, alt, source: currentSource,
        });
      }
      setTimeout(() => { if (checkEl) checkEl.style.opacity = '0'; }, 800);
      setTimeout(() => close(), 500);
    } catch (err) {
      setError('Erro ao carregar imagem: ' + err.message);
      if (checkEl) checkEl.style.opacity = '0';
    } finally {
      showImgLoading(false);
    }
  }

  async function loadFromUrl() {
    const rawUrl = el.urlInput().value.trim();
    if (!rawUrl) return;

    let parsed;
    try { parsed = new URL(rawUrl); } catch { setError('URL inválida.'); return; }
    if (parsed.protocol !== 'https:') { setError('Apenas URLs https são suportadas.'); return; }

    setError('');
    showImgLoading(true);
    try {
      const proxyUrl = `${API_BASE}/google-proxy/?url=${encodeURIComponent(rawUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${response.status}`);
      }
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) throw new Error('URL não retornou uma imagem válida.');

      // Show preview
      const objectUrl = URL.createObjectURL(blob);
      el.urlPreviewImg().src = objectUrl;
      el.urlPreview().classList.remove('hidden');

      const name = `url-import-${Date.now()}`;
      if (onSelectedCallback) {
        onSelectedCallback({
          file:    new File([blob], name + '.jpg', { type: blob.type }),
          dataUrl: objectUrl,
          name, alt: '', source: 'url',
        });
      }
      setTimeout(() => close(), 500);
    } catch (err) {
      setError('Erro ao carregar imagem: ' + err.message);
    } finally {
      showImgLoading(false);
    }
  }

  function updatePagination() {
    el.pageInfo().textContent = `${currentPage} / ${totalPages}`;
    el.btnPrev().disabled     = currentPage <= 1;
    el.btnNext().disabled     = currentPage >= totalPages;
  }
  function setLoading(active) {
    el.spinner().classList.toggle('hidden', !active);
    el.grid().classList.toggle('opacity-40', active);
  }
  function showImgLoading(active) { el.loadingOverlay().classList.toggle('hidden', !active); }
  function setError(msg) {
    el.error().textContent = msg;
    el.error().classList.toggle('hidden', !msg);
  }

  return { init, open, close };
})();
