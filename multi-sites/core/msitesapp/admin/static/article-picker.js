/**
 * article-picker.js — Navegação para trocar de artigo
 *
 * Fluxo: escolher business -> escolher topic (opcional) -> buscar/paginar artigos
 * -> ao clicar em um artigo, navega para image-uploader.html já carregado com ele.
 */

const API_BASE = 'https://fastvistos.com.br/msitesapp/api/image-editor';
const PAGE_LIMIT = 20;

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

const token = getQueryParam('token');
const preselectedBusinessId = getQueryParam('business_id');

const state = {
  businesses: [],   // [{ id, name, display_name }]
  currentPage: 1,
  totalPages: 1,
  loading: false,
};

const dom = {
  selectBusiness: document.getElementById('select-business'),
  selectTopic:    document.getElementById('select-topic'),
  searchInput:    document.getElementById('search-input'),
  btnSearch:      document.getElementById('btn-search'),
  spinner:        document.getElementById('spinner'),
  error:          document.getElementById('error'),
  articleList:    document.getElementById('article-list'),
  btnPrev:        document.getElementById('btn-prev'),
  btnNext:        document.getElementById('btn-next'),
  pageInfo:       document.getElementById('page-info'),
};

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
async function init() {
  dom.selectBusiness.addEventListener('change', onBusinessChange);
  dom.selectTopic.addEventListener('change', () => loadArticles(1));
  dom.btnSearch.addEventListener('click', () => loadArticles(1));
  dom.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadArticles(1);
  });
  dom.btnPrev.addEventListener('click', () => { if (state.currentPage > 1) loadArticles(state.currentPage - 1); });
  dom.btnNext.addEventListener('click', () => { if (state.currentPage < state.totalPages) loadArticles(state.currentPage + 1); });

  await loadBusinesses();
  await loadArticles(1);
}

// ---------------------------------------------------------------------------
// Businesses / Topics
// ---------------------------------------------------------------------------
async function loadBusinesses() {
  try {
    const res = await fetch(`${API_BASE}/businesses/`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);

    state.businesses = data.businesses || [];
    dom.selectBusiness.innerHTML = '<option value="">Todos os businesses</option>' +
      state.businesses.map(b => `<option value="${b.id}">${b.display_name || b.name}</option>`).join('');

    if (preselectedBusinessId && state.businesses.some(b => b.id === preselectedBusinessId)) {
      dom.selectBusiness.value = preselectedBusinessId;
      await loadTopics(preselectedBusinessId);
    }
  } catch (err) {
    setError(err.message);
  }
}

async function onBusinessChange() {
  const businessId = dom.selectBusiness.value;
  await loadTopics(businessId);
  loadArticles(1);
}

async function loadTopics(businessId) {
  dom.selectTopic.innerHTML = '<option value="">Todos os tópicos</option>';
  dom.selectTopic.disabled = true;
  if (!businessId) return;

  try {
    const res = await fetch(`${API_BASE}/blog-topics/?business_id=${encodeURIComponent(businessId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);

    const topics = data.topics || [];
    dom.selectTopic.innerHTML = '<option value="">Todos os tópicos</option>' +
      topics.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
    dom.selectTopic.disabled = false;
  } catch (err) {
    setError(err.message);
  }
}

// ---------------------------------------------------------------------------
// Artigos
// ---------------------------------------------------------------------------
async function loadArticles(page) {
  if (state.loading) return;
  state.loading = true;
  setLoading(true);
  setError('');

  try {
    const params = new URLSearchParams();
    const businessId = dom.selectBusiness.value;
    const topicId = dom.selectTopic.value;
    const search = dom.searchInput.value.trim();

    if (businessId) params.set('business_id', businessId);
    if (topicId) params.set('blog_topic_id', topicId);
    if (search) params.set('search', search);
    params.set('page', page);
    params.set('limit', PAGE_LIMIT);

    const res = await fetch(`${API_BASE}/articles-list/?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);

    state.currentPage = data.page;
    state.totalPages = data.pages || 1;
    renderArticles(data.articles || []);
    updatePagination();
  } catch (err) {
    setError(err.message);
    renderArticles([]);
  } finally {
    state.loading = false;
    setLoading(false);
  }
}

function renderArticles(articles) {
  if (articles.length === 0) {
    dom.articleList.innerHTML = '<p class="text-center text-gray-400 text-sm py-8">Nenhum artigo encontrado.</p>';
    return;
  }

  dom.articleList.innerHTML = '';
  articles.forEach((article) => {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between gap-2 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors';
    div.innerHTML = `
      <div class="min-w-0">
        <p class="text-sm font-medium text-gray-800 truncate">${article.title || '(Sem título)'}</p>
        <p class="text-xs text-gray-400 truncate">${article.slug || ''}</p>
      </div>
      ${article.image ? '<span class="text-xs shrink-0">🖼️</span>' : '<span class="text-xs shrink-0 text-gray-300">—</span>'}
    `;
    div.addEventListener('click', () => goToArticle(article));
    dom.articleList.appendChild(div);
  });
}

function goToArticle(article) {
  const business = state.businesses.find(b => b.id === article.business_id);
  const group = business ? business.name : '';

  const params = new URLSearchParams();
  params.set('blog_article_id', article.id);
  if (token) params.set('token', token);
  if (group) params.set('group', group);

  window.location.href = `image-uploader?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Helpers de UI
// ---------------------------------------------------------------------------
function updatePagination() {
  dom.pageInfo.textContent = `${state.currentPage} / ${state.totalPages}`;
  dom.btnPrev.disabled = state.currentPage <= 1;
  dom.btnNext.disabled = state.currentPage >= state.totalPages;
}

function setLoading(active) {
  dom.spinner.classList.toggle('hidden', !active);
}

function setError(msg) {
  dom.error.textContent = msg;
  dom.error.classList.toggle('hidden', !msg);
}

init();
