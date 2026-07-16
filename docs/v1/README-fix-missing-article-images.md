# fix-missing-article-images

Atribui automaticamente uma imagem da galeria a todos os artigos publicados que estão sem imagem.

## Uso

```sh
# Ver o que seria feito (sem salvar)
node scripts/fix-missing-article-images.js <site_id> --dry-run

# Executar
node scripts/fix-missing-article-images.js <site_id>

# Filtrar imagens por grupo específico da galeria
node scripts/fix-missing-article-images.js <site_id> --group=visto-americano
```

## Sites disponíveis

`centraldevistos` · `fastvistos` · `revistadoturismo` · `flyfred` · `emprego` · `zenith` · `zapsim`

## Exemplo

```sh
node scripts/fix-missing-article-images.js centraldevistos --dry-run
```

```
Site: centraldevistos (business_id: 3cfe8493907c...)
DRY RUN — nenhuma alteração será salva

Artigos publicados sem imagem: 7
Imagens disponíveis na galeria: 46

  [DRY] "Visto negado pelos EUA: torcedor-estátua da RD Congo..."
         -> images/hoteis-disneywebp.webp
  ...

DRY RUN concluído — 7 artigos seriam atualizados.
```

## Notas

- Roda a partir da raiz do projeto (onde fica o `.env`)
- As imagens da galeria ficam na tabela `blog_image` — se a galeria estiver vazia o script avisa e encerra
- O campo `image` do artigo recebe o path relativo da imagem (ex: `images/foo.webp`), igual ao que o editor visual usa

## Como a imagem é escolhida

1. **Pool de imagens** — o script carrega todas as imagens da tabela `blog_image` que têm um path válido. Se `--group=<nome>` for passado, filtra apenas as desse grupo; caso contrário usa tudo (hoje: 46 imagens nos grupos `visto-americano` e `disney-orlando`).

2. **Sorteio aleatório** — para cada artigo sem imagem, uma imagem é escolhida via `Math.random()` independentemente dos outros artigos. O mesmo arquivo pode ser sorteado para mais de um artigo.

3. **Path gravado** — o campo `image` do artigo recebe o path relativo da `blog_image` (ex: `images/stock-pexels-123.webp`), que é exatamente o mesmo formato que o editor visual grava quando você insere uma imagem manualmente.
