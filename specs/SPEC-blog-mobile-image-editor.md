# SPEC — Admin Image Uploader (Mobile)
## `/admin/image-uploader`

> Ferramenta interna, mobile-first, para upload e gerenciamento de imagens de artigos do blog.
> Acesso protegido por token via query string. Roda no VPS existente como rota Express independente do Astro.

---

## 1. Visão Geral

Uma single-page HTML/CSS/JS servida pelo `multi-sites/core/msitesapp/server.js` Express na rota `/admin/image-uploader?token=SEU_TOKEN`.

O usuário acessa pelo celular, faz upload ou cola imagens pelo clipboard, ajusta as imagens, e obtém a URL final para usar manualmente no MD do artigo.

**Não há persistência de sessão.** Tudo que está na lista de imagens salvas existe apenas enquanto a página estiver aberta. Ao recarregar, a lista some — isso é intencional.

---

## 2. Autenticação

- Query string: `?token=SEU_TOKEN`
- O `server.js` valida contra `process.env.ADMIN_TOKEN`
- Se inválido: retorna `401 Unauthorized` com página de erro simples
- Não há tela de login — acesso direto via link com token (link enviado via Discord privado)

---

## 3. Stack Técnica

- **HTML + tailwind + Vanilla JS** — arquivo único `admin/image-uploader.html`
- **Sem frameworks, sem build step**
- Servido pelo Express: `res.sendFile(path.join(__dirname, 'admin/image-uploader.html'))`
- CSS mobile-first, otimizado para telas de 375px–430px
- As funcionalidades de processamento de imagem já foram implementadas no arquivo `blog-image-editor.js` via chamadas à API do servidor no `image-service/server.js`, porém você deve transferir essas funcionalidades para o `multi-sites/core/msitesapp/server.js` também e chamar de lá. O 
- Você pode buscar no arquivo `public/blog-image-editor.js` exemplos e ideias de como implementar essa spec (especialmente como acessar a base de dados etc), porém, apenas use como exemplo.
---

## 4. Layout Geral — Estrutura de Telas

A interface tem **2 telas principais** que alternam via JS (sem navegação de página):

```
TELA 1: Image Viewer + Seleção
TELA 2: Ajuste de Imagem (abre sobre a Tela 1)
```

---

## 5. TELA 1 — Image Viewer + Seleção

### 5.1 Estrutura vertical (de cima para baixo)

```
┌─────────────────────────────┐
│         IMAGE VIEWER        │  ← área grande, ~55vw altura
│   "Selecione um arquivo"    │  ← placeholder quando vazio
│   (ou "Cole uma imagem      │
│    ctrl+v / cmd+v")         │  ← muda conforme modo ativo
└─────────────────────────────┘

[ upload ]   [ clipboard ]        ← botões de modo

── quando modo UPLOAD ativo ──────
[ Escolher arquivo ]  nenhum arquivo  ← input file nativo oculto + label customizado
[ nome do arquivo________________ ]  ← input text, placeholder "Nome do arquivo"
[ Salvar ]                           ← botão de ação

── quando modo CLIPBOARD ativo ───
[ nome do arquivo________________ ]  ← input text, placeholder "Nome do arquivo"
[ Salvar ]                           ← botão de ação
─────────────────────────────────

── quando imagem carregada no viewer ──
[ Ajustar → ]                        ← botão aparece abaixo da imagem

Lista de imagens salvas
─────────────────────────────────
📋 nome-do-arquivo-1.webp
📋 nome-do-arquivo-2.webp
📋 nome-do-arquivo-3.webp
```

---

### 5.2 Image Viewer

- Área com borda arredondada (`border-radius: 16px`), borda sutil (`1px solid #e0e0e0`), fundo `#f8f8f8`
- Altura fixa: `55vw` (máximo `300px`)
- Quando vazio: texto centralizado com cor cinza claro, muda conforme modo:
  - Modo upload: `"Selecione um arquivo"`
  - Modo clipboard: `"Cole uma imagem (ctrl+v / cmd+v)"`
  - Sem modo ativo (estado inicial): `"Selecione um arquivo"`
- Quando com imagem: exibe a imagem com `object-fit: contain`, fundo preto
- Transição suave ao trocar imagem (`opacity` fade 200ms)
- **Ao carregar uma nova imagem, o viewer reseta completamente** (sem manter estado anterior)

---

### 5.3 Botões de Modo: Upload e Clipboard

- Dois botões lado a lado: `[ upload ]` e `[ clipboard ]`
- **Estado padrão:** fundo branco, borda cinza, texto cinza escuro
- **Estado ativo (selecionado):** fundo azul (`#2563eb`), texto branco, sem borda
- Apenas um pode estar ativo por vez
- Ao clicar num botão de modo:
  - Marca o botão como ativo (azul)
  - Reseta o Image Viewer (remove imagem, volta ao placeholder)
  - Esconde os controles do outro modo
  - Exibe os controles do modo selecionado
  - Remove o botão `Ajustar` se estiver visível

---

### 5.4 Controles do Modo UPLOAD

Aparecem abaixo dos botões de modo quando `upload` está ativo:

**Linha 1 — File picker:**
- Botão `[ Escolher arquivo ]` — estilizado (não o input nativo padrão)
- Por baixo, um `<input type="file" accept="image/*">` oculto, acionado pelo botão
- Label ao lado: inicialmente `"nenhum arquivo"`, muda para o nome do arquivo selecionado após escolha
- Ao selecionar arquivo: carrega preview no Image Viewer imediatamente

**Linha 2 — Nome do arquivo:**
- `<input type="text">` com placeholder `"Nome do arquivo"`
- Pré-preenchido automaticamente com o nome do arquivo selecionado (sem extensão)
- Editável pelo usuário

**Linha 3 — Botão Salvar:**
- Botão `[ Salvar ]`
- Só aparece após uma imagem estar carregada no viewer
- Ao clicar: faz upload para o servidor via `POST /image-upload` (endpoint existente)
- Durante o upload: botão muda para `[ Salvando... ]` e fica desabilitado, spinner no viewer
- Após sucesso: adiciona item à Lista de Imagens Salvas, reseta viewer e controles

---

### 5.5 Controles do Modo CLIPBOARD

Aparecem abaixo dos botões de modo quando `clipboard` está ativo:

- O viewer exibe: `"Cole uma imagem (ctrl+v / cmd+v)"`
- O documento inteiro escuta o evento `paste`
- Ao colar (`ctrl+v` / `cmd+v` / long-press paste no mobile):
  - Se o clipboard contém imagem: carrega no viewer
  - Se não contém imagem: exibe mensagem de erro temporária no viewer (`"Nenhuma imagem no clipboard"`, 2s)

**Linha 1 — Nome do arquivo:**
- `<input type="text">` com placeholder `"Nome do arquivo"`
- Não é pré-preenchido (usuário define manualmente)

**Linha 2 — Botão Salvar:**
- Mesmo comportamento do modo upload

---

### 5.6 Botão Ajustar

- Aparece **abaixo do Image Viewer** somente quando há uma imagem carregada
- Texto: `Ajustar →`
- Estilo: botão outline (borda azul, texto azul, fundo transparente)
- Ao clicar: abre a Tela 2 (Ajuste) em cima da Tela 1
- Se o usuário ainda não clicou em Salvar antes de Ajustar: a imagem ajustada é o que será salvo quando o usuário clicar em Salvar na Tela 1

---

### 5.7 Lista de Imagens Salvas

Aparece abaixo de todos os controles, separada por um `<hr>`.

**Header:** texto `"Lista de imagens salvas"` em cinza médio, tamanho menor

**Cada item da lista:**
```
📋  nome-do-arquivo.webp
```
- Ícone de clipboard à esquerda (pode ser SVG ou emoji 📋)
- Nome do arquivo
- Ao clicar no ícone ou no item inteiro: copia para o clipboard a URL completa no formato:
  ```
  ![nome-do-arquivo](/assets/images/blog/SLUG/nome-do-arquivo.webp)
  ```
  onde `SLUG` é passado como parâmetro na URL da página: `/admin/image-uploader?token=TOKEN&slug=SLUG`
- Feedback visual ao copiar: ícone muda para ✅ por 1.5s, depois volta
- Lista em ordem de adição (mais recente no topo)
- **Sem persistência** — some ao recarregar a página

---

## 6. TELA 2 — Ajuste de Imagem

Abre como um **overlay full-screen** sobre a Tela 1 (não é navegação, é uma camada CSS `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; background: white`).

### 6.1 Header da Tela 2
```
← Voltar    Ajustar imagem    [Preview] [Inserir imagem]
```
- Botão `← Voltar`: fecha o overlay, retorna à Tela 1, mantém a imagem ajustada no viewer
- Título: `"Ajustar imagem"` centralizado
- Botão `Preview`: reprocessa a imagem com as configurações atuais e exibe no viewer desta tela
- Botão `Inserir imagem`: aplica os ajustes, fecha o overlay, retorna à Tela 1 com a imagem processada no viewer

### 6.2 Image Viewer da Tela 2
- Mesma imagem da Tela 1
- Área menor que Tela 1: ~45vw altura, `object-fit: contain`, fundo preto

### 6.3 Controles de Ajuste

Todos os controles abaixo devem ser empilhados verticalmente, com scroll na tela.

**Bloco 1 — Recortar:**
```
☐ Recortar (arraste na imagem acima)
```
- Checkbox que ativa modo de crop drag na imagem acima
- Quando ativo: exibe overlay de crop na imagem com handles arrastáveis

**Bloco 2 — Tamanho:**
```
Tamanho:  [1536]  ×  [1024]  🔒  (1536×1024)
```
- Dois inputs numéricos: largura e altura
- Ícone de cadeado 🔒: quando travado, mantém proporção ao editar um dos campos
- Label entre parênteses mostra dimensões originais da imagem
- Valores iniciais = dimensões originais da imagem

**Bloco 3 — Sliders (2 colunas):**
```
Brilho    0          Contraste   0
[════●════════]      [════●════════]

Saturação 0          Qualidade WebP 82
[════●════════]      [════●════════]
```
- **Brilho:** range `-100` a `+100`, default `0`
- **Contraste:** range `-100` a `+100`, default `0`
- **Saturação:** range `-100` a `+100`, default `0`
- **Qualidade WebP:** range `1` a `100`, default `82`
- Cada slider exibe o valor atual ao lado do label
- Sliders com `accent-color: #2563eb`

**Bloco 4 — Checkboxes:**
```
☐ Nitidez    ☐ Escala de cinza
```

**Bloco 5 — Alt text:**
```
Alt text
[________________________________]
```
- Input text, placeholder: `"Alt text da imagem"`
- Pré-preenchido com o nome do arquivo (sem extensão, hífens como separadores)

> **Nota:** Layouts (sozinha, legenda, float, hero, grid) ficam para versão 2. NÃO implementar nesta versão.

---

## 7. Endpoints de API utilizados

A página chama endpoints já existentes no `server.js`. Documentar aqui para o implementador saber o contrato:

### `POST /image-upload`
Upload da imagem original.
```json
// multipart/form-data
{
  "file": <binary>,
  "filename": "nome-customizado",
  "slug": "slug-do-artigo"
}

// response
{
  "url": "/assets/images/blog/slug/nome-customizado.webp",
  "filename": "nome-customizado.webp"
}
```

### `POST /image-editor/process`
Processa ajustes na imagem (brilho, contraste, etc.).
```json
// request
{
  "imageData": "<base64 ou URL relativa>",
  "width": 1536,
  "height": 1024,
  "brightness": 0,
  "contrast": 0,
  "saturation": 0,
  "quality": 82,
  "sharpen": false,
  "grayscale": false
}

// response
{
  "url": "/assets/images/blog/slug/nome-customizado.webp"
}
```

> ⚠️ **Para o implementador:** confirmar os endpoints reais com o dono do projeto. Os nomes acima são baseados no `blog-image-editor.js` existente mas podem diferir.

---

## 8. URL da Página e Parâmetros

```
/admin/image-uploader?token=TOKEN&slug=SLUG
```

- `token` (obrigatório): validado no servidor
- `slug` (opcional): usado para montar a URL final das imagens. Se não passado, usar `"geral"` como fallback

O `slug` é lido pelo JS na página:
```js
const params = new URLSearchParams(window.location.search);
const slug = params.get('slug') || 'geral';
```

---

## 9. Rota no server.js

```js
// Autenticação
app.use('/admin', (req, res, next) => {
  const token = req.query.token || req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).send('<h1>401 — Acesso negado</h1>');
  }
  next();
});

// Servir a página
app.get('/admin/image-uploader', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/image-uploader.html'));
});
```

---

## 10. Design Visual

- **Mobile-first:** largura máxima `480px`, centralizado em telas maiores
- **Fundo:** branco `#ffffff`
- **Cor primária:** azul `#2563eb`
- **Textos:** cinza escuro `#1f2937` para conteúdo, `#6b7280` para labels e placeholders
- **Bordas:** `#e5e7eb` para containers e inputs
- **Border radius:** `12px` para containers grandes, `8px` para botões e inputs
- **Fonte:** system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- **Padding geral:** `16px` nas laterais
- **Espaçamento entre blocos:** `16px`
- **Botões principais:** altura `44px` (mínimo touch target)
- **Inputs:** altura `44px`, padding `12px`
- **Transições:** `150ms ease` para estados de hover/active/focus

---

## 11. Estados de Erro

| Situação | Comportamento |
|---|---|
| Token inválido | Servidor retorna 401, página de erro simples |
| Arquivo não é imagem | Alert inline: `"Selecione um arquivo de imagem válido"` |
| Clipboard sem imagem | Mensagem temporária no viewer (2s): `"Nenhuma imagem no clipboard"` |
| Falha no upload | Alert inline abaixo do botão Salvar: `"Erro ao salvar. Tente novamente."` |
| Nome do arquivo vazio ao salvar | Alert inline: `"Digite um nome para o arquivo"` |

---

## 12. Comportamento de Reset

**O viewer reseta completamente quando:**
- Usuário troca de modo (upload ↔ clipboard)
- Upload concluído com sucesso
- Usuário clica em `← Voltar` na Tela 2 sem confirmar (mantém imagem atual, NÃO reseta)

**Reset do viewer significa:**
- Remove imagem exibida
- Volta ao texto placeholder
- Esconde botão `Ajustar`
- Limpa input de nome do arquivo
- Limpa label "nenhum arquivo" (volta para "nenhum arquivo")
- NÃO limpa a Lista de Imagens Salvas

---

## 13. Arquivo a ser criado

```
projeto/
└── admin/
    └── image-uploader.html   ← arquivo único, tudo inline (HTML + <style> + <script>)
```

Tudo em um único arquivo HTML com `<style>` no `<head>` e `<script>` antes do `</body>`. Sem dependências externas, sem npm, sem build.