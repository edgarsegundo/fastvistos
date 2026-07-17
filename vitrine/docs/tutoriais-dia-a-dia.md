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

```bash
cd vitrine
uv run python manage.py runserver
```

Por padrão sobe em `http://127.0.0.1:8000/`.

### Trocando a porta

Se a porta 8000 estiver ocupada (ex: outro projeto Django rodando ao mesmo tempo, como o `microservicesadm`), use outra porta:

```bash
uv run python manage.py runserver 8010
```

### Parando o servidor

`Ctrl+C` no terminal onde ele está rodando.

### Atalho: runserver_plus + limpar cache

Existe um alias global no `~/.zshrc` (mesmo usado em outros projetos, como o `emprego`):

```bash
alias runserver='uv run python ./manage.py clearcache && uv run ./manage.py runserver_plus'
```

Rodando `runserver` de dentro da pasta `vitrine/`, ele:

1. Limpa o cache do Django (`clearcache` — comando custom em `core/management/commands/clearcache.py`).
2. Sobe o servidor com `runserver_plus` (do pacote `django-extensions`), que tem um debugger mais rico que o `runserver` padrão (via Werkzeug).

`django_extensions` só é carregado quando `DEBUG=True` (ver `INSTALLED_APPS` em `vitrine_core/settings.py`) — não deve ir pra produção.

## Criando um app Django

Um projeto Django é dividido em "apps" (módulos). O `vitrine_core/` é o projeto em si (settings, urls); cada funcionalidade nova vira um app separado.

```bash
cd vitrine
uv run python manage.py startapp nome_do_app
```

Isso cria a pasta `vitrine/nome_do_app/` com `models.py`, `views.py`, `admin.py`, etc.

### Depois de criar, registrar o app

Adicione o nome do app em `vitrine_core/settings.py`, na lista `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    ...
    'nome_do_app',
]
```

Sem esse passo o Django ignora o app (não gera migrations, não acha os models).

## Migrations (mudanças no banco)

Toda vez que você cria ou altera um `model` (em `models.py` de algum app), precisa de 2 passos:

### 1. Gerar o arquivo de migration

```bash
cd vitrine
uv run python manage.py makemigrations
```

Isso cria um arquivo em `nome_do_app/migrations/` descrevendo a mudança (não altera o banco ainda).

### 2. Aplicar a migration no banco

```bash
uv run python manage.py migrate
```

Isso executa de fato a mudança no `db.sqlite3`.

### Ver o estado das migrations

```bash
uv run python manage.py showmigrations
```

Mostra quais já foram aplicadas (`[X]`) e quais faltam (`[ ]`).

## Painel admin do Django

O Django já vem com um painel administrativo pronto em `/admin/`.

### Criando um usuário admin

```bash
cd vitrine
uv run python manage.py createsuperuser
```

Preencha usuário, e-mail (opcional) e senha.

### Acessando

Com o servidor rodando (`uv run python manage.py runserver`), acesse:

```
http://127.0.0.1:8000/admin/
```

### Mostrando um model no admin

Em `nome_do_app/admin.py`:

```python
from django.contrib import admin
from .models import MeuModel

admin.site.register(MeuModel)
```
