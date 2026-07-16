# Configuração Astro do `fastvistos` — o que existe e por quê

> Objetivo deste documento: explicar cada peça da configuração Astro atual (por que existe,
> que problema resolve) para servir de base a um novo projeto que precisa da mesma capacidade
> multi-site, mas sem carregar o legado específico do fastvistos.

## 1. O problema que essa configuração resolve

Um único código-fonte Astro precisa gerar **N sites estáticos diferentes** (fastvistos, zenith,
emprego, zapsim, centraldevistos, flyfred, revistadoturismo, + sites de demo/teste — hoje 8+ sites
reais), cada um com:
- Domínio próprio, branding próprio (cores, logo, SEO, redes sociais)
- Conteúdo de blog próprio (via banco compartilhado, filtrado por `business_id`)
- Possibilidade de layout/componentes customizados por site (alguns sites herdam de um
  template, outros têm arquivos totalmente próprios)

A solução adotada é **"repo único, pasta por site, build parametrizado por env var"** — não é
multi-tenancy em runtime (não há servidor Node servindo requests dinamicamente por `Host`), é
**seleção em build-time** de qual pasta de fonte vira `dist/`.

## 2. Estrutura de pastas — o coração do sistema

```
multi-sites/
├── core/                    # Código COMPARTILHADO entre todos os sites
│   ├── components/          # Componentes Astro reutilizáveis (SEOMeta, JsonLd*, Analytics, etc.)
│   ├── layouts/
│   ├── pages/                # Páginas padrão (ex.: /blog) que sites sem override usam
│   ├── config/                # Configs compartilhadas (FAQ, serviços, vídeos de review)
│   ├── styles/                # CSS global/tema
│   └── msitesapp/            # Um servidor Express separado (não faz parte do build Astro)
│
├── sites/
│   ├── fastvistos/
│   │   ├── site-config.ts    # ⭐ A "identidade" do site: domínio, branding, SEO, features
│   │   ├── pages/            # Páginas específicas deste site (sobrescreve core/pages se existir)
│   │   ├── components/       # Componentes específicos (sobrescreve core/components)
│   │   ├── layouts/
│   │   ├── content/
│   │   ├── lib/
│   │   └── config/
│   ├── zenith/                (mesma estrutura)
│   ├── emprego/                (mesma estrutura)
│   └── ...                    (um diretório por site)
│
templates/
├── site-template-minimal/      # Esqueleto para `npm run create-site` (site novo, leve)
└── site-template-blog-heavy/   # Esqueleto com Header/Hero/MostRead/Carousel/Footer prontos
```

**Por quê essa estrutura:**
- `core/` existe para não duplicar componente/página em 8 lugares — mudança de SEO/JsonLd/Analytics
  se propaga a todos os sites de uma vez.
- Cada site em `sites/<id>/` pode **sobrescrever qualquer parte** do `core/` só criando um arquivo
  com o mesmo nome/caminho relativo — é resolução por precedência de pasta, não por config
  explícita (ver seção do `astro.config.mjs` sobre `srcDir`).
- `templates/` são pontos de partida copiados pelo `create-site.js` ao criar um site novo — não
  são usados em build, só na criação.

## 3. `astro.config.mjs` — por que é dinâmico

Normalmente um projeto Astro tem UM `astro.config.mjs` estático. Aqui ele é uma **função que se
reconfigura conforme a variável de ambiente `SITE_ID`**, porque o mesmo comando `astro build`
precisa produzir sites diferentes dependendo de qual `SITE_ID` foi passado.

### 3.1 Descoberta dinâmica dos sites (`loadSiteConfigurations`)

```js
const sitesDir = join(__dirname, 'multi-sites/sites');
// varre todo diretório dentro de multi-sites/sites/
// para cada um, importa o site-config.ts e monta um mapa { siteId: { domain, url, name, fullConfig } }
```

**Por quê:** o sitemap precisa saber a URL canônica de cada site para filtrar corretamente
(`sitemap.filter`) e nenhuma lista de sites é mantida manualmente em código — ela é **derivada da
existência de pastas**. Adicionar um site novo = criar a pasta, nada mais precisa ser registrado
em config central (isso é o que o roadmap de multi-tenant chama de "fóssil" — o registro real
deveria estar em banco/Django, mas hoje esse mapa em memória no config supre a necessidade).

Tem um fallback de parsing via regex quando `import()` de `.ts` falha (ambientes onde
`--experimental-strip-types` do Node não está disponível) — gambiarra deliberada, não remover
sem testar em todos os ambientes de execução (local vs CI vs VPS).

### 3.2 Seleção do site atual

```js
const CURRENT_SITE = process.env.SITE_ID || 'fastvistos';
const siteConfig = SITES[CURRENT_SITE] || SITES.fastvistos;
```

Esse é o pivô de tudo. Cada script `npm run build:<site>` no `package.json` seta `SITE_ID=<site>`
antes de chamar `astro build`. Isso é o que faz o mesmo `astro.config.mjs` virar N configs
diferentes.

### 3.3 As três pastas que mudam por site

```js
srcDir:    `./multi-sites/sites/${CURRENT_SITE}`,
publicDir: `./public/${CURRENT_SITE}`,
outDir:    `./dist/${CURRENT_SITE}`,
```

**Por quê:** isso é o mecanismo real de isolamento. Astro nativamente só sabe compilar UM
`srcDir`. Ao apontar `srcDir` para a pasta do site corrente, o Astro literalmente enxerga só
aquele site como se fosse um projeto Astro comum — o "multi-site" é uma ilusão de configuração,
não uma feature nativa do Astro. `outDir` separado evita builds de sites diferentes se
sobrescreverem.

Nota: `core/` **não** é `srcDir` nem está listado aqui — a integração `core` ↔ `site` acontece via
alias do Vite (seção 3.6), não por `srcDir` composto (Astro não suporta múltiplos `srcDir`).

### 3.4 Integrações — `mdx` e `sitemap`

- **`@astrojs/mdx`**: permite Markdown com componentes Astro embutidos — usado no conteúdo do
  blog e possivelmente em páginas institucionais que misturam texto e componentes.
- **`@astrojs/sitemap`**: gera `sitemap.xml` automaticamente. A parte custom aqui
  (`resolveChangefreq`, `resolvePriority`, `isBlocked`) existe porque o **SEO orgânico é a proposta
  de valor central do produto** (ver conversa anterior) — não é genérico, é calibrado por tipo de
  página (home muda mais que posts de blog, que mudam mais que uma home institucional
  publicada há meses). `lastmod` só é preenchido quando existe data real de modificação — decisão
  deliberada para não "enganar" o Google com data de build em todas as páginas (prática que pode
  ser vista como manipulação de sinal de SEO).

### 3.5 Proxies de dev (`vite.server.proxy`)

```js
'/image-editor'  → Django (X-API-Key)   # upload/crop de imagem via editor Toast UI
'/image-upload'  → image-service local  # microserviço próprio de imagem
'/article-image' → API local (3000)
```

**Por quê:** em dev, o Astro roda em `localhost:3000` mas precisa falar com o Django (upload de
imagem do editor) e com um microserviço de imagem separado. Proxy evita problema de CORS e permite
usar caminhos relativos no código (o browser sempre fala com `localhost:3000/image-editor`, o Vite
redireciona por trás). **Isso só existe em dev** — em produção quem resolve isso é o Nginx.

### 3.6 Alias (`resolve.alias`)

```js
'@core': '/multi-sites/core',
'@site': `/multi-sites/sites/${CURRENT_SITE}`,
'@':     `/multi-sites/sites/${CURRENT_SITE}`,
```

**Por quê:** dentro de um componente em `core/`, você às vezes precisa importar algo do site
atual (ex.: `site-config.ts`) sem saber estaticamente qual site é — o import usa `@site/...` e o
bundler resolve para a pasta certa em build-time, porque o alias muda conforme `CURRENT_SITE`.
Sem isso, `core/` não conseguiria ser verdadeiramente compartilhado (teria que duplicar-se por
site).

### 3.7 `define: { __SITE_CONFIG__, __CURRENT_SITE__ }`

Injeta o `site-config.ts` inteiro como uma constante global disponível em qualquer componente sem
import explícito — usado tipicamente para meta tags/JsonLd que precisam do config em quase toda
página.

### 3.8 Plugins customizados do Vite

- **`sitemap-xml-header`**: força `Content-Type: application/xml` em dev para `/sitemap.*` — sem
  isso o browser/alguns validadores tratam como texto puro e podem falhar validação.
- **`shared-dev-scripts`**: serve `/blog-image-editor.js` a partir de `public/` fora do fluxo
  normal do Astro — provavelmente porque esse script precisa ser idêntico entre sites e vivido
  fora de `public/<site>/` (que é por-site).

### 3.9 `output: 'static'` + `build.format: 'directory'`

**Decisão arquitetural central do produto**: sem servidor Node em produção, só arquivos HTML/CSS/JS
estáticos servidos por Nginx. Isso é o que entrega "carrega quase instantaneamente" (tese de
produto vs. concorrentes). `format: 'directory'` gera `/pagina/index.html` em vez de `/pagina.html`
— URLs mais limpas, padrão para SEO.

### 3.10 `markdown.shikiConfig`

Syntax highlight consistente (tema `github-dark`) tanto para MDX quanto para Markdown puro do
blog — mesma config repetida em `mdx()` e em `markdown:` porque são dois pipelines diferentes de
processamento de Markdown no Astro (um para arquivos `.mdx`, outro para `.md`/conteúdo dinâmico).

## 4. `package.json` — os scripts por site

Padrão repetido para cada site:

```json
"dev:<site>": "node sync-blog.js <site> && SITE_ID=<site> astro dev",
"dev:watch:<site>": "node dev-with-sync.js <site>",
"build:<site>": "node sync-blog.js <site> && SITE_ID=<site> astro build && node postbuild-updatable.js <site>",
"preview:<site>": "SITE_ID=<site> astro preview",
"download-images:<site>": "node download-blog-images.js <site>"
```

**Por quê esse padrão (não um script genérico `dev -- --site=X`):**
- `SITE_ID=<site>` antes do comando é o que aciona toda a lógica dinâmica do `astro.config.mjs`
  (seção 3.2).
- `sync-blog.js <site>` roda **antes** do dev/build — puxa conteúdo de blog do banco (via Prisma)
  para arquivos locais que o Astro consome em build-time (Astro não lê banco em runtime porque
  não há runtime — é tudo estático). Sem isso, o blog apareceria vazio no build.
- `postbuild-updatable.js` roda **depois** do build — provavelmente processa artefatos que
  precisam ser atualizáveis sem rebuild completo (ex.: algo que o `image-service` ou sync de
  imagens ainda precisa tocar).
- Scripts nomeados por site (em vez de um `--site=X` genérico) são mais simples de rodar
  (`npm run dev:fastvistos` é mais memorável e tab-completável que decorar flags), ao custo de
  o `package.json` crescer ~5 linhas por site novo — worth it até a escala atual (8 sites), mas é
  o primeiro lugar que vai doer se a plataforma crescer para dezenas/centenas de sites (nesse
  caso, um script genérico + `create-site.js` teria que também parar de tocar o `package.json`).

## 5. `create-site.js` — como um site novo nasce hoje

Fluxo (resumido, script completo tem ~700 linhas):
1. Pergunta interativamente (ou via flags `--nome=valor`) os dados do site: nome, domínio,
   template (`site-template-minimal` ou `site-template-blog-heavy`), cores, contato, etc.
2. Copia o template escolhido para `multi-sites/sites/<novo-site>/`, substituindo placeholders
   `[PLACEHOLDER]` nos arquivos.
3. Cria o registro do negócio: hoje isso é `prisma.business.create` **direto no MySQL**,
   contornando o Django — esse é o "Gap #3" do documento de arquitetura multi-tenant
   (`README-arquitetura-multi-tenant-etapa1.md`), fonte de risco ativo (dois caminhos de escrita
   para a tabela `business`).
4. Adiciona os scripts `dev:<site>`/`build:<site>`/etc. ao `package.json` automaticamente.

**Relevante para replicar em projeto novo:** o mecanismo de "copiar template + substituir
placeholder + registrar no banco + gerar scripts" é reaproveitável, mas o passo 3 (escrita direta
no Prisma) é especificamente algo a **não replicar** no projeto novo se a intenção é o Django ser
a fonte de verdade desde o início (ver Etapa 2 do roadmap).

## 6. Prisma — por que existe e como é usado

- **`prisma/schema.prisma`** é gerado via `prisma db pull` — **não é escrito à mão**, é um espelho
  automático do schema MySQL que o Django já gerencia via suas próprias migrations. O Astro nunca
  roda migration; ele só lê (e em alguns pontos específicos, como `create-site.js`, escreve
  diretamente — o que é o gap conhecido).
- **Por que ler direto do banco em vez de API**: decisão de performance/simplicidade — em
  build-time, uma leitura direta ao MySQL é mais rápida e não introduz dependência de uptime de
  uma API externa durante o build. Isso só é seguro porque o build roda num ambiente de confiança
  (CI/VPS), não no browser do usuário final.
- **`sync-blog.js`** é o script que de fato usa o Prisma Client para puxar artigos/config de blog
  do banco e materializar em arquivos que o Astro processa (arquivos são mais rápidos e simples de
  consumir dentro do pipeline de build do Astro do que uma query async espalhada pelos
  componentes).

## 7. Variáveis de ambiente — o que cada uma faz

| Variável | Usada em | Propósito |
|---|---|---|
| `SITE_ID` | `astro.config.mjs`, todo script `*:<site>` | Seleciona qual site está sendo buildado |
| `DATABASE_URL` | Prisma | Conexão MySQL compartilhada com Django |
| `DJANGO_API_BASE_URL` | proxy `/image-editor` (dev) | Onde está o backend Django |
| `DJANGO_MICROSERVICESADM_KEY` | proxy `/image-editor` (dev) | Autenticação `X-API-Key` para chamar Django |
| `IMAGE_SERVICE_URL` | proxy `/image-upload` (dev) | Microserviço de imagem separado |
| `API_BASE_URL` | proxy `/article-image` (dev), scripts | Base da própria API do Astro (quando aplicável) |
| `PORT` | `server.port` | Porta do `astro dev`/`preview` |
| `OPENAI_API_KEY` | `msitesapp`, geração de conteúdo | Chamadas a LLM (fora do escopo Astro core) |

## 8. Peças que NÃO fazem parte do "core" replicável

- **`multi-sites/core/msitesapp/`**: é um **servidor Express separado**, não faz parte do pipeline
  Astro — parece ser uma API auxiliar (admin/api routes) rodando paralelamente. Avaliar caso a
  caso se o projeto novo precisa disso; não é parte da "config Astro" em si.
- **Scripts órfãos/mortos** (confirmados no doc de arquitetura): `generate-site-registry.js`
  (referenciado no `package.json`, arquivo não existe) — não replicar, é dívida técnica conhecida.
- **Sites de demo/teste** (`demo-minimal`, `demo-blogheavy`, `test-skip`, `final-test-*`, etc.):
  específicos deste repo, não fazem parte da "configuração", são conteúdo.

## 9. Resumo do que é essencial replicar vs. específico do fastvistos

**Essencial (mecanismo, replicar sempre):**
- Padrão `srcDir`/`publicDir`/`outDir` parametrizado por `SITE_ID`
- `loadSiteConfigurations()` (descoberta dinâmica de sites por pasta)
- Estrutura `core/` (compartilhado) + `sites/<id>/` (override por site) + alias `@core`/`@site`
- `output: 'static'` + `build.format: 'directory'`
- Padrão de scripts `dev:<site>`/`build:<site>` no `package.json` (ou evoluir para genérico)
- `templates/` + script de criação de site (adaptando o passo de persistência para chamar API,
  não escrever direto no banco, se o novo projeto já nasce com Django como fonte de verdade)

**Específico do fastvistos (adaptar/remover no projeto novo):**
- Conteúdo dos sites (`sites/fastvistos`, `sites/zenith`, etc.)
- Proxies de dev apontando para o Django/image-service **deste** projeto
- `SITEMAP_BLOCKLIST`, regras de `changefreq`/`priority` específicas do domínio de vistos
- `msitesapp/` (servidor Express auxiliar) — avaliar se o novo projeto precisa de equivalente
- Schema Prisma (é gerado a partir do banco do Django deste projeto — no projeto novo, será
  gerado a partir do banco do **novo** Django)
