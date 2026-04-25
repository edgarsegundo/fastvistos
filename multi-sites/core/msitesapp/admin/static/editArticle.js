/**
 * editArticle.js — Overlay de edição de artigo (Markdown)
 *
 * Responsabilidades:
 *  - Abrir/fechar o overlay
 *  - Buscar o conteúdo markdown via API ao abrir
 *  - Salvar o conteúdo editado via API
 *
 * Não tem dependência de app.js — é completamente independente.
 */

const EditArticleOverlay = (() => {
  // --- Config ---
  const API_BASE = 'https://fastvistos.com.br/msitesapp/api/image-editor';

  // --- Referências ao DOM ---
  const el = {
    overlay:  () => document.getElementById('overlay-edit-article'),
    spinner:  () => document.getElementById('edit-article-spinner'),
    textarea: () => document.getElementById('edit-article-textarea'),
    error:    () => document.getElementById('edit-article-error'),
    btnSave:  () => document.getElementById('btn-save-article'),
    btnClose: () => document.getElementById('btn-close-edit-article'),
    mainImageSelect: () => document.getElementById('main-image-select'),
  };

    let articleId = '';
    let imagesSavedRef = [];

  // --- Inicializa eventos (chamado uma vez pelo app.js) ---
  function init(blogArticleId, getImagesSaved) {
    articleId = blogArticleId;
    if (getImagesSaved) imagesSavedRef = getImagesSaved;
    el.btnClose().addEventListener('click', close);
    el.btnSave().addEventListener('click', save);
  }

  // --- Abre o overlay e carrega o conteúdo ---
  async function open() {
    // Limpa estado anterior
    setError('');
    el.textarea().value = '';
    setLoading(true);

    el.overlay().classList.add('open');

    try {
      const res  = await fetch(`${API_BASE}/articles/${articleId}/content-md/`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erro ${res.status} ao buscar conteúdo`);
      el.textarea().value = data.content_md ?? '';
      // Popular select de imagens
      updateMainImageSelect();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    // Atualiza a combobox de imagens
    function updateMainImageSelect() {
      const select = el.mainImageSelect();
      // Limpa opções antigas, exceto a primeira
      while (select.options.length > 1) select.remove(1);
      const imgs = typeof imagesSavedRef === 'function' ? imagesSavedRef() : imagesSavedRef;
      imgs.forEach((img, idx) => {
        const opt = document.createElement('option');
        opt.value = img.url;
        opt.textContent = img.filename;
        select.appendChild(opt);
      });
    }
  }

  // --- Fecha o overlay ---
  function close() {
    el.overlay().classList.remove('open');
  }

  // --- Salva o conteúdo via API ---
  async function save() {
    const content_md = el.textarea().value;
    const mainImageUrl = el.mainImageSelect().value;
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/articles/${articleId}/save-content-md/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blog_article_id: articleId, content_md, main_image_url: mainImageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erro ${res.status} ao salvar`);
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // --- Helpers de UI ---
  function setLoading(active) {
    el.spinner().classList.toggle('hidden', !active);
    el.textarea().classList.toggle('hidden', active);
  }

  function setSaving(active) {
    el.btnSave().disabled = active;
    el.btnSave().textContent = active ? 'Salvando...' : 'Salvar artigo';
  }

  function setError(msg) {
    const errEl = el.error();
    errEl.textContent = msg;
    errEl.classList.toggle('hidden', !msg);
  }

  // --- API pública ---
  return { init, open, close };
})();

// Garante que EditArticleOverlay está no escopo global
window.EditArticleOverlay = EditArticleOverlay;