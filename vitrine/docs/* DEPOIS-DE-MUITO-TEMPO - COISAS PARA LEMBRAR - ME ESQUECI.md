# Como usar este arquivo

Padrão: cada seção começa com **uma frase descritiva** (não título genérico).  
Conteúdo: ultra resumido — só o essencial pra relembrar e agir rápido.  
Alvo: você voltando depois de semanas sem mexer no projeto.

---

# Quanto tempo faz que não rodo este projeto e esqueci onde parei — como faço pra continuar desenvolvendo?

```bash
cd vitrine
# somente se clonei o projeto e estou rodando pela primeira vez
  uv sync
  uv run python manage.py migrate
  uv run python manage.py createsuperuser
runserver  # ou: uv run python manage.py runserver 8010
```

> Estou usando o login: `edgar.segundo@gmail.com` e senha Flor...

## Como buildar e acessar o editor visual de páginas em 8001?

### Opção 1: Servir o build estático (preview rápido)

```bash
# Terminal 1: Django rodando em 8000
cd vitrine && runserver

# Terminal 2: Build + servir em 8001
cd multi-sites
npm run build:_saas  # Gera /dist/_saas/
cd ../dist/agencia-marketing  # (ou seu projeto)
python -m http.server 8001
```

Acesse: `http://localhost:8001/` → vê as páginas já buildadas

### Opção 2: Editor visual inline no Admin (futuro)

Adicionar TinyMCE/CodeMirror no fieldset `content` do PageAdmin para editar HTML/Markdown com preview live.

### Opção 3: Frontend separado em React/Vue (futuro)

Criar um SPA que roda em 8001, comunica com `/api/projects/` do Django.
