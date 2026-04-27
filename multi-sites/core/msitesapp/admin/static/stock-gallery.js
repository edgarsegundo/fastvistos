/**
 * stock-gallery.js — Overlay de imagens stock (Pexels + Pixabay + Google)
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

  const el = {
    overlay:        () => document.getElementById('overlay-stock-gallery'),
    btnClose:       () => document.getElementById('btn-close-stock-gallery'),
    tabPexels:      () => document.getElementById('tab-stock-pexels'),
    tabPixabay:     () => document.getElementById('tab-stock-pixabay'),
    tabGoogle:      () => document.getElementById('tab-stock-google'),
    searchInput:    () => document.getElementById('stock-search-input'),
    btnSearch:      () => document.getElementById('btn-stock-search'),
    spinner:        () => document.getElementById('stock-gallery-spinner'),
    error:          () => document.getElementById('stock-gallery-error'),
    grid:           () => document.getElementById('stock-gallery-grid'),
    pageInfo:       () => document.getElementById('stock-gallery-page-info'),
    btnPrev:        () => document.getElementById('btn-stock-gallery-prev'),
    btnNext:        () => document.getElementById('btn-stock-gallery-next'),
    attribution:    () => document.getElementById('stock-gallery-attribution'),
    loadingOverlay: () => document.getElementById('stock-img-loading'),
  };

  function init(callback) {
    onSelectedCallback = callback;
    defaultQuery = new URLSearchParams(window.location.search).get('group') || '';

    el.btnClose().addEventListener('click', close);
    el.tabPexels().addEventListener('click',  () => switchSource('pexels'));
    el.tabPixabay().addEventListener('click', () => switchSource('pixabay'));
    el.tabGoogle().addEventListener('click',  () => switchSource('google'));
    el.btnSearch().addEventListener('click', () => triggerSearch());
    el.searchInput().addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerSearch();
    });
    el.btnPrev().addEventListener('click', () => { if (currentPage > 1) loadPage(currentPage - 1); });
    el.btnNext().addEventListener('click', () => { if (currentPage < totalPages) loadPage(currentPage + 1); });
  }

  function open() {
    currentPage = 1;
    photos      = [];
    if (defaultQuery) {
      el.searchInput().value = defaultQuery;
      currentQuery = defaultQuery;
    } else {
      el.searchInput().value = '';
      currentQuery = '';
    }
    el.overlay().classList.add('open');
    updateTabs();
    updateAttribution();
    if (currentQuery) loadPage(1);
    else renderEmpty('Digite um termo para buscar imagens.');
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
    if (currentQuery) loadPage(1);
    else renderEmpty('Digite um termo para buscar imagens.');
  }

  function updateTabs() {
    ['pexels', 'pixabay', 'google'].forEach(src => {
      const tabEl    = document.getElementById(`tab-stock-${src}`);
      const isActive = currentSource === src;
      tabEl.classList.toggle('bg-blue-600',   isActive);
      tabEl.classList.toggle('text-white',    isActive);
      tabEl.classList.toggle('text-gray-600', !isActive);
    });
  }

  function updateAttribution() {
    const map = {
      pexels:  'Fotos por <a href="https://www.pexels.com" target="_blank" class="text-blue-500 underline">Pexels</a>',
      pixabay: 'Fotos por <a href="https://pixabay.com" target="_blank" class="text-blue-500 underline">Pixabay</a>',
      google:  'Via <a href="https://programmablesearchengine.google.com" target="_blank" class="text-blue-500 underline">Google Custom Search</a> — verifique direitos de uso',
    };
    el.attribution().innerHTML = map[currentSource] || '';
  }

  function triggerSearch() {
    const q = el.searchInput().value.trim();
    if (!q) return;
    currentQuery = q;
    currentPage  = 1;
    photos       = [];
    loadPage(1);
  }

  async function loadPage(page) {
    if (loading || !currentQuery) return;
    loading = true;
    setLoading(true);
    setError('');
    try {
      const endpoints = { pexels: 'pexels', pixabay: 'pixabay', google: 'google' };
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
        thumbUrl = photo.thumb_url;  largeUrl = photo.large_url;
        label = photo.title || '';   alt = photo.title || '';
      }

      const div = document.createElement('div');
      div.className = 'relative group cursor-pointer overflow-hidden bg-gray-100';
      div.style.cssText = 'width:100%;height:100px;flex-shrink:0;overflow:hidden;';
      div.innerHTML = `
        <img src="${thumbUrl}" alt="${alt}" loading="lazy"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"
          class="transition-transform duration-200 group-hover:scale-105"
          onerror="this.parentElement.style.display='none'">
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
      const proxyEndpoint = currentSource === 'google'
        ? `${API_BASE}/google-proxy/?url=${encodeURIComponent(largeUrl)}`
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
