# Spec: Geração Incremental de Blog Content

## Contexto

O script `generate-blog-content.js` atualmente busca **todos** os artigos publicados do banco a cada execução e regera todos os arquivos `.md` do zero. Com crescimento do volume de artigos, isso se torna custoso desnecessariamente, pois a maioria dos artigos não muda entre execuções.

---

## Objetivo

Tornar a geração de conteúdo **incremental**, processando apenas artigos novos ou modificados, e removendo do disco apenas arquivos correspondentes a artigos despublicados ou deletados.

---

## Escopo

Três melhorias, em ordem de prioridade:

1. **Comparação por `mtime` no disco** — barreira principal: só escreve o arquivo se o artigo foi modificado depois do arquivo existente
2. **Diff de arquivos no disco** — remove somente arquivos `.md` que não têm mais correspondência no banco
3. **Filtro Prisma por `modified` via `.last-run-*.json`** — reduz o volume que vem do banco nas execuções recorrentes

---

## Melhoria 1 — Comparação por `mtime` no Disco (barreira principal)

### Motivação

Cada arquivo `.md` gerado carrega seu próprio `mtime` (data de modificação no sistema de arquivos). Comparar esse valor com o campo `modified` do artigo é suficiente para decidir se o arquivo precisa ser regerado — sem estado externo, sem arquivo de controle.

### Comportamento esperado

- Se o arquivo `.md` **não existe**: gera normalmente.
- Se o arquivo `.md` existe e `article.modified > file.mtime`: regera (artigo foi atualizado).
- Se o arquivo `.md` existe e `article.modified <= file.mtime`: pula (arquivo já está em dia).

### Vantagens

- **Granular por artigo:** cada arquivo carrega seu próprio estado — uma falha parcial não compromete os artigos já gerados.
- **Resiliente a falhas:** se a execução travar no artigo 300 de 1000, a próxima execução retoma exatamente do 301.

### Implementação

No loop de geração, substituir o `writeFileSync` incondicional por:

```js
for (const article of articles) {
    if (!article.slug) {
        console.log('⚠️  Skipping article without slug:', article.title);
        continue;
    }

    const filename = `${sanitizeFilename(article.slug)}.md`;
    const filePath = path.join(contentBlogDir, filename);

    // Verifica se precisa regerar
    if (!forceFullRegen && fs.existsSync(filePath)) {
        const fileMtime = new Date(fs.statSync(filePath).mtime);
        const articleModified = new Date(article.modified);
        if (articleModified <= fileMtime) {
            console.log('⏭️  Unchanged, skipping:', filename);
            continue;
        }
    }

    const markdownContent = generateMarkdownContent(article);
    fs.writeFileSync(filePath, markdownContent, 'utf8');
    console.log('✅ Generated:', filename);
    generatedCount++;
}
```

---

## Melhoria 2 — Diff de Arquivos no Disco

### Motivação

O comportamento atual apaga **todos** os `.md` e os recria do zero a cada execução. Isso é incompatível com a geração incremental: arquivos de artigos não modificados seriam apagados e logo recriados sem necessidade.

### Comportamento esperado

- Remover do disco apenas arquivos cujo slug correspondente não existe mais no banco (artigo deletado, despublicado ou com `is_removed = true`).
- Arquivos de artigos inalterados são **mantidos intactos**.
- O arquivo `first-post.md` continua sendo preservado.

### Implementação

Como a query principal é filtrada por `modified > lastRun` (Melhoria 3), a limpeza seletiva depende de uma query auxiliar leve que retorna todos os slugs ativos no momento — independentemente de quando foram modificados.

#### Query auxiliar de slugs ativos

```js
const activeSlugs = await prisma.blog_article.findMany({
    where: {
        business_id: businessIdCleaned,
        is_removed: false,
        published: { lte: now },
    },
    select: { slug: true },
});

const activeFilenames = new Set(
    activeSlugs
        .filter((a) => a.slug)
        .map((a) => sanitizeFilename(a.slug) + '.md')
);
```

#### Remoção seletiva

Substituir o bloco de limpeza atual por:

```js
const existingFiles = fs
    .readdirSync(contentBlogDir)
    .filter((f) => f.endsWith('.md') && f !== 'first-post.md');

for (const file of existingFiles) {
    if (!activeFilenames.has(file)) {
        fs.unlinkSync(path.join(contentBlogDir, file));
        console.log('🗑️  Removido:', file);
    }
}
```

---

## Melhoria 3 — Filtro Prisma por `modified` via `.last-run-*.json`

### Motivação

As melhorias 1 e 2 eliminam I/O desnecessário no disco. Esta melhoria reduz também o **tráfego banco → memória**: em vez de buscar todos os artigos a cada execução, o Prisma retorna apenas os modificados desde a última rodada.

### Arquivo de controle

```
.last-run-<siteId>.json
```

Localização: raiz do projeto (mesmo nível do script). Formato:

```json
{ "lastRun": "2025-07-10T14:00:00.000Z" }
```

> Adicionar ao `.gitignore`: `.last-run-*.json`

### Funções

#### `getLastRunTime(siteId): Date`

Lê o arquivo de controle e retorna a data da última execução. Retorna `new Date(0)` se o arquivo não existir (primeira execução), fazendo a query trazer todos os artigos.

```js
function getLastRunTime(siteId) {
    const filePath = path.join(__dirname, `.last-run-${siteId}.json`);
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return new Date(data.lastRun);
    } catch {
        return new Date(0);
    }
}
```

#### `saveLastRunTime(siteId): void`

Persiste o timestamp atual. Chamado **apenas ao final de execução bem-sucedida** — se o script lançar exceção antes de chegar aqui, o arquivo não é atualizado e a próxima execução reprocessa o delta corretamente.

```js
function saveLastRunTime(siteId) {
    const filePath = path.join(__dirname, `.last-run-${siteId}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ lastRun: new Date().toISOString() }));
}
```

### Alteração na query principal

```js
const lastRun = forceFullRegen ? new Date(0) : getLastRunTime(siteId);
const isIncremental = lastRun.getTime() > 0;

const articles = await prisma.blog_article.findMany({
    where: {
        business_id: businessIdCleaned,
        is_removed: false,
        published: { lte: now },
        ...(isIncremental && { modified: { gt: lastRun } }),
    },
    include: { blog_topic: true },
    orderBy: { published: 'desc' },
});

console.log(
    isIncremental
        ? `📝 ${articles.length} artigos modificados desde ${lastRun.toISOString()}`
        : `📝 ${articles.length} artigos encontrados (geração completa)`
);
```

### Relação com a Melhoria 1

As duas camadas são complementares e não conflitam:

| Camada | Onde atua | O que evita |
|--------|-----------|-------------|
| `mtime` (Melhoria 1) | Loop de geração | Escrita desnecessária em disco |
| `.last-run-*.json` (Melhoria 3) | Query Prisma | Tráfego banco → memória |

Mesmo com o filtro Prisma ativo, a checagem por `mtime` permanece como segunda barreira de segurança.

---

## Flag `--full`

Força reprocessamento total, ignorando tanto o `mtime` quanto o `.last-run-*.json`:

```js
const forceFullRegen = args.includes('--full');
```

Uso:

```bash
node core/generate-blog-content.js fastvistos          # incremental
node core/generate-blog-content.js fastvistos --full   # força rebuild total
node core/generate-blog-content.js all --full          # rebuild de todos os sites
```

---

## Fluxo Completo

```
generateBlogArticles(siteId, { forceFullRegen })
│
├── getSiteConfig()
├── ensureContentDirectory()
├── ensureContentConfig()
│
├── [Query auxiliar] → activeSlugs (sempre executada)
├── Diff de disco → remove .md sem correspondência no banco
│
├── getLastRunTime() → lastRun
├── [Query principal] → articles filtrados por modified > lastRun (ou todos se --full / 1ª vez)
│
├── para cada article:
│   ├── se !forceFullRegen && arquivo existe:
│   │   └── compara article.modified com file.mtime → pula se em dia
│   └── writeFileSync(slug.md)
│
├── saveLastRunTime() ← só se chegou aqui sem exceção
└── log de conclusão
```

---

## Compatibilidade

### `siteId = 'all'`

Cada site tem seu próprio `.last-run-<siteId>.json`, sem interferência entre sites.

### `--watch`

No modo watch, cada ciclo de 60 segundos chama `generateBlogArticles` normalmente. A combinação das três melhorias torna cada ciclo muito leve: o banco retorna apenas o delta recente, e só os arquivos efetivamente alterados são escritos em disco.

---

## Critérios de Aceite

| # | Critério |
|---|----------|
| 1 | Artigos sem mudança (`modified <= mtime`) são pulados sem escrita em disco |
| 2 | Artigos com `modified > mtime` têm seu `.md` regerado |
| 3 | Artigos sem arquivo `.md` correspondente são gerados normalmente |
| 4 | Artigos removidos/despublicados têm seu `.md` excluído do disco |
| 5 | `--full` regera todos os arquivos ignorando `mtime` e `lastRun` |
| 6 | `first-post.md` nunca é removido |
| 7 | Uma falha parcial não compromete artigos já gerados na mesma execução |
| 8 | `saveLastRunTime` não é chamado se a execução lançar exceção |
| 9 | Cada site mantém seu próprio arquivo de controle isolado |