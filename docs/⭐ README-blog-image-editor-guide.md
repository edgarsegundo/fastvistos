
# Blog Image Editor — Guia de Uso

Ferramenta local para inserir e editar imagens em artigos do blog via interface visual durante o desenvolvimento.
Só está ativa com `import.meta.env.DEV === true` (nunca vai para produção).

---

## Pré-requisitos

- **FFmpeg** instalado: `brew install ffmpeg`
- **Variáveis no `.env`** (raiz do projeto):
  ```
  DJANGO_MICROSERVICESADM_KEY=<sua-chave>
  DJANGO_API_BASE_URL=https://sys.fastvistos.com.br
  IMAGE_SERVICE_URL=http://localhost:8091
  ```

---

## Como iniciar

Precisa de **dois terminais**:

**Terminal 1 — Dev server Astro:**
```sh
pubpre centraldevistos   # ou qualquer SITE_ID
```

**Terminal 2 — Image service (FFmpeg/upload):**
```sh
cd image-service && node server.js
```

O `SITE_ID` é inferido automaticamente do argumento de `pubpre` — não precisa setar no `.env`.

---

## Funcionalidades disponíveis

### 1. 🖼️ Inserir imagem em qualquer ponto do artigo

1. Clique num parágrafo, heading ou item de lista → borda azul aparece indicando o alvo
2. Clique no botão **🖼️ Inserir imagem** (canto inferior esquerdo)
3. Escolha a aba desejada:
   - **Upload** — seleciona arquivo local; processado via FFmpeg (WebP, max 1200×800)
   - **URL externa** — cola URL de imagem externa
   - **Clipboard** — usa imagem já copiada (ou use Cmd+V diretamente)
4. Preencha o **alt text** e clique "Inserir imagem"
5. A imagem é salva no DB e inserida no DOM após o parágrafo selecionado

> Se clicar em "Inserir imagem" sem ter selecionado um parágrafo, aparece aviso em vermelho.

### 2. Cmd+V / Ctrl+V — Paste rápido

1. Clique no parágrafo alvo
2. Copie qualquer imagem (screenshot, Finder, browser)
3. Pressione Cmd+V em qualquer parte da página
4. Modal abre na aba Clipboard com a imagem já carregada

### 3. Placeholders `[[INSERIR IMAGEM: ...]]` no `content_md`

Se o `content_md` do artigo no DB contiver comentários como:
```
<!--[[INSERIR IMAGEM: foto do consulado]]-->
```
O editor renderiza automaticamente um botão laranja **"📷 foto do consulado"** no lugar do comentário. Clicar nele abre o modal e substitui o placeholder pela imagem inserida.

### 4. ✏️ Editar MD — editor de `content_md` completo

1. Clique no botão **✏️ Editar MD** (canto inferior esquerdo, acima do botão de imagem)
2. Edite o Markdown diretamente no textarea
3. Clique **💾 Salvar** → salva no DB via Django API
4. Um banner amarelo aparece indicando que a página precisa ser recarregada para refletir as mudanças

---

## Onde as imagens são salvas

```
public/{siteId}/assets/images/blog/{slug}/{slug}-{timestamp}.webp
```

Exemplo:
```
public/centraldevistos/assets/images/blog/reverter-negativa-visto-americano/
  reverter-negativa-visto-americano-1712534400000.webp
```

---

## Troubleshooting

| Problema | Causa provável | Solução |
|---|---|---|
| Botões não aparecem | Script não carregou | `curl localhost:3000/blog-image-editor.js \| head -3` |
| `401 Unauthorized` na API | `DJANGO_MICROSERVICESADM_KEY` não carregada | Reiniciar `pubpre` após editar `.env` |
| Upload falha / sem resposta | Image service não está rodando | `cd image-service && node server.js` |
| Imagem inserida no DOM mas sumiu ao recarregar | Normal — DOM é visual; o `content_md` no DB não foi atualizado | Use **✏️ Editar MD** para adicionar o `![alt](url)` no Markdown também |
