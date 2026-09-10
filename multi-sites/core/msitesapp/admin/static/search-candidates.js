/**
 * search-candidates.js — Seção "Imagens encontradas (busca automática)"
 *
 * Mostra as candidatas geradas pela task `image-search` do cron-manager
 * (SerpAPI) para o slug deste artigo, e deixa enviar pro servidor com um
 * clique — reaproveitando peças já existentes e testadas:
 *
 *   - GET  .../image-editor/stock/google-proxy/?url=...   (baixa a imagem
 *     externa sem problema de CORS/hotlink — mesmo proxy que a aba "URL
 *     direta" do StockGalleryOverlay já usa)
 *   - POST https://sys.fastvistos.com.br/api/blogimage/upload/  (Django,
 *     mesmo endpoint que o botão "Salvar" já usa — cria a linha em blog_image)
 *   - POST .../image-editor/articles/:id/set-main-image/  (já existe)
 *
 * Não toca em app.js/state — módulo autocontido.
 */
const SearchCandidatesSection = (() => {

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const ARTICLES_API_BASE = isLocal ? '/image-editor/articles' : '/msitesapp/api/image-editor/articles';
  const STOCK_API_BASE    = isLocal ? '/image-editor/stock'    : '/msitesapp/api/image-editor/stock';
  const DJANGO_UPLOAD_URL = 'https://sys.fastvistos.com.br/api/blogimage/upload/';

  let blogArticleId = null;
  let group = null;

  const el = {
    section: () => document.getElementById('search-candidates-section'),
    grid:    () => document.getElementById('search-candidates-grid'),
  };

  async function init(articleId, articleGroup) {
    blogArticleId = articleId;
    group = articleGroup;
    if (!blogArticleId || !group) return;

    try {
      const url = `${ARTICLES_API_BASE}/${blogArticleId}/search-candidates/?group=${encodeURIComponent(group)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);

      const images = data.images || [];
      if (images.length === 0) return; // seção fica escondida (sem candidatas, expirado, etc.)

      render(images);
      el.section().classList.remove('hidden');
    } catch (err) {
      console.error('Erro ao carregar imagens candidatas (image-search):', err);
      // Best-effort: a seção só não aparece, não quebra o resto da página.
    }
  }

  /** true só para URLs http(s) reais — evita valores estranhos indo pro atributo src. */
  function isSafeHttpUrl(url) {
    try {
      return ['http:', 'https:'].includes(new URL(url).protocol);
    } catch {
      return false;
    }
  }

  /**
   * Constrói o card via createElement/textContent — nunca via innerHTML com
   * dados da candidata. title/source/query vêm do SerpAPI (conteúdo de
   * páginas de terceiros indexadas pelo Google Images) e não são confiáveis;
   * textContent nunca interpreta HTML, então não há injeção possível.
   */
  function buildCard(candidate, idx) {
    const card = document.createElement('div');
    card.className = 'relative border border-gray-100 rounded-lg overflow-hidden bg-gray-50';
    card.dataset.idx = idx;
    applyCardState(card, candidate.already_sent);

    const imgWrap = document.createElement('div');
    imgWrap.className = 'cursor-pointer';
    imgWrap.style.cssText = 'aspect-ratio:1/1;overflow:hidden;';

    const img = document.createElement('img');
    const thumb = candidate.thumbnail || candidate.url;
    img.src = isSafeHttpUrl(thumb) ? thumb : '';
    img.alt = candidate.title || '';
    img.loading = 'lazy';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    img.addEventListener('error', () => { imgWrap.style.display = 'none'; });
    imgWrap.appendChild(img);

    const info = document.createElement('div');
    info.className = 'p-1';

    const sourceLabel = document.createElement('p');
    sourceLabel.className = 'text-[10px] text-gray-500 truncate';
    sourceLabel.title = candidate.query || '';
    sourceLabel.textContent = candidate.source || '';
    info.appendChild(sourceLabel);

    const btn = document.createElement('button');
    btn.className = 'btn-send-only w-full text-[10px] mt-1 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed';
    btn.disabled = Boolean(candidate.already_sent);
    btn.textContent = candidate.already_sent ? 'Enviada' : 'Enviar';
    info.appendChild(btn);

    const spinner = document.createElement('div');
    spinner.className = 'card-spinner absolute inset-0 bg-white/70 hidden items-center justify-center text-lg';
    spinner.textContent = '⏳';

    card.appendChild(imgWrap);
    card.appendChild(info);
    card.appendChild(spinner);

    if (!candidate.already_sent) {
      imgWrap.addEventListener('click', () => handleSend(card, candidate, { setAsMain: true }));
    }
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSend(card, candidate, { setAsMain: false });
    });

    return card;
  }

  function render(images) {
    const grid = el.grid();
    grid.innerHTML = '';
    images.forEach((candidate, idx) => grid.appendChild(buildCard(candidate, idx)));
  }

  function applyCardState(card, alreadySent) {
    card.style.opacity = alreadySent ? '0.4' : '1';
  }

  function setCardLoading(card, loading) {
    const spinner = card.querySelector('.card-spinner');
    spinner.classList.toggle('hidden', !loading);
    spinner.classList.toggle('flex', loading);
  }

  const KNOWN_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif', 'tiff', 'svg']);

  /** Extensão real da candidata (image-search já garante que a URL termina numa dessas). */
  function extensionFromUrl(url) {
    try {
      const ext = new URL(url).pathname.split('.').pop().toLowerCase();
      return KNOWN_IMAGE_EXTENSIONS.has(ext) ? ext : 'jpg';
    } catch {
      return 'jpg';
    }
  }

  async function handleSend(card, candidate, { setAsMain }) {
    if (candidate.already_sent) return;
    setCardLoading(card, true);
    try {
      const imgRes = await fetch(`${STOCK_API_BASE}/google-proxy/?url=${encodeURIComponent(candidate.url)}`);
      if (!imgRes.ok) {
        const err = await imgRes.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${imgRes.status}`);
      }
      const blob = await imgRes.blob();

      const form = new FormData();
      form.append('image', blob, candidate.upload_filename + '.' + extensionFromUrl(candidate.url));
      form.append('filename', candidate.upload_filename);
      form.append('group', group);
      if (candidate.title) form.append('alt', candidate.title);

      const upRes = await fetch(DJANGO_UPLOAD_URL, { method: 'POST', body: form });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error || `Erro ${upRes.status}`);

      if (setAsMain) {
        await fetch(`${ARTICLES_API_BASE}/${blogArticleId}/set-main-image/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: upData.image_url }),
        });
      }

      candidate.already_sent = true;
      applyCardState(card, true);
      const btn = card.querySelector('.btn-send-only');
      btn.disabled = true;
      btn.textContent = 'Enviada';
      const imgWrap = card.querySelector('div.cursor-pointer');
      imgWrap.replaceWith(imgWrap.cloneNode(true)); // remove o listener de clique
    } catch (err) {
      console.error('Erro ao enviar imagem candidata:', err);
      alert('Falha ao enviar imagem: ' + err.message);
    } finally {
      setCardLoading(card, false);
    }
  }

  return { init };
})();
