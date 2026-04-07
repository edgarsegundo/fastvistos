# SPEC: Blog Image Editor — Ferramenta de Inserção de Imagens em Artigos

> **Status:** DRAFT — para revisão antes de codificar  
> **Uso:** Somente em desenvolvimento local (`localhost:3000`). Salva no banco de dados de produção no VPS.

---

## 1. Objetivo

Permitir que, durante o desenvolvimento local (`pubpre <siteId>`), o autor insira imagens em artigos de três maneiras e edite o conteúdo bruto do artigo:

1. **Paste** — imagem no clipboard (Cmd+V / Ctrl+V) após clicar em um parágrafo
2. **Upload** — seleção de arquivo local
3. **URL externa** — colar uma URL de imagem de outro domínio
4. **Editar `content_md`** — abrir um editor de texto (textarea grande) com o conteúdo bruto do artigo, editar livremente e salvar no DB

Em todos os casos, o `content_md` é lido do Django no VPS, modificado localmente, e salvo de volta via endpoint.

---

## 2. Escopo

| Escopo | Incluso |
|--------|---------|
| Ambiente de uso | Somente `localhost` (dev) |
| Save destino | Django DB no VPS (produção) |
| Preview visual imediato | Sim (DOM manipulation, sem rebuild Astro) |
| Autenticação | Nenhuma (local only) |
| Sites suportados | Todos que usam o template core (`multi-sites/core/`) |
| Processamento de imagem | Resize + conversão para WebP via FFmpeg no VPS |
| Editor raw de `content_md` | Sim — textarea completa, salva no DB |

---

## 3. Arquitetura

### 3.1. Diagrama

```
┌──────────────────────────────────────────────────────────────────┐
│  BROWSER  (localhost:3000 — Astro Vite dev server)               │
│                                                                  │
│  blog-image-editor.js                                            │
│  ├─ Renderiza placeholders <!--[[INSERIR IMAGEM:...]]-->          │
│  │  como botões clicáveis visíveis                               │
│  ├─ Ouve paste global (Cmd+V) com imagem no clipboard            │
│  ├─ Rastreia último parágrafo/elemento clicado                   │
│  └─ Exibe modal: preview + alt text + confirmar                  │
│                                                                  │
│  Chamadas HTTP (URLs relativas → Vite proxy):                    │
│  ├─ GET  /image-editor/content-md?slug={slug}                    │
│  ├─ POST /image-editor/save-md                                   │
│  ├─ POST /image-upload/upload                                    │
│  └─ (editor raw reutiliza GET/POST acima)                        │
└───────────────────┬──────────────────────────────────────────────┘
                    │ Vite proxy (astro.config.mjs server.proxy)
        ┌───────────┴───────────────┐
        │                           │
        ▼                           ▼
┌───────────────────┐   ┌──────────────────────────────────────────┐
│  VPS — Django API │   │  VPS — Image Service (Node.js + FFmpeg)  │
│  (já existe)      │   │  (NOVO — a criar e rodar no VPS)         │
│                   │   │                                          │
│  GET  /api/       │   │  POST /upload                            │
│   articles/       │   │  ├─ Recebe multipart/form-data           │
│   {slug}/         │   │  │  { file, siteId, slug }               │
│   content-md/     │   │  ├─ FFmpeg: resize → WebP                │
│                   │   │  ├─ Salva em:                            │
│  POST /api/       │   │  │  /public/{siteId}/assets/             │
│   articles/       │   │  │  images/blog/{slug}/{filename}.webp   │
│   {slug}/         │   │  └─ Retorna { url, width, height }       │
│   save-content-md/│   │                                          │
│                   │   │  Porta: IMAGE_SERVICE_PORT (ex: 8091)    │
│  Persiste         │   │  PM2: pm2 start image-service.js         │
│  content_md no DB │   │  --name image-service                    │
└───────────────────┘   └──────────────────────────────────────────┘
```

### 3.2. Por que Vite proxy (sem servidor local extra)

O Astro dev server é um servidor Vite. O Vite tem suporte nativo a `server.proxy` no `astro.config.mjs`. Isso significa:

- Sem nova porta para gerenciar localmente
- Sem novo processo para iniciar
- O browser chama URLs **relativas** (sem CORS)
- Todos os requests passam pelo Vite como proxy reverso para o VPS
- Funciona apenas em `vite dev` (não em build de produção)

---

## 4. Fluxos de Uso (UX)

### 4.1. Paste de clipboard após clicar num parágrafo

```
1. Usuário clica em qualquer parágrafo/heading/lista do artigo
   → blog-image-editor.js marca o elemento como lastClickedTarget
   → Highlight visual sutil (borda pontilhada azul)

2. Usuário copia uma imagem para o clipboard (screenshot, etc.)

3. Usuário pressiona Cmd+V / Ctrl+V em qualquer lugar da página
   → Se clipboard tem imagem (clipboardData.files[0] type=image/*)
   → Intercept do evento paste (preventDefault)
   → Exibir modal ImageInsertModal com:
      - Preview da imagem
      - Campo "Alt text" (pré-preenchido com slug do artigo)
      - Botão "Inserir imagem" | Botão "Cancelar"

4. Usuário confirma
   → POST /image-upload/upload {file, siteId, slug}
   → Recebe { url, width, height }
   → GET /image-editor/content-md?slug={slug}
   → Algoritmo text-matching encontra posição no content_md
   → Insere <img src="{url}" alt="{altText}" /> depois do bloco
   → POST /image-editor/save-md { slug, content_md }
   → DOM: insere <img> depois do elemento clicado (preview)
   → Toast: "Imagem inserida e salva ✓"
```

### 4.2. Upload de arquivo local

```
Mesmo fluxo que 4.1, mas o modal tem dois modos:
- Tab "Clipboard" (paste, ativo por default)
- Tab "Upload" (input file type=image/*)

Ao selecionar arquivo via file input, exibe preview e segue o mesmo
fluxo do passo 4 em diante.
```

### 4.3. Inserção via placeholder `<!--[[INSERIR IMAGEM: ...]]-->`

```
1. blog-image-editor.js encontra comentários HTML com INSERIR IMAGEM
   → Substituídos por botões visíveis com texto da descrição:
   
   [📷 passaporte brasileiro com carimbo de visto...]  ← botão clicável

2. Usuário clica no botão
   → Mesmo modal ImageInsertModal, com:
      - Alt text pré-preenchido com a descrição do placeholder
      - Tabs: Clipboard / Upload / URL externa

3. Usuário confirma
   → Upload/URL processado normalmente
   → No content_md, a linha do placeholder é SUBSTITUÍDA pelo <img>
     (não inserida depois — é substituição direta)
   → DOM: button substituído por <img> (preview)
```

### 4.4. Inserção de URL externa

```
Disponível no modal como terceira tab "URL externa":
- Campo input para URL da imagem
- Campo alt text
- Preview carregado ao perder foco do campo URL
- "Inserir imagem" → NÃO faz upload, apenas:
  → GET /image-editor/content-md
  → Insere <img src="{externalUrl}" alt="{altText}" />
  → POST /image-editor/save-md
  → Preview DOM
```

### 4.5. Edição direta do `content_md` (editor raw)

```
1. Um botão fixo flutuante "✏️ Editar MD" fica visível em todas as
   páginas de artigo em modo DEV.
   Posição: bottom-left (para não conflitar com o toast bottom-right).

2. Usuário clica em "✏️ Editar MD"
   → GET /image-editor/api/articles/{slug}/content-md/
   → Abre ContentMdEditorModal com:
      - Textarea grande (100% width, ~80vh de altura)
      - Conteúdo preenchido com o content_md atual
      - Fonte monospace para facilitar leitura
      - Contagem de chars/linhas (live, no rodapé do modal)
      - Botão "💾 Salvar" | Botão "✕ Cancelar"
      - Botão "↺ Recarregar do DB" (descarta edições locais e recarrega)

3. Usuário edita livremente o markdown no textarea

4. Usuário clica em "💾 Salvar"
   → POST /image-editor/api/articles/{slug}/save-content-md/
      { slug, siteId, content_md: <valor atual do textarea> }
   → Sucesso: toast "content_md salvo ✓" + fechar modal
   → Erro: toast de erro vermelho (modal permanece aberto)

5. Preview visual:
   → NÃO há rebuild automático do Astro.
   → Após salvar, o modal fecha. O artigo visível na página
     permanece com o HTML anterior (sem atualização de DOM).
   → Para ver as mudanças renderizadas, o usuário recarrega a página.
     (O Astro dev server em watch mode recompila automaticamente
      quando o .md local muda — mas aqui a mudança é só no DB.
      A recarga manual traz o HTML atual do Astro, que lê o .md local.
      Para ver o novo content_md: rodar pubpre novamente.)
   → Opcional — após fechar o modal, exibir banner amarelo:
     "content_md atualizado no DB. Recarregue a página ou rode pubpre
      para ver as mudanças."
```

---

## 5. Componentes a Implementar

### 5.1. [LOCAL] `multi-sites/core/lib/blog-image-editor.js`

**Arquivo novo. Script vanilla JS, sem dependências.**

#### Constantes e configuração (início do arquivo)

```js
// Lidas de window.__BLOG_EDITOR_CONFIG__ (injetado pelo Astro template)
// {
//   slug: string,       // slug do artigo atual
//   siteId: string,     // ex: 'centraldevistos'
//   proxyBase: ''       // sempre '' (paths relativos via Vite proxy)
// }
```

#### Funções a implementar

| Função | Descrição |
|--------|-----------|
| `init()` | Entry point. Chama todas as funções de setup abaixo. |
| `renderImagePlaceholders()` | Busca comentários `<!--[[INSERIR IMAGEM: ...]]-->` no DOM usando `TreeWalker(SHOW_COMMENT)`. Substitui cada um por um `<button class="img-placeholder-btn">`. Armazena no dataset do button: `data-placeholder-text="{descrição}"` e `data-mode="placeholder"`. |
| `setupClickTracking()` | Adiciona listener `click` no `document`. Filtra cliques em elementos tipo `p, li, h2, h3, h4, blockquote, td`. Armazena o elemento em `window.__lastClickedTarget`. Adiciona classe CSS `img-target-highlight` ao elemento (remove da anterior). |
| `setupPasteHandler()` | Adiciona listener `paste` no `document`. Se `clipboardData.files` tem imagem → `preventDefault()` → chama `openModal({mode: 'clipboard', file, altText: ''})`. |
| `openModal(opts)` | Renderiza o modal `ImageInsertModal` como elemento DOM fixo. `opts = { mode: 'clipboard'|'upload'|'url'|'placeholder', file?, url?, altText?, placeholderComment? }`. |
| `handleInsert(imageUrl, altText, mode)` | Orquestra: fetch content_md → find insertion point → modify → save → DOM preview → close modal → show toast. |
| `uploadImage(file)` | `POST /image-upload/upload` com `FormData { file, siteId, slug }`. Retorna `{ url, width, height }`. |
| `fetchContentMd(slug)` | `GET /image-editor/content-md?slug={slug}`. Retorna `string` com o content_md. |
| `saveContentMd(slug, contentMd)` | `POST /image-editor/save-md` com `{ slug, siteId, content_md }`. |
| `findInsertionLine(contentMd, targetEl, mode, placeholderText?)` | Ver Seção 6. Retorna `{ lineIndex, isPlaceholder }`. |
| `insertImageInMd(contentMd, lineIndex, imgTag, isPlaceholder)` | Insere ou substitui. Se `isPlaceholder=true`: substitui a linha inteira pelo `imgTag`. Se `false`: insere `\n{imgTag}\n` após a linha `lineIndex`. Retorna novo `contentMd`. |
| `injectImageInDOM(targetEl, imgHtml, mode)` | Insere `<img>` no DOM para preview visual imediato. Se `mode=placeholder`: substitui o button. Senão: insere `afterend` de `targetEl`. |
| `showToast(message, type)` | Mostra notificação flutuante (success/error) por 3s. |
| `buildImgTag(url, altText)` | Retorna `<img src="{url}" alt="{altText}" />`. |
| `setupMdEditorButton()` | Cria o botão flutuante fixo "✏️ Editar MD" (bottom-left) e adiciona ao `document.body`. Ao clicar, chama `openMdEditor()`. |
| `openMdEditor()` | Faz `fetchContentMd(slug)` e renderiza o `ContentMdEditorModal` com o textarea preenchido. |
| `closeMdEditor()` | Remove o modal do DOM. |
| `saveMdFromEditor(newContentMd)` | Chama `saveContentMd(slug, newContentMd)`. Em sucesso: fecha modal, mostra toast, exibe banner de aviso de recarga. Em erro: mostra toast de erro sem fechar modal. |
| `reloadMdFromDb()` | Dentro do modal — chama `fetchContentMd(slug)` e reescreve o textarea com o valor fresco do DB. |

#### Estilos inline (injetados via JS no `<head>`)

O script injeta um `<style id="blog-image-editor-styles">` com:
- `.img-placeholder-btn`: botão destacado, cor laranja, ícone 📷
- `.img-target-highlight`: borda pontilhada azul no elemento clicado
- `#img-insert-modal`: modal overlay com backdrop
- `.img-toast`: notificação flutuante bottom-right
- `#md-editor-fab`: botão FAB fixo bottom-left (fundo escuro, texto branco, z-index alto)
- `#md-editor-modal`: modal fullscreen (z-index > `#img-insert-modal`), com:
  - Header: título "Editar content_md — {slug}" + botões Recarregar / Fechar
  - Body: `<textarea id="md-editor-textarea">` — `width: 100%`, `height: ~80vh`, `font-family: monospace`, `font-size: 13px`, sem resize horizontal
  - Footer: contagem "X linhas · Y chars" (atualizada no evento `input`) + botão Cancelar + botão Salvar
- `#md-editor-banner`: banner amarelo fixo no topo da página pós-save (z-index alto, mostra/esconde via classe CSS)

---

### 5.2. [LOCAL] `astro.config.mjs` — adicionar Vite proxy

Adicionar dentro do `defineConfig({...})`:

```js
vite: {
  server: {
    proxy: {
      // Proxy para o Django no VPS (GET/POST content-md)
      '/image-editor': {
        target: process.env.DJANGO_API_BASE_URL,  // ex: https://72.60.57.150:8000
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/image-editor/, ''),
        // GET  /image-editor/content-md?slug=X  →  GET  /api/articles/X/content-md/
        // POST /image-editor/save-md            →  POST /api/articles/{slug}/save-content-md/
        // (o slug vai no body do POST, não na URL do path — ver Seção 7)
      },
      // Proxy para o Image Service no VPS (upload)
      '/image-upload': {
        target: process.env.IMAGE_SERVICE_URL,    // ex: http://72.60.57.150:8091
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/image-upload/, ''),
        // POST /image-upload/upload  →  POST /upload
      },
    },
  },
},
```

> **Nota:** O `vite` block pode já existir no `astro.config.mjs` (tem o `tailwindcss` plugin). Adicionar `server.proxy` dentro do `vite` existente.

---

### 5.3. [LOCAL] `multi-sites/core/pages/blog/[...slug].astro` — injetar script

**Este é o template fonte.** Após modificar aqui, rodar `node sync-blog.js <siteId>` para propagar.

Adicionar ao final do template, antes ou depois do `<script>` do `toggleFaq`:

```astro
{import.meta.env.DEV && (
  <Fragment>
    <script define:vars={{
      BLOG_EDITOR_CONFIG: {
        slug: entry.slug,
        siteId: (import.meta.env.SITE_ID || 'unknown'),
        proxyBase: '',
      }
    }}>
      window.__BLOG_EDITOR_CONFIG__ = BLOG_EDITOR_CONFIG;
    </script>
    <script is:inline src="/blog-image-editor.js"></script>
  </Fragment>
)}
```

> **Nota sobre `SITE_ID`:** O env var `SITE_ID` é passado pelo `dev-with-sync.js` via `env: { ...process.env, SITE_ID: siteId }`. `import.meta.env.SITE_ID` ficará disponível no Astro em dev.

O arquivo `blog-image-editor.js` precisa estar em `public/` de cada site **ou** em um lugar acessível pelo Astro dev server. **Opção recomendada:** copiar o arquivo para `multi-sites/core/public/blog-image-editor.js` — o Astro serve arquivos de `public/` diretamente na raiz.

---

### 5.4. [VPS] Django — dois endpoints novos

**Spec para o desenvolvedor implementar no Django.**

#### `GET /api/articles/{slug}/content-md/`

```
Response 200:
{
  "slug": "reverter-negativa-visto-americano",
  "content_md": "---\ntitle: ...\n---\n\n## Introdução..."
}

Response 404:
{
  "error": "Article not found"
}
```

Implementação sugerida:
```python
# views.py
from django.http import JsonResponse
from .models import Article  # ajustar para o model real

def get_content_md(request, slug):
    try:
        article = Article.objects.get(slug=slug)
        return JsonResponse({'slug': slug, 'content_md': article.content_md or ''})
    except Article.DoesNotExist:
        return JsonResponse({'error': 'Article not found'}, status=404)

# urls.py
path('api/articles/<slug:slug>/content-md/', views.get_content_md),
```

#### `POST /api/articles/{slug}/save-content-md/`

```
Request body (JSON):
{
  "slug": "reverter-negativa-visto-americano",
  "siteId": "centraldevistos",
  "content_md": "---\ntitle: ...\n---\n\n## Introdução...\n<img src='...' alt='...' />"
}

Response 200:
{
  "ok": true,
  "slug": "reverter-negativa-visto-americano"
}

Response 400:
{
  "error": "Missing content_md"
}
```

Implementação sugerida:
```python
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def save_content_md(request, slug):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        content_md = data.get('content_md')
        if content_md is None:
            return JsonResponse({'error': 'Missing content_md'}, status=400)
        article = Article.objects.get(slug=slug)
        article.content_md = content_md
        article.save(update_fields=['content_md'])
        return JsonResponse({'ok': True, 'slug': slug})
    except Article.DoesNotExist:
        return JsonResponse({'error': 'Article not found'}, status=404)

# urls.py
path('api/articles/<slug:slug>/save-content-md/', views.save_content_md),
```

> **Segurança:** Como é uso local apenas e os endpoints leem/escrevem somente o campo `content_md`, o `@csrf_exempt` é aceitável. Se preferir, adicionar validação de IP para aceitar apenas localhost.

---

### 5.5. [VPS] `image-service/` — Serviço de processamento de imagens

**Novo serviço Node.js a criar no repositório e deploiar no VPS.**

**Caminho:** `image-service/` (raiz do repo)

**Arquivos:**

```
image-service/
├── server.js          # Express + multer + FFmpeg
├── package.json       # dependências: express, multer, fluent-ffmpeg
└── .env.example       # OUTPUT_BASE_DIR, PORT
```

#### `image-service/server.js` — spec de implementação

```
Dependências: express, multer (armazenamento temporário), fluent-ffmpeg

Endpoint: POST /upload
  Content-Type: multipart/form-data
  Campos:
    file     — arquivo de imagem (PNG/JPG/WebP/GIF/BMP)
    siteId   — ex: 'centraldevistos'
    slug     — ex: 'reverter-negativa-visto-americano'

Processamento:
  1. multer salva o arquivo em /tmp/img-upload-{uuid}.ext
  2. Gerar nome do arquivo de saída:
     {slug}-{timestamp}.webp
  3. Diretório de destino:
     {OUTPUT_BASE_DIR}/{siteId}/assets/images/blog/{slug}/
     (OUTPUT_BASE_DIR = process.env.OUTPUT_BASE_DIR
                      || '/home/edgar/Repos/fastvistos/public')
     Criar diretório se não existir (mkdir -p)
  4. FFmpeg: converter para WebP, max-width 1200px, qualidade 82
     ffmpeg -i input -vf "scale='min(1200,iw)':-2" -c:v libwebp -q:v 82 output.webp
  5. Deletar arquivo temporário
  6. Retornar JSON:
     {
       "url": "/assets/images/blog/{slug}/{filename}.webp",
       "width": <int>,   // dimensões reais após resize
       "height": <int>
     }

Erros:
  - 400: campo file ausente, siteId ausente, slug ausente
  - 422: arquivo não é imagem
  - 500: falha no FFmpeg

Porta: process.env.IMAGE_SERVICE_PORT || 8091
CORS: permitir qualquer origem (local use only)
Limit de tamanho: 20MB (multer limits)
```

#### `image-service/package.json`

```json
{
  "name": "image-service",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.0",
    "multer": "^1.4.5",
    "fluent-ffmpeg": "^2.1.3"
  }
}
```

#### Deploy no VPS

```sh
# 1. No VPS, instalar FFmpeg se não tiver:
sudo apt-get install -y ffmpeg

# 2. Instalar dependências do serviço:
cd /home/edgar/Repos/fastvistos/image-service && npm install

# 3. Iniciar com PM2:
pm2 start image-service/server.js --name image-service

# 4. Salvar para sobreviver a reboot:
pm2 save
```

---

## 6. Algoritmo: Text Matching para Inserção no `content_md`

Este é o ponto mais delicado. O HTML renderizado não corresponde 1:1 ao Markdown.

### 6.1. Modo "INSERIR IMAGEM" (placeholder)

```
Input: placeholderText = "passaporte brasileiro com carimbo de visto americano negado e aprovado"

1. Buscar no content_md a linha que contém:
   <!--[[INSERIR IMAGEM: {placeholderText}]]-->
   (busca exata de substring, case-sensitive)

2. Se encontrado: SUBSTITUIR a linha inteira por:
   <img src="{url}" alt="{altText}" />

3. Se não encontrado: fallback → modo livre (ver 6.2)
```

### 6.2. Modo livre (clique em parágrafo + paste)

```
Input: targetEl = elemento DOM clicado (p, li, h2, h3, h4, blockquote, td)

Passo 1 — Extrair "texto âncora" do elemento clicado:
  anchorText = targetEl.textContent
    .trim()
    .replace(/\s+/g, ' ')  // normalizar espaços
    .substring(0, 80)       // primeiros 80 chars

Passo 2 — Preparar texto âncora para matching:
  Remover caracteres que podem ser markdown:
  anchorCleaned = anchorText
    .replace(/\[|\]|\*|_|`|#/g, '')  // remove markdown syntax
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 60)

Passo 3 — Buscar no content_md linha a linha:
  lines = contentMd.split('\n')
  bestMatchIndex = -1
  bestMatchScore = 0

  for (i, line) of lines:
    lineCleaned = line.replace(/\[|\]|\*|_|`|#/g, '').trim()
    
    // Score: quantos chars do anchorCleaned aparecem na linha
    // Estratégia simples: substring(0,30) do anchorCleaned
    anchor30 = anchorCleaned.substring(0, 30)
    if (lineCleaned.includes(anchor30)):
      score = anchor30.length
      if score > bestMatchScore:
        bestMatchScore = score
        bestMatchIndex = i

Passo 4 — Inserção:
  if bestMatchIndex >= 0:
    Inserir após a linha [bestMatchIndex]:
      lines.splice(bestMatchIndex + 1, 0, '', imgTag, '')
  else:
    fallback: inserir antes de '<div class="sources-section">'
    ou, se não existir, antes de '---\n' (separador final)
    ou, se não existir, no final do array

Passo 5 — Reconstituir:
  return lines.join('\n')
```

### 6.3. Casos edge e fallback

| Situação | Comportamento |
|----------|--------------|
| Usuário clicou em elemento não rastreado (footer, nav) | `lastClickedTarget` é null → modal avisa "Clique em um parágrafo primeiro" (para modes clipboard/upload). Para placeholder, não precisa. |
| Texto não encontrado no content_md | Fallback: insere antes de `<div class="sources-section">` |
| Placeholder exato não encontrado | Tenta busca parcial (primeiros 40 chars), senão fallback livre |
| content_md vazio ou null | Exibir erro: "Artigo não tem content_md no banco de dados" |

---

## 7. Contratos de API Completos

### 7.1. `GET /image-editor/content-md?slug={slug}`

Via Vite proxy → Django.

```
Request:
  GET /image-editor/api/articles/{slug}/content-md/
  
  (o Vite proxy rewrite transforma:
   /image-editor/api/articles/X/content-md/
   → /api/articles/X/content-md/  no Django)

Response 200 JSON:
{
  "slug": "reverter-negativa-visto-americano",
  "content_md": "---\ntitle: \"...\"\n...\n---\n\nConteúdo..."
}
```

> **Nota de implementação no client:** A URL que o browser chama é:  
> `GET /image-editor/api/articles/${slug}/content-md/`

### 7.2. `POST /image-editor/save-md`

Via Vite proxy → Django.

```
Request:
  POST /image-editor/api/articles/{slug}/save-content-md/
  Content-Type: application/json
  Body:
  {
    "slug": "reverter-negativa-visto-americano",
    "siteId": "centraldevistos",
    "content_md": "...markdown modificado..."
  }

Response 200 JSON:
{
  "ok": true,
  "slug": "reverter-negativa-visto-americano"
}
```

### 7.3. `POST /image-upload/upload`

Via Vite proxy → Image Service no VPS.

```
Request:
  POST /image-upload/upload
  Content-Type: multipart/form-data
  Fields:
    file   — Blob/File da imagem
    siteId — string (ex: "centraldevistos")
    slug   — string (ex: "reverter-negativa-visto-americano")

Response 200 JSON:
{
  "url": "/assets/images/blog/reverter-negativa-visto-americano/reverter-negativa-1712345678.webp",
  "width": 1200,
  "height": 800
}

Response 4xx/5xx JSON:
{
  "error": "..."
}
```

---

## 8. Configuração — Variáveis de Ambiente

Adicionar ao `.env` local (e garantir no VPS se necessário):

```dotenv
# Já existe — URL base do Django no VPS
# API_BASE_URL=https://72.60.57.150:8000  ← exemplo

# NOVO — URL base do Django para o Vite proxy
# Deve ser o mesmo valor de API_BASE_URL (base URL sem path)
DJANGO_API_BASE_URL=https://72.60.57.150:8000

# NOVO — URL do image service no VPS
IMAGE_SERVICE_URL=http://72.60.57.150:8091

# Já existe — usado pelo dev-with-sync.js e passado para Astro
SITE_ID=centraldevistos
```

> **Atenção:** Se `API_BASE_URL` já aponta para a base correta do Django, pode usar a mesma variável: `DJANGO_API_BASE_URL=${API_BASE_URL}`. Confirmar o valor exato antes de codificar.

---

## 9. Convenções de Arquivos e Caminhos

| Item | Caminho |
|------|---------|
| Client script (fonte) | `multi-sites/core/lib/blog-image-editor.js` |
| Client script (servido) | `multi-sites/core/public/blog-image-editor.js` (symlink ou copy) |
| Image service | `image-service/server.js` |
| Template Astro (fonte) | `multi-sites/core/pages/blog/[...slug].astro` |
| Imagens salvas no VPS | `/home/edgar/Repos/fastvistos/public/{siteId}/assets/images/blog/{slug}/` |
| URL pública da imagem | `/assets/images/blog/{slug}/{filename}.webp` |
| Formato de arquivo gerado | `{slug}-{unix-timestamp}.webp` |

---

## 10. Decisões em Aberto (para o autor revisar)

| # | Decisão | Opções | Impacto |
|---|---------|--------|---------|
| D1 | Valor exato de `DJANGO_API_BASE_URL` | Usar `API_BASE_URL` existente ou criar novo? | Config .env |
| D2 | Porta do image service no VPS (8091) | Qualquer porta livre | Config .env e PM2 |
| D3 | Dimensões máximas FFmpeg | 1200px width? 800px? | Qualidade/tamanho |
| D4 | Salvar no VPS `public/` ou path diferente? | Confirmar `/home/edgar/Repos/fastvistos/public/` | image-service.js |
| D5 | Quando `lastClickedTarget` é null, bloquear paste ou inserir no fim? | Bloquear (mostrar aviso) ou fallback silencioso | UX |
| D6 | O `siteId` no BLOG_EDITOR_CONFIG vem de `import.meta.env.SITE_ID` (passado pelo dev script). Confirmar que `SITE_ID` é passado corretamente pelo `dev-with-sync.js` | Ver arquivo `dev-with-sync.js` linha ~40 | Injeção do script |
| D7 | Destino do `blog-image-editor.js` para Astro servir: lugar em `public/` correto? | `multi-sites/core/public/` ou `public/` raiz | Path do `src` no Astro |

---

## 11. Ordem de Implementação Recomendada

```
Fase 1 — Backend VPS
  1. Django: implementar GET /api/articles/{slug}/content-md/
  2. Django: implementar POST /api/articles/{slug}/save-content-md/
  3. image-service: criar server.js, testar com curl

Fase 2 — Plumbing local
  4. astro.config.mjs: adicionar vite.server.proxy
  5. Testar proxy: curl localhost:3000/image-editor/api/articles/{slug}/content-md/
  6. Testar proxy upload: curl -F file=@test.png localhost:3000/image-upload/upload

Fase 3 — Client script
  7. [...]slug].astro core template: injetar script condicional
  8. blog-image-editor.js: init + placeholder rendering + click tracking
  9. blog-image-editor.js: paste handler + modal de imagem
  10. blog-image-editor.js: uploadImage + fetchContentMd + saveContentMd
  11. blog-image-editor.js: text-matching algorithm + insertImageInMd
  12. blog-image-editor.js: DOM preview + toast
  13. blog-image-editor.js: FAB "✏️ Editar MD" + ContentMdEditorModal
  14. blog-image-editor.js: saveMdFromEditor + reloadMdFromDb + banner pós-save
  15. Testar end-to-end: inserção de imagem + editor raw

Fase 4 — Polish
  16. Tab "Upload de arquivo" no modal de imagem
  17. Tab "URL externa" no modal de imagem
  18. Tratar edge cases (content_md null, texto não encontrado, etc.)
  19. Atalho de teclado para o editor MD: Cmd+Shift+E (abre/fecha)
```

---

## 12. Resumo dos Arquivos por Ação

### Criar (novos)
- `multi-sites/core/lib/blog-image-editor.js`
- `image-service/server.js`
- `image-service/package.json`

### Modificar (existentes)
- `astro.config.mjs` — adicionar `vite.server.proxy`
- `multi-sites/core/pages/blog/[...slug].astro` — injetar script condicional
- `.env` — adicionar `DJANGO_API_BASE_URL` e `IMAGE_SERVICE_URL`

### Implementar no Django (VPS — fora do repo Node)
- `views.py` — 2 funções
- `urls.py` — 2 rotas

### Depois de modificar o template core
- Rodar `node sync-blog.js <siteId>` para propagar para o site
- Reiniciar o dev server (`pubpre <siteId>`)
