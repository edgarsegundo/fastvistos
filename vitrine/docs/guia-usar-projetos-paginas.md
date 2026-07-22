# Guia: Como Usar Projetos e Páginas Dinâmicas

## O que foi implementado

✅ **Models Django:**
- `Project` — um projeto/site criado por usuário do SaaS
- `Page` — uma página dentro de um projeto

✅ **API Django:**
- `GET /api/projects/` — lista todos os projetos publicados
- `GET /api/projects/{slug}/pages/` — lista todas as páginas de um projeto
- `POST /api/trigger-rebuild/` — dispara rebuild

✅ **Rota Astro:**
- `multi-sites/core/pages/[project]/[...slug].astro` — renderiza dinamicamente qualquer projeto + página

✅ **Admin Django:**
- Interface para criar/editar projetos e páginas
- Signals automáticos para marcar rebuild

✅ **Management Command:**
- `python manage.py build_static_sites` — constrói HTML estático

---

## Guia Passo a Passo: Criar Agência de Marketing

### 1. Acessar o Admin Django

```
http://localhost:8000/admin/
```

Log in com uma conta de superuser ou staff.

### 2. Criar um Projeto

1. No menu lateral, procure **"Projetos"** (Projeto → Add)
2. Preencha:
   ```
   Name:        Agência de Marketing
   Slug:        agencia-marketing
   Description: A melhor agência de marketing de Brasília
   Published:   ✓ (checked)
   ```
3. Clique **SAVE**

**Resultado:**
- Projeto criado no DB
- Signal automático marca `needs_rebuild = True`
- Pronto para adicionar páginas

### 3. Criar Página HOME

1. Menu lateral → **"Páginas"** → **Add**
2. Preencha:
   ```
   Project:           Agência de Marketing
   Title:             Home
   Slug:              (deixe vazio = página inicial)
   Is Home:           ✓ (checked)
   Published:         ✓ (checked)
   Order:             0
   SEO Title:         Agência de Marketing - Serviços Profissionais
   SEO Description:   Transformamos negócios com marketing estratégico
   ```

3. **Content (Markdown):**
   ```markdown
   # Bem-vindo à Agência de Marketing

   Somos especialistas em **marketing digital** com 10 anos de experiência.

   ## O que oferecemos
   - Google Ads
   - Social Media
   - Email Marketing
   - Consultoria Estratégica

   [Veja nossos casos de sucesso →](/agencia-marketing/portfolio/)
   ```

4. Clique **SAVE**

**Resultado:**
- Página criada
- Signal automático marca `Project.needs_rebuild = True`

### 4. Criar Página SERVIÇOS

1. Menu → **"Páginas"** → **Add**
2. Preencha:
   ```
   Project:  Agência de Marketing
   Title:    Serviços
   Slug:     servicos
   Order:    1
   ```

3. **Content:**
   ```markdown
   # Nossos Serviços

   ## Google Ads
   Campanhas altamente direcionadas para gerar leads qualificados.
   **Preço:** A partir de R$ 2.000/mês

   ## Social Media
   Gestão de redes sociais (Instagram, LinkedIn, Facebook).
   **Preço:** A partir de R$ 1.500/mês

   ## Email Marketing
   Automação e segmentação para aumentar conversões.
   **Preço:** A partir de R$ 1.000/mês
   ```

4. Clique **SAVE**

### 5. Criar Página PORTFÓLIO

Repetir o processo com:
- **Title:** Portfólio
- **Slug:** portfolio
- **Order:** 2
- **Content:** (casos de sucesso em Markdown)

---

## Após Criar Páginas: Disparar Build

### Opção A: Via Terminal (Recomendado para teste)

```bash
cd /Users/edgar/Repos/fastvistos/vitrine
python manage.py build_static_sites
```

**Saída esperada:**
```
🔨 Building 1 project(s)...
📦 Running: npm run build

✅ Build completed successfully
```

**O que acontece:**
1. Astro executa `npm run build`
2. Astro roda `getStaticPaths()` em `[project]/[...slug].astro`
3. Busca `/api/projects/` → encontra "agencia-marketing"
4. Busca `/api/projects/agencia-marketing/pages/` → encontra 3 páginas
5. Gera 3 arquivos HTML em `/dist/`:
   - `/dist/agencia-marketing/index.html` (Home)
   - `/dist/agencia-marketing/servicos/index.html` (Serviços)
   - `/dist/agencia-marketing/portfolio/index.html` (Portfólio)

### Opção B: Via API

```bash
curl -X POST http://localhost:8000/api/trigger-rebuild/
```

(Executa em background)

---

## Acessar o Site

Depois do build, os arquivos estáticos estão em `/dist/`:

```
/dist/agencia-marketing/
├── index.html                    # /agencia-marketing/
├── servicos/
│   └── index.html               # /agencia-marketing/servicos/
└── portfolio/
    └── index.html               # /agencia-marketing/portfolio/
```

### Estrutura de URLs

| URL | Arquivo | Conteúdo |
|---|---|---|
| `/agencia-marketing/` | `/dist/agencia-marketing/index.html` | Home |
| `/agencia-marketing/servicos/` | `/dist/agencia-marketing/servicos/index.html` | Serviços |
| `/agencia-marketing/portfolio/` | `/dist/agencia-marketing/portfolio/index.html` | Portfólio |

---

## Editar uma Página

### Cenário: Adicionar novo serviço

1. Admin → **"Páginas"** → clique na página **"Serviços"**
2. Edite o Markdown, adicione:
   ```markdown
   ## Video Marketing
   Produção de vídeos para redes sociais.
   **Preço:** A partir de R$ 3.000/mês
   ```
3. Clique **SAVE**

**Automaticamente:**
- Signal marca `Project.needs_rebuild = True`
- Você pode disparar um novo build

4. Build novamente:
   ```bash
   python manage.py build_static_sites
   ```

5. Resultado:
   - `/dist/agencia-marketing/servicos/index.html` é **regenerado**
   - Novo HTML contém a seção "Video Marketing"
   - Usuários veem a mudança instantaneamente

---

## API: Testar Manualmente

### Listar Projetos

```bash
curl http://localhost:8000/api/projects/
```

**Resposta:**
```json
[
    {
        "id": 1,
        "slug": "agencia-marketing",
        "name": "Agência de Marketing",
        "description": "A melhor agência de marketing de Brasília"
    }
]
```

### Listar Páginas de um Projeto

```bash
curl http://localhost:8000/api/projects/agencia-marketing/pages/
```

**Resposta:**
```json
[
    {
        "slug": "",
        "title": "Home",
        "content_markdown": "# Bem-vindo...",
        "seo_title": "Agência de Marketing - Serviços Profissionais",
        "seo_description": "Transformamos negócios...",
        "modified": "2026-07-21T16:34:11.485Z"
    },
    {
        "slug": "servicos",
        "title": "Serviços",
        "content_markdown": "# Nossos Serviços...",
        ...
    },
    ...
]
```

---

## Management Command: Opções Avançadas

### Forçar rebuild de todos os projetos

```bash
python manage.py build_static_sites --force
```

### Rebuild apenas um projeto específico

```bash
python manage.py build_static_sites --project agencia-marketing
```

### Rebuild e force

```bash
python manage.py build_static_sites --project agencia-marketing --force
```

---

## Estrutura de Arquivos Criados

```
vitrine/
├── core/
│   ├── models.py                    # ✨ Project, Page models
│   ├── signals.py                   # ✨ Auto-rebuild signals
│   ├── views.py                     # ✨ API views
│   ├── admin.py                     # ✨ Admin registration
│   ├── apps.py                      # ✨ Signal registration
│   └── management/commands/
│       └── build_static_sites.py    # ✨ Build command
└── vitrine_core/
    └── urls.py                      # ✨ API routes

multi-sites/
└── core/
    └── pages/
        └── [project]/
            └── [...slug].astro      # ✨ Dynamic route
```

---

## Troubleshooting

### "Project not found" ao acessar API

Verifique:
1. Projeto está marcado como `is_published = True`?
2. Slug está correto? (sem espaços ou caracteres especiais)

### "Cannot resolve keyword 'X'" ao testar API

Se ver erro de campo não encontrado:
1. Verifique o nome correto do campo em `models.py`
2. Run migrations: `python manage.py migrate`

### Build falha com "npm not found"

Certifique-se que Node.js está instalado:
```bash
npm --version
which npm
```

### Página vazia/sem conteúdo

1. Verifique se `is_published = True`
2. Markdown está correto? (teste em um editor Markdown)
3. Build rodou? (verifique se `/dist/` tem os arquivos)

---

## Próximos Passos Opcionais

1. **Deploy em produção:** Configurar Nginx para servir `/dist/` estaticamente
2. **Webhooks automáticos:** Configurar webhook que dispara build automaticamente ao editar página
3. **Templates de página:** Criar templates oferecidos (landing page, blog post, etc.)
4. **Preview antes de publicar:** Adicionar modo "draft" com URL temporária
5. **Versioning:** Salvar histórico de edições de página

---

## Resumo do Fluxo

```
1. Criar Projeto no Admin
   ↓
2. Criar Páginas (Home, Serviços, Portfólio)
   ↓ Signal: needs_rebuild = True
3. Disparar Build
   ↓ python manage.py build_static_sites
4. Astro executa getStaticPaths()
   ↓ Fetch /api/projects/ + /api/projects/{slug}/pages/
5. Gera HTMLs em /dist/
   ↓
6. Nginx serve arquivos estáticos
   ↓
7. Usuário acessa /agencia-marketing/ → vê HTML estático puro
```

Tudo pronto! 🚀
