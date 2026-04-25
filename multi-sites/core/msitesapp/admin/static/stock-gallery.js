/**
 * stock-gallery.js — Overlay de imagens stock (Pexels + Pixabay)
 *
 * Responsabilidades:
 *  - Abrir/fechar o overlay
 *  - Buscar imagens via backend (stock-routes.js) com suporte a Pexels e Pixabay
 *  - Carregar automaticamente usando o parâmetro `group` da URL como query default
 *  - Renderizar em grade com paginação
 *  - Ao selecionar uma imagem, carregá-la como Blob e notificar app.js via callback
 *    para que apareça no preview-container (sem salvar no servidor ainda)
 */

const StockGalleryOverlay = (() => {
  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------
  const API_BASE = '/image-editor/stock';

  // ---------------------------------------------------------------------------
  // Estado interno
  // ---------------------------------------------------------------------------
  let onSelectedCallback = null;
  let currentSource = 'pexels';   // 'pexels' | 'pixabay'
  let currentQuery  = '';
  let currentPage   = 1;
  let totalPages    = 1;
  let photos        = [];
  let loading       = false;
  let defaultQuery  = '';

  // ---------------------------------------------------------------------------
  // Referências ao DOM (lazy — resolvidas na primeira chamada)
  // ---------------------------------------------------------------------------
  const el = {
    overlay:      () => document.getElementById('overlay-stock-gallery'),
    btnClose:     () => document.getElementById('btn-close-stock-gallery'),
    tabPexels:    () => document.getElementById('tab-stock-pexels'),
    tabPixabay:   () => document.getElementById('tab-stock-pixabay'),
    searchInput:  () => document.getElementById('stock-search-input'),
    btnSearch:    () => document.getElementById('btn-stock-search'),
    spinner:      () => document.getElementById('stock-gallery-spinner'),
    error:        () => document.getElementById('stock-gallery-error'),
    grid:         () => document.getElementById('stock-gallery-grid'),
    pageInfo:     () => document.getElementById('stock-gallery-page-info'),
    btnPrev:      () => document.getElementById('btn-stock-gallery-prev'),
    btnNext:      () => document.getElementById('btn-stock-gallery-next'),
    attribution:  () => document.getElementById('stock-gallery-attribution'),
    loadingOverlay: () => document.getElementById('stock-img-loading'),
  };

  // ---------------------------------------------------------------------------
  // Init — chamado uma vez em app.js
  // ---------------------------------------------------------------------------
  function init(callback) {
    onSelectedCallback = callback;

    // Lê o parâmetro `group` da URL para usar como query default
    defaultQuery = new URLSearchParams(window.location.search).get('group') || '';

    el.btnClose().addEventListener('click', close);

    el.tabPexels().addEventListener('click',  () => switchSource('pexels'));
    el.tabPixabay().addEventListener('click', () => switchSource('pixabay'));

    el.btnSearch().addEventListener('click', () => triggerSearch());
    el.searchInput().addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerSearch();
    });

    el.btnPrev().addEventListener('click', () => {
      if (currentPage > 1) loadPage(currentPage - 1);
    });
    el.btnNext().addEventListener('click', () => {
      if (currentPage < totalPages) loadPage(currentPage + 1);
    });
  }

  // ---------------------------------------------------------------------------
  // Abre o overlay
  // ---------------------------------------------------------------------------
  function open() {
    currentPage = 1;
    photos      = [];

    // Preenche o campo de busca com o group da URL (se existir)
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

    if (currentQuery) {
      loadPage(1);
    } else {
      renderEmpty('Digite um termo para buscar imagens.');
    }
  }

  function close() {
    el.overlay().classList.remove('open');
  }

  // ---------------------------------------------------------------------------
  // Troca de aba (fonte)
  // ---------------------------------------------------------------------------
  function switchSource(source) {
    if (currentSource === source) return;
    currentSource = source;
    currentPage   = 1;
    photos        = [];
    updateTabs();
    updateAttribution();
    if (currentQuery) loadPage(1);
  }

  function updateTabs() {
    const isPexels = currentSource === 'pexels';

    el.tabPexels().classList.toggle('bg-blue-600',   isPexels);
    el.tabPexels().classList.toggle('text-white',    isPexels);
    el.tabPexels().classList.toggle('text-gray-600', !isPexels);

    el.tabPixabay().classList.toggle('bg-blue-600',   !isPexels);
    el.tabPixabay().classList.toggle('text-white',    !isPexels);
    el.tabPixabay().classList.toggle('text-gray-600', isPexels);
  }

  function updateAttribution() {
    if (currentSource === 'pexels') {
      el.attribution().innerHTML = 'Fotos fornecidas por <a href="https://www.pexels.com" target="_blank" class="text-blue-500 underline">Pexels</a>';
    } else {
      el.attribution().innerHTML = 'Fotos fornecidas por <a href="https://pixabay.com" target="_blank" class="text-blue-500 underline">Pixabay</a>';
    }
  }

  // ---------------------------------------------------------------------------
  // Busca
  // ---------------------------------------------------------------------------
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
      const endpoint = currentSource === 'pexels'
        ? `${API_BASE}/pexels/`
        : `${API_BASE}/pixabay/`;

      const url = `${endpoint}?q=${encodeURIComponent(currentQuery)}&page=${page}`;
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

  // ---------------------------------------------------------------------------
  // Renderização da grade
  // ---------------------------------------------------------------------------
  function renderGrid() {
    const grid = el.grid();
    grid.innerHTML = '';

    if (photos.length === 0) {
      renderEmpty('Nenhuma imagem encontrada.');
      return;
    }

    photos.forEach((photo, idx) => {
      const thumbUrl = currentSource === 'pexels'
        ? photo.src_medium
        : photo.medium_url;

      const largeUrl = currentSource === 'pexels'
        ? photo.src_large
        : photo.large_url;

      const authorName = currentSource === 'pexels'
        ? photo.photographer
        : photo.user;

      const alt = photo.alt || photo.tags || authorName || '';

      const div = document.createElement('div');
      div.className = 'relative group cursor-pointer overflow-hidden bg-gray-100';
      div.style.cssText = 'width: 100%; height: 100px; flex-shrink: 0; overflow: hidden;';
      div.innerHTML = `
        <img
          src="${thumbUrl}"
          alt="${alt}"
          loading="lazy"
          data-large="${largeUrl}"
          data-alt="${alt}"
          style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;"
          class="transition-transform duration-200 group-hover:scale-105"
        >
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-end">
          <span class="w-full text-white text-xs px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
            ${authorName}
          </span>
        </div>
        <div id="stock-check-${idx}"
          class="absolute inset-0 flex items-center justify-center text-4xl opacity-0 pointer-events-none transition-opacity duration-300 bg-black/10">
          ✅
        </div>
      `;

      div.addEventListener('click', () => onPhotoClick(photo, idx, largeUrl, alt));
      grid.appendChild(div);
    });
  }

  function renderEmpty(msg) {
    const grid = el.grid();
    grid.innerHTML = `<p class="col-span-3 text-center text-gray-400 text-sm py-8">${msg}</p>`;
  }

  // ---------------------------------------------------------------------------
  // Seleção de foto — baixa como Blob e envia para app.js
  // ---------------------------------------------------------------------------
  async function onPhotoClick(photo, idx, largeUrl, alt) {
    // Feedback visual imediato
    const checkEl = document.getElementById(`stock-check-${idx}`);
    if (checkEl) checkEl.style.opacity = '1';

    // Mostra overlay de loading
    showImgLoading(true);

    try {
      // Busca a imagem via backend proxy para evitar CORS
      const proxyUrl = `/image-editor/stock/proxy/?url=${encodeURIComponent(largeUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Erro ao baixar imagem: ${response.status}`);

      const blob = await response.blob();
      const name  = `stock-${currentSource}-${photo.id}-${Date.now()}`;

      // Notifica app.js com o File e metadados
      if (onSelectedCallback) {
        onSelectedCallback({
          file:     new File([blob], name + '.jpg', { type: blob.type }),
          dataUrl:  URL.createObjectURL(blob),
          name,
          alt,
          source:   currentSource,
        });
      }

      // Feedback visual e fecha overlay
      setTimeout(() => {
        if (checkEl) checkEl.style.opacity = '0';
      }, 800);
      setTimeout(() => close(), 500);
    } catch (err) {
      setError('Erro ao carregar imagem: ' + err.message);
      if (checkEl) checkEl.style.opacity = '0';
    } finally {
      showImgLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers de UI
  // ---------------------------------------------------------------------------
  function updatePagination() {
    el.pageInfo().textContent = `${currentPage} / ${totalPages}`;
    el.btnPrev().disabled     = currentPage <= 1;
    el.btnNext().disabled     = currentPage >= totalPages;
  }

  function setLoading(active) {
    el.spinner().classList.toggle('hidden', !active);
    el.grid().classList.toggle('opacity-40', active);
  }

  function showImgLoading(active) {
    el.loadingOverlay().classList.toggle('hidden', !active);
  }

  function setError(msg) {
    el.error().textContent = msg;
    el.error().classList.toggle('hidden', !msg);
  }

  // ---------------------------------------------------------------------------
  // API pública
  // ---------------------------------------------------------------------------
  return { init, open, close };
})();
