# Manual: Vídeo → YouTube → Site (empregoaqui.com.br)

Tudo open source / gratuito, usando ffmpeg + embed otimizado para nota máxima no Lighthouse.

---

## Passo 1 — Marca d'água: deixa por conta do YouTube

O YouTube já exibe automaticamente o avatar/marca do canal sobre o vídeo, sem precisar embutir logo via ffmpeg.

**Como ativar/configurar (se ainda não estiver):**

1. YouTube Studio → **Personalização** → aba **Marca**
2. Em "Marca d'água do vídeo", suba uma imagem (recomenda-se PNG quadrado, fundo transparente)
3. Escolha quando ela aparece: vídeo inteiro, final, ou tempo personalizado
4. Posição é fixa (canto inferior direito) — não é configurável pelo YouTube

⚠️ Essa marca só aparece para quem assiste **no YouTube**. Se o vídeo for baixado ou usado fora do YouTube (Instagram, WhatsApp, etc.), ela não vai junto — porque não é "queimada" no arquivo, é sobreposta pelo player.

---

## Passo 2 — Otimizar a versão para o YouTube

```bash
ffmpeg -i video_original.mp4 \
-c:v libx264 -preset slow -crf 18 \
-pix_fmt yuv420p \
-c:a aac -b:a 192k \
-movflags +faststart \
video_youtube.mp4
```

Suba `video_youtube.mp4` no YouTube normalmente (qualidade alta, CRF 18).

---

## Passo 3 — Embed no site (não fazer self-host do .mp4)

**Decisão**: usar embed do YouTube com lazy-loading, não hospedar o arquivo de vídeo no próprio servidor.

**Por quê:**

- Banda e CDN gratuitos (YouTube paga a conta)
- Streaming adaptativo automático (qualidade ajusta à conexão do usuário)
- SEO extra (vídeo pode ranquear separadamente)
- Sem custo de manutenção/infra

**Atenção (parâmetros desatualizados, não usar/confiar):**

- ❌ `modestbranding=1` — descontinuado pelo YouTube em ago/2023, não tem mais efeito
- ❌ `rel=0` — desde 2018 não remove vídeos relacionados, só restringe ao mesmo canal
- ✅ `youtube-nocookie.com` — ainda funciona, reduz cookies de rastreamento até o play

---

## Passo 4 — Código do embed (versão otimizada para nota máxima no Lighthouse)

Carrega só uma imagem até o usuário clicar — evita os ~1,3–2,6 MB que um iframe do YouTube carrega de cara.

### Sobre a thumbnail (não precisa criar imagem)

O YouTube já gera as thumbnails automaticamente. A URL busca direto do CDN do YouTube — zero trabalho de criação e zero peso no seu servidor.

| Nome | Resolução | Peso aprox. |
|---|---|---|
| `default.jpg` | 120×90 | ~5 KB |
| `mqdefault.jpg` | 320×180 | ~10 KB |
| `hqdefault.jpg` | 480×360 | ~15-20 KB |
| `sddefault.jpg` | 640×480 | ~25-30 KB (nem todo vídeo tem) |
| `maxresdefault.jpg` | 1280×720 | ~60-100 KB (só se o vídeo foi enviado em HD/4K) |

Recomendado: `hqdefault.jpg` (bom equilíbrio entre qualidade e peso).

### Ajustes para nota máxima no Lighthouse

- **`preconnect`** — abre conexão com o YouTube antes do clique, reduz latência
- **`fetchpriority="high"`** — usar só se a thumbnail for o LCP (Largest Contentful Paint) da página, ou seja, se aparecer na primeira tela
- **Sem `loading="lazy"` se for above-the-fold** — lazy-load só faz sentido se o vídeo estiver abaixo da dobra; se aparece já na primeira tela, lazy atrasa o LCP
- **`aspect-ratio` no CSS** — garante zero CLS (Cumulative Layout Shift)
- **`decoding="async"`** — evita bloquear a renderização da página
- **`<button>` real em vez de `<div onclick>`** — melhora o score de Acessibilidade
- **`title` no iframe** — outro ponto cobrado pelo Lighthouse de Acessibilidade
- **`allow="autoplay; encrypted-media"`** — padrão recomendado pelo YouTube, evita warning no console

⚠️ **Importante**: se houver **mais de um vídeo na mesma página**, use `fetchpriority="high"` somente no primeiro/maior (geralmente o do topo). Os demais usam `loading="lazy"` — marcar tudo como prioridade máxima é contraditório e piora a performance real.

### Código

```html
<style>
.video-thumb {
  position: relative;
  max-width: 800px;
  cursor: pointer;
  aspect-ratio: 16 / 9;
  background: #000;
}
.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.video-thumb .play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  color: white;
  background: rgba(0,0,0,0.5);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<link rel="preconnect" href="https://www.youtube-nocookie.com">
<link rel="preconnect" href="https://i.ytimg.com">

<div class="video-thumb" id="videoThumb">
  <img src="https://i.ytimg.com/vi/SEU_VIDEO_ID/hqdefault.jpg"
       alt="Vídeo empregoaqui.com.br"
       width="480" height="360"
       decoding="async"
       fetchpriority="high">
  <button class="play-button" aria-label="Reproduzir vídeo" onclick="loadVideo()">▶</button>
</div>

<script>
function loadVideo() {
  document.getElementById('videoThumb').innerHTML =
    '<iframe width="100%" height="100%" style="position:absolute; top:0; left:0;" src="https://www.youtube-nocookie.com/embed/SEU_VIDEO_ID?autoplay=1" title="Vídeo empregoaqui.com.br" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
}
</script>
```

Substitua `SEU_VIDEO_ID` pelo ID do vídeo (a parte depois de `v=` na URL do YouTube).

---

## Resumo do fluxo completo

1. YouTube Studio → Marca → upload da marca d'água (uma vez só, vale pra todos os vídeos futuros)
2. ffmpeg → reencoda em alta qualidade (CRF 18, faststart)
3. Sobe o arquivo final no YouTube
4. No site, usa o HTML/CSS/JS otimizado acima, com `preconnect`, thumbnail do YouTube e `youtube-nocookie.com`

Nenhuma ferramenta paga necessária em nenhuma etapa.

---

## Observação — marca manual (plano B)

Se precisar colocar a marca manualmente no arquivo de vídeo (ex.: para usar o vídeo fora do YouTube, com a logo "queimada" no arquivo), use o ffmpeg assim:

```bash
ffmpeg -i video_original.mp4 -i logo.png \
-filter_complex "[1:v]scale=150:-1[logo];[0:v][logo]overlay=W-w-20:20" \
-codec:a copy video_com_logo.mp4
```

Variações de posição (troque o `overlay=...`):

- Superior direito: `W-w-20:20`
- Superior esquerdo: `20:20`
- Inferior direito: `W-w-20:H-h-20`
- Inferior esquerdo: `20:H-h-20`

Use logo em PNG com fundo transparente para melhor resultado.