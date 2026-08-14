# Tutoriais — dia a dia do projeto vitrine (Django)

Guia rápido de comandos do dia a dia. Contexto: o `vitrine` é um projeto Django isolado dentro do repo `fastvistos`, com banco (SQLite) e ambiente próprios — não compartilha nada com o Astro/Node nem com o Prisma por enquanto.

## Ambiente Python com uv

O projeto `vitrine` usa o [uv](https://docs.astral.sh/uv/) para gerenciar o ambiente virtual e as dependências Python, em vez de `pip`/`venv` manual.

### Onde as coisas ficam

- `.venv/` — ambiente virtual, criado e gerenciado pelo uv (ignorado no git).
- `pyproject.toml` — lista de dependências do projeto.
- `uv.lock` — versões travadas (equivalente ao `package-lock.json`).
- `.python-version` — versão do Python usada (3.11).

### Rodando comandos

Sempre rode comandos Python através do `uv run`, de dentro da pasta `vitrine/`:

```bash
cd vitrine
uv run python manage.py <comando>
```

O `uv run` garante que o comando executa dentro do `.venv` do projeto, sem precisar ativar o ambiente manualmente (`source .venv/bin/activate`).

### Instalando uma dependência nova

```bash
cd vitrine
uv add nome-do-pacote
```

Isso já atualiza `pyproject.toml` e `uv.lock` automaticamente.

### Removendo uma dependência

```bash
uv remove nome-do-pacote
```

### Sincronizando o ambiente (ex: depois de um git pull)

```bash
uv sync
```

Reinstala exatamente as versões travadas em `uv.lock`.

## Rodando o servidor de desenvolvimento

cd vitrine && runserver

## Criando um app Django

cd vitrine && uv run python manage.py startapp nome_do_app

> Adicione o nome do app em `vitrine_core/settings.py`, na lista `INSTALLED_APPS`:
