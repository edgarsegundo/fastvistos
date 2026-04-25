/**
 * gallery.js — Overlay de galeria de imagens
 *
 * Responsabilidades:
 *  - Abrir/fechar o overlay
 *  - Buscar imagens da API paginadas por group
 *  - Renderizar em modo grade (scroll vertical) ou carousel (scroll horizontal por botões)
 *  - Ao clicar/selecionar uma imagem, notificar app.js via callback
 */

const GalleryOverlay = (() => {
  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------
  const API_BASE   = 'https://fastvistos.com.br/msitesapp/api/image-editor';
  const MEDIA_BASE = 'https://sys.fastvistos.com.br/media/';
  const PAGE_LIMIT = 24;

  // ---------------------------------------------------------------------------
  // Estado interno
  // ---------------------------------------------------------------------------
  let onSelectedCallback = null;
  let currentGroup  = '';
  let currentPage   = 1;
  let totalPages    = 1;
  let viewMode      = 'grid';
  let images        = [];
  let carouselIndex = 0;
  let loading       = false;

  // ---------------------------------------------------------------------------
  // Referências ao DOM
  // ---------------------------------------------------------------------------
  const el = {
    overlay:       () => document.getElementById('overlay-gallery'),
    btnClose:      () => document.getElementById('btn-close-gallery'),
    btnGrid:       () => document.getElementById('btn-gallery-grid'),
    btnCarousel:   () => document.getElementById('btn-gallery-carousel'),
    btnPrev:       () => document.getElementById('btn-gallery-prev'),
    btnNext:       () => document.getElementById('btn-gallery-next'),
    pageInfo:      () => document.getElementById('gallery-page-info'),
    spinner:       () => document.getElementById('gallery-spinner'),
    error:         () => document.getElementById('gallery-error'),
    gridView:      () => document.getElementById('gallery-grid'),
    carouselView:  () => document.getElementById('gallery-carousel'),
    carouselImg:   () => document.getElementById('gallery-carousel-img'),
    carouselName:  () => document.getElementById('gallery-carousel-name'),
    carouselPrev:  () => document.getElementById('btn-carousel-prev'),
    carouselNext:  () => document.getElementById('btn-carousel-next'),
    carouselCount: () => document.getElementById('gallery-carousel-count'),
    btnCarouselSel:() => document.getElementById('btn-carousel-select'),
  };

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  function init(callback) {
    onSelectedCallback = callback;

    el.btnClose().addEventListener('click', close);
    el.btnGrid().addEventListener('click',     () => setViewMode('grid'));
    el.btnCarousel().addEventListener('click', () => setViewMode('carousel'));

    el.btnPrev().addEventListener('click', () => { if (currentPage > 1) loadPage(currentPage - 1); });
    el.btnNext().addEventListener('click', () => { if (currentPage < totalPages) loadPage(currentPage + 1); });

    el.carouselPrev().addEventListener('click', () => navigateCarousel(-1));
    el.carouselNext().addEventListener('click', () => navigateCarousel(+1));

    // Botão "Adicionar à lista" no carousel
    el.btnCarouselSel().addEventListener('click', () => {
      if (images.length === 0) return;
      onImageClick(images[carouselIndex]);
    });

    // Clique na imagem do carousel também seleciona
    el.carouselImg().addEventListener('click', () => {
      if (images.length === 0) return;
      onImageClick(images[carouselIndex]);
    });
  }

  // ---------------------------------------------------------------------------
  // Abre o overlay
  // ---------------------------------------------------------------------------
  function open(group) {
    currentGroup  = group;
    currentPage   = 1;
    images        = [];
    carouselIndex = 0;

    el.overlay().classList.add('open');
    setViewMode(viewMode, true);
    loadPage(1);
  }

  function close() {
    el.overlay().classList.remove('open');
  }

  // ---------------------------------------------------------------------------
  // Carrega uma página da API
  // ---------------------------------------------------------------------------
  async function loadPage(page) {
    if (loading) return;
    loading = true;
    setLoading(true);
    setError('');

    try {
      const url  = `${API_BASE}/gallery/?group=${encodeURIComponent(currentGroup)}&page=${page}&limit=${PAGE_LIMIT}`;
      const res  = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);

      images        = data.images;
      currentPage   = data.page;
      totalPages    = data.pages;
      carouselIndex = 0;

      updatePagination();
      renderCurrentView();
    } catch (err) {
      setError(err.message);
    } finally {
      loading = false;
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // View mode
  // ---------------------------------------------------------------------------
  function setViewMode(mode, skipRender = false) {
    viewMode = mode;
    const isGrid = mode === 'grid';

    el.btnGrid().classList.toggle('bg-blue-600',    isGrid);
    el.btnGrid().classList.toggle('text-white',     isGrid);
    el.btnGrid().classList.toggle('text-gray-600',  !isGrid);
    el.btnCarousel().classList.toggle('bg-blue-600',   !isGrid);
    el.btnCarousel().classList.toggle('text-white',    !isGrid);
    el.btnCarousel().classList.toggle('text-gray-600', isGrid);

    el.gridView().classList.toggle('hidden',     !isGrid);
    el.carouselView().classList.toggle('hidden', isGrid);

    if (!skipRender && images.length > 0) renderCurrentView();
  }

  function renderCurrentView() {
    if (viewMode === 'grid') renderGrid();
    else renderCarousel();
  }

  // ---------------------------------------------------------------------------
  // Grade
  // ---------------------------------------------------------------------------
  function renderGrid() {
    const grid = el.gridView();
    grid.innerHTML = '';

    if (images.length === 0) {
      grid.innerHTML = '<p class="col-span-3 text-center text-gray-400 text-sm py-8">Nenhuma imagem encontrada.</p>';
      return;
    }

    images.forEach((img, idx) => {
      const imgUrl  = buildImageUrl(img.image);
      const altText = img.alt || img.filename || '';

      const div = document.createElement('div');
      // Tamanho fixo via style, sem aspect-square do Tailwind (evita sobreposição)
      // Cantos retos: sem rounded
      div.className = 'relative group cursor-pointer overflow-hidden bg-gray-100';
      div.style.cssText = 'width: 100%; height: 100px; flex-shrink: 0;';
      div.innerHTML = `
        <img
          src="${imgUrl}"
          alt="${altText}"
          loading="lazy"
          style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;"
          class="transition-transform duration-200 group-hover:scale-105"
        >
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-end">
          <span class="w-full text-white text-xs px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
            ${img.filename || ''}
          </span>
        </div>
        <div id="gallery-check-${idx}"
          class="absolute inset-0 flex items-center justify-center text-4xl opacity-0 pointer-events-none transition-opacity duration-300 bg-black/10">
          ✅
        </div>
      `;
      div.addEventListener('click', () => onImageClick(img, idx));
      grid.appendChild(div);
    });
  }

  // ---------------------------------------------------------------------------
  // Carousel
  // ---------------------------------------------------------------------------
  function renderCarousel() {
    showCarouselImage(carouselIndex);
  }

  function showCarouselImage(idx) {
    if (images.length === 0) return;
    carouselIndex = Math.max(0, Math.min(idx, images.length - 1));
    const img = images[carouselIndex];

    el.carouselImg().src = buildImageUrl(img.image);
    el.carouselImg().alt = img.alt || img.filename || '';
    el.carouselName().textContent  = img.filename || '';
    el.carouselCount().textContent = `${carouselIndex + 1} / ${images.length}`;

    el.carouselPrev().disabled = carouselIndex === 0;
    el.carouselNext().disabled = carouselIndex === images.length - 1;
  }

  function navigateCarousel(delta) {
    showCarouselImage(carouselIndex + delta);
  }

  // ---------------------------------------------------------------------------
  // Seleção de imagem
  // ---------------------------------------------------------------------------
  function onImageClick(img, gridIdx) {
    // Feedback visual na grade
    if (viewMode === 'grid' && gridIdx !== undefined) {
      const checkEl = document.getElementById(`gallery-check-${gridIdx}`);
      if (checkEl) {
        checkEl.style.opacity = '1';
        setTimeout(() => { checkEl.style.opacity = '0'; }, 900);
      }
    }

    if (onSelectedCallback) {
      onSelectedCallback({
        filename: img.filename || `imagem-${img.id}`,
        url:      buildImageUrl(img.image),
        alt:      img.alt || '',
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers de UI
  // ---------------------------------------------------------------------------
  function updatePagination() {
    el.pageInfo().textContent  = `${currentPage} / ${totalPages}`;
    el.btnPrev().disabled      = currentPage <= 1;
    el.btnNext().disabled      = currentPage >= totalPages;
  }

  function setLoading(active) {
    el.spinner().classList.toggle('hidden', !active);
    el.gridView().classList.toggle('opacity-50', active);
    el.carouselView().classList.toggle('opacity-50', active);
  }

  function setError(msg) {
    el.error().textContent = msg;
    el.error().classList.toggle('hidden', !msg);
  }

  function buildImageUrl(imagePath) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return MEDIA_BASE + imagePath;
  }

  // ---------------------------------------------------------------------------
  // API pública
  // ---------------------------------------------------------------------------
  return { init, open, close };
})();