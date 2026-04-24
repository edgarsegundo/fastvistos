/**
 * app.js — Lógica principal da página
 *
 * Princípio fundamental:
 *   Nunca destrói o DOM da página principal.
 *   Cada função de update toca APENAS os elementos que mudaram.
 *   Overlays são abertos/fechados via CSS class, não recriados.
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

const blogArticleId = getQueryParam('blog_article_id');
const slug          = getQueryParam('slug');
const group         = getQueryParam('group');

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const state = {
  mode:         'upload',   // 'upload' | 'clipboard'
  imageFile:    null,       // File (fonte primária — sempre preferida)
  imageDataUrl: '',         // string (objectURL ou dataURL — só para preview)
  imageName:    '',
  imageGroup:   group,
  saving:       false,
  imagesSaved:  [],         // [{ filename, url, copied }]
};

// ---------------------------------------------------------------------------
// Referências ao DOM (resolvidas uma vez, não buscadas a cada update)
// ---------------------------------------------------------------------------
const dom = {
  tabUpload:          document.getElementById('tab-upload'),
  tabClipboard:       document.getElementById('tab-clipboard'),
  areaUpload:         document.getElementById('area-upload'),
  areaClipboard:      document.getElementById('area-clipboard'),
  fileInput:          document.getElementById('file-input'),
  fileLabel:          document.getElementById('file-label'),
  nameInput:          document.getElementById('name-input'),
  previewImg:         document.getElementById('preview-img'),
  previewPlaceholder: document.getElementById('preview-placeholder'),
  previewSpinner:     document.getElementById('preview-spinner'),
  imageActions:       document.getElementById('image-actions'),
  btnSave:            document.getElementById('btn-save'),
  btnAdjust:          document.getElementById('btn-adjust'),
  btnEditArticle:     document.getElementById('btn-edit-article'),
  errorMsg:           document.getElementById('error-msg'),
  imagesList:         document.getElementById('images-list'),
};

// ---------------------------------------------------------------------------
// Funções de update cirúrgicas — cada uma toca só o que precisa
// ---------------------------------------------------------------------------

function updateTabs() {
  const isUpload = state.mode === 'upload';

  dom.tabUpload.classList.toggle('bg-blue-600',    isUpload);
  dom.tabUpload.classList.toggle('text-white',     isUpload);
  dom.tabUpload.classList.toggle('text-gray-600',  !isUpload);

  dom.tabClipboard.classList.toggle('bg-blue-600',   !isUpload);
  dom.tabClipboard.classList.toggle('text-white',    !isUpload);
  dom.tabClipboard.classList.toggle('text-gray-600', isUpload);

  dom.areaUpload.classList.toggle('hidden',    !isUpload);
  dom.areaClipboard.classList.toggle('hidden', isUpload);

  // Placeholder muda conforme o modo
  dom.previewPlaceholder.textContent = isUpload
    ? 'Selecione um arquivo'
    : 'Cole uma imagem (Ctrl+V / Cmd+V)';
}

function updatePreview() {
  const hasImage = !!state.imageDataUrl;
  dom.previewImg.classList.toggle('hidden', !hasImage);
  dom.previewPlaceholder.classList.toggle('hidden', hasImage);
  if (hasImage) dom.previewImg.src = state.imageDataUrl;
}

function updateImageActions() {
  const hasImage = !!state.imageDataUrl;
  dom.imageActions.classList.toggle('hidden', !hasImage);
}

function updateSaveButton() {
  dom.btnSave.disabled    = state.saving;
  dom.btnSave.textContent = state.saving ? 'Salvando...' : 'Salvar';
}

function showPreviewSpinner(active) {
  dom.previewSpinner.classList.toggle('hidden', !active);
  dom.previewImg.classList.toggle('hidden', active || !state.imageDataUrl);
  dom.previewPlaceholder.classList.toggle('hidden', active || !!state.imageDataUrl);
}

function setError(msg, autoClear = false) {
  dom.errorMsg.textContent = msg;
  dom.errorMsg.classList.toggle('hidden', !msg);
  if (msg && autoClear) {
    setTimeout(() => setError(''), 2500);
  }
}

// Adiciona um item à lista de imagens (sem recriar a lista inteira)
function addToImageList(img, index) {
  const li = document.createElement('li');
  li.dataset.index = index;
  li.className = 'flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors';
  li.innerHTML = `
    <span class="copy-icon text-base">📋</span>
    <span class="text-sm text-gray-700 truncate">${img.filename}</span>
  `;
  li.addEventListener('click', () => onCopyUrl(index));
  dom.imagesList.prepend(li); // mais recente no topo
}

// Atualiza ícone de "copiado" de um item específico
function updateCopiedIcon(index, copied) {
  const li = dom.imagesList.querySelector(`[data-index="${index}"]`);
  if (!li) return;
  const icon = li.querySelector('.copy-icon');
  if (icon) icon.textContent = copied ? '✅' : '📋';
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

/**
 * Converte dataURL (base64) em Blob.
 * Usado apenas como fallback — o fluxo principal sempre usa File diretamente.
 */
function dataURLtoBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Sempre retorna um File pronto para upload.
 *
 * Fluxo de prioridade:
 *   1. state.imageFile já é File → usa direto (upload normal, clipboard, ou pós-ajuste)
 *   2. state.imageDataUrl é dataURL (base64) → converte via dataURLtoBlob
 *   3. Nenhum dos dois → lança erro
 *
 * Nota: objectURL (blob:...) NÃO passa pelo caso 2, porque o fluxo de clipboard
 * e pós-ajuste sempre define state.imageFile antes de setar state.imageDataUrl.
 */
function getFileForUpload() {
  if (state.imageFile) return state.imageFile;

  if (state.imageDataUrl && state.imageDataUrl.startsWith('data:')) {
    const blob = dataURLtoBlob(state.imageDataUrl);
    return new File(
      [blob],
      (state.imageName.trim() || 'imagem') + '.webp',
      { type: 'image/webp' }
    );
  }

  return null;
}

/**
 * Envia a imagem diretamente para o Django via multipart/form-data.
 * Retorna { image_url } em caso de sucesso.
 */
async function uploadImageToDjango(filename, group, alt) {
  const file = getFileForUpload();
  if (!file) throw new Error('Nenhuma imagem selecionada');

  console.log('Uploading image to Django...', { filename, group, alt, file });

  const form = new FormData();
  form.append('image', file, file.name);
  if (filename) form.append('filename', filename);
  if (group) form.append('group', group);
  if (alt) form.append('alt', alt);

  const res = await fetch(`https://sys.fastvistos.com.br/api/blogimage/upload/`, {
    method: 'POST',
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

// ---------------------------------------------------------------------------
// Handlers de evento
// ---------------------------------------------------------------------------

function setMode(newMode) {
  if (state.mode === newMode) return;
  state.mode         = newMode;
  state.imageFile    = null;
  state.imageDataUrl = '';
  state.imageName    = '';
  dom.nameInput.value       = '';
  dom.fileLabel.textContent = 'nenhum arquivo';

  updateTabs();
  updatePreview();
  updateImageActions();
  setError('');
}

dom.tabUpload.addEventListener('click',    () => setMode('upload'));
dom.tabClipboard.addEventListener('click', () => setMode('clipboard'));

// File input — upload normal
dom.fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) {
    setError('Selecione um arquivo de imagem válido', true);
    return;
  }

  // File é a fonte primária; objectURL só para preview
  state.imageFile    = file;
  state.imageName    = file.name.replace(/\.[^.]+$/, '');
  state.imageDataUrl = URL.createObjectURL(file);

  dom.nameInput.value       = state.imageName;
  dom.fileLabel.textContent = file.name;

  updatePreview();
  updateImageActions();
  setError('');
});

// Name input — atualiza estado sem re-render
dom.nameInput.addEventListener('input', (e) => {
  state.imageName = e.target.value;
});

// Clipboard paste
document.addEventListener('paste', (e) => {
  if (state.mode !== 'clipboard') return;
  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();

      // File é a fonte primária; objectURL só para preview
      state.imageFile    = file;
      state.imageName    = 'imagem-' + Date.now();
      state.imageDataUrl = URL.createObjectURL(file);

      dom.nameInput.value = state.imageName;

      updatePreview();
      updateImageActions();
      setError('');
      return;
    }
  }
  setError('Nenhuma imagem no clipboard', true);
});

// Salvar imagem
dom.btnSave.addEventListener('click', async () => {
  if (!state.imageName.trim()) {
    setError('Digite um nome para o arquivo', true);
    return;
  }
  if (!state.imageFile && !state.imageDataUrl) {
    setError('Nenhuma imagem selecionada', true);
    return;
  }

  state.saving = true;
  updateSaveButton();
  showPreviewSpinner(true);
  setError('');

  try {
    const imageName = state.imageName.trim() + '.webp';
    const altValue = document.getElementById('adj-alt')?.value || '';
    const data = await uploadImageToDjango(imageName, state.imageGroup, altValue);

    const savedImg = {
      filename: imageName,
      url:      data.image_url,
      copied:   false,
    };
    const newIndex = state.imagesSaved.length;
    state.imagesSaved.push(savedImg);
    addToImageList(savedImg, newIndex);

    // Limpa estado da imagem após upload bem-sucedido
    state.imageFile    = null;
    state.imageDataUrl = '';
    state.imageName    = '';
    dom.nameInput.value       = '';
    dom.fileLabel.textContent = 'nenhum arquivo';
    dom.fileInput.value       = '';

    updatePreview();
    updateImageActions();
  } catch (err) {
    setError(err.message);
  } finally {
    state.saving = false;
    updateSaveButton();
    showPreviewSpinner(false);
  }
});

// Copiar URL da imagem salva como markdown
function onCopyUrl(index) {
  const img = state.imagesSaved[index];
  if (!img) return;

  const mdUrl = `![${img.filename}](${img.url})`;
  navigator.clipboard.writeText(mdUrl).catch(() => {
    // Fallback para ambientes sem permissão de clipboard
    const ta = document.createElement('textarea');
    ta.value = mdUrl;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });

  img.copied = true;
  updateCopiedIcon(index, true);
  setTimeout(() => {
    img.copied = false;
    updateCopiedIcon(index, false);
  }, 1500);
}

// Botão Ajustar
dom.btnAdjust.addEventListener('click', () => {
  AdjustOverlay.open(state.imageDataUrl);
});

// Botão Editar Artigo
dom.btnEditArticle.addEventListener('click', () => {
  EditArticleOverlay.open();
});

// ---------------------------------------------------------------------------
// Inicialização dos overlays
// ---------------------------------------------------------------------------

/**
 * Callback do AdjustOverlay.
 *
 * adjust.js usa canvas.toBlob() → entrega um Blob.
 * Convertemos para File e geramos um objectURL para preview,
 * mantendo state.imageFile como fonte primária para upload.
 */
AdjustOverlay.init((result) => {
  if (result instanceof Blob) {
    const name = (state.imageName.trim() || 'imagem') + '.webp';
    const file  = new File([result], name, { type: 'image/webp' });

    state.imageFile    = file;
    state.imageDataUrl = URL.createObjectURL(result);
  } else {
    // Fallback para dataURL (caso futuro ou legacy)
    state.imageFile    = null;
    state.imageDataUrl = result;
  }

  updatePreview();
});

EditArticleOverlay.init(blogArticleId);

// Estado inicial das tabs
updateTabs();