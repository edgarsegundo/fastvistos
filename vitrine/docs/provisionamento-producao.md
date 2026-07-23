# Provisionamento de Produção — Fase Reduzida (domínio próprio, sem Certbot)

Este documento segue **exatamente** o padrão já usado nos outros Django apps
do VPS (`emprego`/`empregoadmin`, `microservicesadm`) — mesmo `Dockerfile`,
mesmo `docker-compose.yml`, mesmo estilo de config Nginx, mesmos scripts de
deploy. Onde algo é específico do `vitrine` (SaaS de projetos), está
destacado.

## Escopo deste documento

Colocar o Django (`vitrine`) rodando em produção no VPS (`72.60.57.150`),
publicando projetos do SaaS sob um domínio **que você já possui e já tem
SSL configurado**. Path-based (`seudominio.com/{project_slug}/`), não
subdomínio nem domínio customizado por projeto.

## ✅ Já criado e testado no repo (não precisa copiar do zero)

- `vitrine/Dockerfile`, `vitrine/run.sh`, `vitrine/docker-compose.yml` —
  já existem, buildei e rodei localmente (`docker build` + `docker run`):
  migrations aplicam, `collectstatic` funciona, gunicorn sobe, `/admin/login/`
  responde `200`. Só falta ajustar o path do volume Astro
  (`docker-compose.yml`, comentário `AJUSTE`) pro caminho real no seu VPS.
- `STATIC_ROOT` e `LOGIN_URL` já adicionados em `vitrine_core/settings.py`
  (faltavam — sem `STATIC_ROOT`, o `collectstatic` do `run.sh` crashava).
- `gunicorn` já adicionado ao `pyproject.toml`.

Os passos abaixo que dizem "criar arquivo X" na verdade já existem — leia
como "revisar/ajustar pro seu ambiente real", não "escrever do zero".

**Fora de escopo aqui** (fica pra quando quiser abrir o SaaS pra usuários
trazerem o próprio domínio): automação de Certbot
(`provision_domain_nginx_ssl()`), verificação de DNS de terceiros
(`verify_domain_dns()`), o model `Domain` e as actions "Verificar
DNS"/"Provisionar (Nginx + SSL)" no admin. Esse código já existe e continua
funcionando quando você decidir usar.

## Referências (o que copiei do seu setup real)

- `/Users/edgar/Repos/emprego/Dockerfile`, `run.sh`, `docker-compose.yml`
- `/Users/edgar/Repos/emprego/empregoadmin/empregoadmin/settings.py`
  (seção `IS_PROD`)
- `/Users/edgar/Repos/reverse-proxy-config/sites/020-empregoadmin.conf`
- `/Users/edgar/Repos/reverse-proxy-config/docker-compose.yml`
- `/Users/edgar/Repos/reverse-proxy-config/create-vol.sh`,
  `create_ssl.sh`, `create-astro-site-conf.sh`, `rebuild.sh` (do emprego)

## Arquitetura resultante

```
                    saas.fastvistos.com.br (subdomínio dedicado, cert próprio,
                    config em reverse-proxy-config/sites/030-saas-fastvistos.conf)
                                  │
                    ┌─────────────┴──────────────┐
                    │   nginx (container, já existe)  │
                    └─────────────┬──────────────┘
              ┌───────────────────┼────────────────────────┐
              │                                              │
   location /admin/, /preview/                    location ~ ^/app/([a-z0-9-]+)/
   location /static/                               root /var/www/_saas  ◄── 1 ÚNICO
   proxy_pass → vitrine:8000                        (todos os projetos       bind mount,
   (mesmos paths do Django, sem prefixo —            aninhados aqui)         criado 1x
    subdomínio dedicado não tem colisão)
              │
   ┌──────────┴──────────┐
   │  vitrine (container   │  ← novo, mesmo padrão do empregoadmin
   │  novo, gunicorn)       │
   └──────────┬──────────┘
              │ ssh (deploybot, forced command)
              ▼
   rsync-release / switch-symlink / reload-nginx
   → escreve em /var/www/_saas/{project_slug}/releases/{ts}/
```

**Por que `/var/www/_saas` como 1 diretório único, não 1 mount por
projeto**: no `create-vol.sh` (usado pros sites legados), cada `/var/www/*`
novo exige adicionar uma linha no `docker-compose.yml` do Nginx **e
recriar o container** (`docker compose up -d --no-deps --build nginx`) —
aceitável pra sites cadastrados manualmente à mão, mas não escala pra um
SaaS onde qualquer usuário cria um projeto novo a qualquer momento (cada
criação exigiria mexer em infra e reiniciar o Nginx pra todo mundo). Por
isso o `core/deploy.py` já está desenhado pra aninhar **todos** os projetos
sob 1 pasta pai (`_saas`) — você monta essa pasta **uma única vez** (Passo
3), e todo projeto novo criado depois já aparece automaticamente lá dentro,
sem tocar em Docker/Nginx de novo.

---

## Passo 1 — `vitrine/Dockerfile` ✅ já existe no repo (mesmo padrão do `emprego`)

```dockerfile
# Stage 1: Builder - gera requirements.txt com uv (mesmo padrão do empregoadmin)
FROM python:3.11-slim AS builder
WORKDIR /app
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv
COPY pyproject.toml ./
RUN uv pip install --requirements pyproject.toml --system
RUN uv pip freeze > requirements.txt

FROM python:3.11-slim
WORKDIR /app
ENV DEBIAN_FRONTEND=noninteractive

# Node.js: o build do Astro (core/deploy.py: build_project()) roda
# `npm run build:_saas` via subprocess DE DENTRO deste container — precisa
# de Node instalado aqui, não só Python.
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    pkg-config \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system django && adduser --system --ingroup django django
RUN mkdir -p /home/django && chown -R django:django /home/django
ENV HOME=/home/django
ENV TMPDIR=/tmp

COPY --from=builder /app/requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

RUN mkdir -p /app/staticfiles \
    && chown -R django:django /app

EXPOSE 8000

COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

USER django
CMD ["/app/run.sh"]
```

**Diferença importante em relação ao `emprego`**: o `vitrine` não roda
sozinho — ele precisa rodar `npm run build:_saas` (Astro) dentro do mesmo
container ou alcançar o repo Astro de alguma forma. Duas opções:

- **(A) Recomendado pra este MVP**: montar o repo Astro inteiro do host
  como volume (`- /home/edgar/Repos/fastvistos:/app/astro-repo`), reaproveita
  o `node_modules` já instalado no host — não precisa instalar Node na
  imagem nem duplicar `npm install`. **Ajuste**: se for essa opção, pode
  remover o bloco `curl ... nodesource ... nodejs` do Dockerfile acima (Node
  já existe no host, só precisa estar acessível via volume + `PATH`, ou
  instalar Node no container mesmo assim se o volume não tiver `node`
  global — mais simples manter Node no container e só montar o repo).
- **(B) Mais "correto" a longo prazo**: build roda num worker separado
  (fora do container do Django), comunicado via fila. Mais trabalho, fica
  pra quando precisar escalar — não necessário agora.

Este documento assume **(A)**.

## Passo 2 — `vitrine/run.sh` ✅ já existe (mesmo padrão do `emprego`, sync não ASGI)

`vitrine` não usa websockets/async (diferente do `empregoadmin`), então
`gunicorn` com workers síncronos é suficiente — sem `UvicornWorker`.
Mesmo assim, aplicando a mesma lição documentada em
`emprego/docs/README.gunicorn-docker-optimization.md` (reciclar workers
evita degradação de memória progressiva):

```sh
#!/bin/sh
set -e

cd /app

echo "Aplicando migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting gunicorn..."
exec gunicorn vitrine_core.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --max-requests 500 \
    --max-requests-jitter 100 \
    --log-level info
```

Adicionar `gunicorn` ao `vitrine/pyproject.toml`:

```toml
dependencies = [
    ...
    "gunicorn>=21.2.0",
]
```

Se for usar MySQL compartilhado (Passo 5), adicionar também
`mysqlclient>=2.2.0` (mesma lib que o `empregoadmin` usa, requer os pacotes
`build-essential`/`default-libmysqlclient-dev` no Dockerfile — adicionar ao
`apt-get install` acima se for esse o caminho).

## Passo 3 — `vitrine/docker-compose.yml` ✅ já existe (**AJUSTAR** o path do volume Astro) + montar `/var/www/_saas` no VPS (manual)

Mesmo padrão do `emprego/docker-compose.yml` (`proxy-network` externa,
`env_file`, volume de staticfiles nomeado e externo):

```yaml
services:
  vitrine:
    container_name: vitrine
    build: .
    ports:
      - "8003:8000"   # 8000 (microservicesadm) e 8002 (empregoadmin) já em uso
    env_file:
      - ./.env
    environment:
      PYTHONOPTIMIZE: "1"
    restart: always
    networks:
      - proxy-network
    volumes:
      - vitrine_staticfiles:/app/staticfiles
      - /home/edgar/Repos/fastvistos:/app/astro-repo   # ver nota do Passo 1
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "3"

networks:
  proxy-network:
    external: true
    name: nginx-proxy-network

volumes:
  vitrine_staticfiles:
    external: true
```

Criar o volume externo antes do primeiro `docker compose up` (mesmo passo
que os outros apps já fizeram):

```bash
docker volume create vitrine_staticfiles
```

### Montar `/var/www/_saas` no container do Nginx (1 vez só)

No repo `reverse-proxy-config` (que já tem o script pronto pra isso):

```bash
cd ~/Repos/reverse-proxy-config
sudo mkdir -p /var/www/_saas
sudo chown -R "$(whoami)":www-data /var/www/_saas
./create-vol.sh
# Quando perguntar o path, digitar: /var/www/_saas
```

Isso adiciona a linha `- /var/www/_saas:/var/www/_saas:ro` ao
`docker-compose.yml` do Nginx e recria o container **uma única vez** — todo
projeto criado depois já aparece automaticamente ali dentro, sem repetir
esse passo.

## Passo 4 — Ajustes em `vitrine_core/settings.py` (`STATIC_ROOT`/`LOGIN_URL` ✅ já feitos; bloco `IS_PROD` abaixo ainda **manual**, depende do seu domínio real)

`STATIC_ROOT` e `LOGIN_URL` já foram adicionados. O bloco `IS_PROD` abaixo
não dá pra eu preencher sozinho — depende de qual domínio/URL você escolheu
no Passo 6, então fica como próximo passo seu (mesmo padrão `IS_PROD` do
`empregoadmin`):

```python
IS_PROD = os.environ.get('DJANGO_ENV', 'dev') == 'prod'

if IS_PROD:
    ALLOWED_HOSTS = [
        'seudominio.com',
        'www.seudominio.com',
        'vitrine',  # acesso interno via nome do container
        'localhost',
        '127.0.0.1',
    ]

    CSRF_TRUSTED_ORIGINS = [
        'https://seudominio.com',
        'https://www.seudominio.com',
    ]

    # Nginx conversa com o Gunicorn via HTTP simples (proxy_pass http://vitrine:8000),
    # mesmo com o client original usando HTTPS — sem isso, Django entra em loop de
    # redirect (SECURE_SSL_REDIRECT vê a conexão interna como HTTP e redireciona de novo).
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = 'static/'   # já é o default, bate com /static/ do Nginx (Passo 6)
LOGIN_URL = '/admin/login/'   # já é o default, bate com /admin/ do Nginx (Passo 6)
```
(`STATIC_ROOT`, `STATIC_URL` e `LOGIN_URL` já foram adicionados como
default no `settings.py` — nenhum ajuste extra necessário aqui, subdomínio
dedicado significa não precisar de prefixo `-saas`.)

**Banco de dados**: o `settings.py` atual usa SQLite (`DATABASES` fixo, sem
`if IS_PROD`). Pra este escopo reduzido, SQLite continua funcionando (é 1
app pequeno, sem concorrência pesada) — mas como o VPS já tem `mysql:8.0`
compartilhado, considere migrar seguindo o padrão exato do `empregoadmin`
(`empregoadmin/empregoadmin/settings.py`, bloco `if IS_PROD: DATABASES = {...}`):

```python
if IS_PROD:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': 'vitrine',
            'USER': 'vitrine_appuser',
            'PASSWORD': os.environ.get('MYSQL_USERPASS'),
            'HOST': 'mysql',
            'PORT': '3306',
            'OPTIONS': {
                'charset': 'utf8mb4',
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES', time_zone = '+00:00'",
            },
            'CONN_MAX_AGE': 60,
        }
    }
```

Precisa criar o database + user no MySQL compartilhado antes (via
`docker exec -it mysql mysql -u root -p`):

```sql
CREATE DATABASE vitrine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vitrine_appuser'@'%' IDENTIFIED BY 'senha-forte-aqui';
GRANT ALL PRIVILEGES ON vitrine.* TO 'vitrine_appuser'@'%';
FLUSH PRIVILEGES;
```

Decisão sua se quer migrar pro MySQL agora ou manter SQLite (nesse caso,
adicionar um volume nomeado pro arquivo `db.sqlite3` persistir entre
rebuilds do container).

## Passo 5 — `vitrine/.env` (produção)

```bash
DJANGO_ENV=prod
SECRET_KEY=<gerar uma chave nova, nunca reusar a de dev>
DEBUG=False

ASTRO_ROOT=/app/astro-repo          # bate com o volume montado no Passo 3
PLATFORM_SITE_ID=_saas
VPS_PUBLIC_IP=72.60.57.150

DEPLOY_SSH_HOST=localhost
DEPLOY_SSH_USER=deploybot
DEPLOY_SSH_KEY_PATH=/etc/vitrine/deploy_key
WWW_ROOT=/var/www

# Opcional: protege /api/projects/ além da checagem de localhost já existente.
# Se setar, precisa também atualizar o fetch() do Astro pra mandar o header
# X-Build-Secret (gap conhecido, ainda não implementado no [...slug].astro).
BUILD_API_SECRET=

# Se for usar MySQL (ver Passo 4):
# MYSQL_USERPASS=<senha do usuário vitrine_appuser>
```

## Passo 6 — Nginx: `saas.fastvistos.com.br` (decisão final)

**Decisão tomada**: subdomínio dedicado `saas.fastvistos.com.br`, projetos
sob prefixo `/app/{slug}/`. Escolhido porque **nunca edita o
`000-fastvistos.conf`** que já serve o site legado ao vivo — o único custo
é emitir 1 certificado novo, uma vez, isolado.

**Correção importante (achada testando de verdade)**: como este é um
subdomínio **dedicado** (nada mais roda nele), não existe risco de colisão
de path — por isso o Django é exposto **sem** prefixo extra
(`/admin/`, `/preview/`, `/static/`, iguais ao que o `urls.py`/`settings.py`
já usam). Uma primeira versão usava `/admin-saas/` fazendo
`proxy_pass .../admin/` (troca de prefixo), mas isso quebra os redirects
do Django: o `LOGIN_URL`/`reverse()` geram `/admin/login/` (path interno,
sem o prefixo), o browser segue esse `Location`, e o Nginx não tem nenhum
location pra `/admin/` puro → 404. Solução: nginx expõe exatamente os
mesmos paths que o Django já usa internamente, sem tradução nenhuma.

### 6.1 — DNS (fazer ANTES do Certbot, senão a validação falha)

Criar um registro **A** apontando o subdomínio pro IP do VPS:

```
Tipo: A
Nome: saas
Destino: 72.60.57.150
```

Confirmar propagação antes de continuar:
```bash
dig +short saas.fastvistos.com.br
# precisa retornar 72.60.57.150
```

### 6.2 — Config HTTP-only temporária (só pra passar no desafio ACME)

Criar `reverse-proxy-config/sites/030-saas-fastvistos.conf`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name saas.fastvistos.com.br;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://saas.fastvistos.com.br$request_uri;
    }
}
```

```bash
cd ~/Repos/reverse-proxy-config
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```

### 6.3 — Emitir o certificado (mesmo comando usado pelo `create-astro-site-conf.sh`)

```bash
cd ~/Repos/reverse-proxy-config
docker run -it --rm \
  -v "$(pwd)/certbot-challenges:/var/www/certbot" \
  -v "$(pwd)/letsencrypt:/etc/letsencrypt" \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  --config-dir /etc/letsencrypt \
  --work-dir /etc/letsencrypt/work \
  --logs-dir /etc/letsencrypt/logs \
  -d saas.fastvistos.com.br
```

Se der certo, os arquivos aparecem em
`./letsencrypt/live/saas.fastvistos.com.br/{fullchain,privkey}.pem`.

### 6.4 — Config final (substitui o arquivo do 6.2)

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name saas.fastvistos.com.br;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://saas.fastvistos.com.br$request_uri;
    }
}

# HTTPS server block
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name saas.fastvistos.com.br;

    client_max_body_size 10M;

    ssl_certificate /etc/letsencrypt/live/saas.fastvistos.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saas.fastvistos.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location /static/ {
        alias /app/staticfiles/;   # volume vitrine_staticfiles, montado read-only aqui
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Sem prefixo — /admin/ do Nginx bate 1:1 com /admin/ do Django (urls.py),
    # então LOGIN_URL, reverse(), redirects do admin funcionam sem tradução.
    location /admin/ {
        proxy_pass http://vitrine:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Preview de páginas (core.views.preview_page) — link "👁 Ver Preview" no admin
    location /preview/ {
        proxy_pass http://vitrine:8000/preview/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Cadastro/login público (core.views.AuthView) — porta de entrada do SaaS
    location /entrar/ {
        proxy_pass http://vitrine:8000/entrar/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # django-allauth (login social, callback do Google OAuth)
    location /accounts/ {
        proxy_pass http://vitrine:8000/accounts/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Cada projeto publicado vira /app/{project_slug}/ neste subdomínio.
    # root aponta pro diretório pai único (Passo 3) — nenhum projeto novo
    # precisa de mudança aqui.
    location ~ ^/app/([a-z0-9-]+)/ {
        root /var/www/_saas;
        try_files /$1/current$uri /$1/current$uri/ /$1/current/index.html =404;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
```

Adicionar o volume do staticfiles ao `docker-compose.yml` do Nginx
(`reverse-proxy-config/docker-compose.yml`, junto dos outros
`*_staticfiles`):

```yaml
volumes:
  vitrine_staticfiles:
    external: true
```

E no serviço `nginx`:
```yaml
    volumes:
      ...
      - vitrine_staticfiles:/app/staticfiles:ro
```

Testar e recarregar:
```bash
cd ~/Repos/reverse-proxy-config
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```

### 6.5 — Atualizar `vitrine/.env` no VPS com o domínio real

```bash
DEBUG=False
ALLOWED_HOSTS=saas.fastvistos.com.br,vitrine,localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://saas.fastvistos.com.br
```
```bash
cd ~/Repos/fastvistos_saas/vitrine
docker compose up -d --build   # recria com o .env novo
```

## Passo 7 — Usuário restrito `deploybot` (build/deploy, SEM Certbot ainda)

Necessário desde já — o "Build & Publicar" do admin (`core/deploy.py`)
depende disso independente da automação de domínio customizado.

1. Criar o usuário:
   ```bash
   sudo useradd -m -s /bin/bash deploybot
   sudo mkdir -p /home/deploybot/.ssh
   sudo chown -R deploybot:deploybot /home/deploybot/.ssh
   ```

2. Gerar par de chaves (guardar a privada onde `DEPLOY_SSH_KEY_PATH`
   aponta — se o Django roda em container, monte esse arquivo como volume
   read-only no serviço `vitrine`):
   ```bash
   ssh-keygen -t ed25519 -f /etc/vitrine/deploy_key -N ""
   ```

3. Autorizar com **forced command** (a chave só roda esse script, nunca
   shell arbitrário) — `/home/deploybot/.ssh/authorized_keys`:
   ```
   command="/usr/local/bin/vitrine-deploy.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding ssh-ed25519 AAAA...conteúdo da chave pública...
   ```

4. `/usr/local/bin/vitrine-deploy.sh` — implementa só os verbos que este
   escopo reduzido usa (`write-nginx-conf`/`certbot-issue` ficam como stub,
   prontos pra quando ativar domínio customizado depois):

   ```bash
   #!/bin/bash
   set -euo pipefail

   read -r -a ARGS <<< "$SSH_ORIGINAL_COMMAND"
   VERB="${ARGS[0]:-}"

   validate_slug() { [[ "$1" =~ ^[a-z0-9-]+$ ]] || { echo "slug inválido: $1" >&2; exit 1; }; }
   validate_ts() { [[ "$1" =~ ^[0-9]{8}-[0-9]{6}$ ]] || { echo "timestamp inválido: $1" >&2; exit 1; }; }

   WWW_ROOT="/var/www/_saas"          # diretório pai único, ver Passo 3
   ASTRO_DIST="/home/edgar/Repos/fastvistos_saas/dist/_saas"   # onde o build gera os arquivos (clone isolado)

   case "$VERB" in
     rsync-release)
       SLUG="${ARGS[1]}"; TS="${ARGS[2]}"
       validate_slug "$SLUG"; validate_ts "$TS"
       mkdir -p "$WWW_ROOT/$SLUG/releases/$TS"
       rsync -a --delete "$ASTRO_DIST/$SLUG/" "$WWW_ROOT/$SLUG/releases/$TS/"
       ;;
     switch-symlink)
       SLUG="${ARGS[1]}"; TS="${ARGS[2]}"
       validate_slug "$SLUG"; validate_ts "$TS"
       ln -sfn "$WWW_ROOT/$SLUG/releases/$TS" "$WWW_ROOT/$SLUG/current"
       ;;
     reload-nginx)
       sudo /usr/bin/docker exec nginx nginx -t
       sudo /usr/bin/docker exec nginx nginx -s reload
       ;;
     write-nginx-conf|certbot-issue|dns-check)
       echo "Verbo '$VERB' ainda não implementado nesta fase (domínio customizado é Fase futura)" >&2
       exit 1
       ;;
     *)
       echo "Verbo desconhecido: $VERB" >&2
       exit 1
       ;;
   esac
   ```

   **Nota**: se `vitrine` roda dentro de container (opção A do Passo 1) e
   `deploybot` roda no host, o `ASTRO_DIST` acima é o path no HOST (onde o
   volume `/home/edgar/Repos/fastvistos` já existe de verdade), não o path
   dentro do container — o `rsync-release` roda como processo do host
   (via SSH), então enxerga o filesystem do host diretamente, sem precisar
   entrar no container.

5. `chmod +x /usr/local/bin/vitrine-deploy.sh`

6. Sudoers restrito (`sudo visudo`) — só isso, nada de `ALL=(ALL) NOPASSWD: ALL`:
   ```
   deploybot ALL=(ALL) NOPASSWD: /usr/bin/docker exec nginx nginx -t
   deploybot ALL=(ALL) NOPASSWD: /usr/bin/docker exec nginx nginx -s reload
   ```

7. Garantir que `deploybot` é dono de `/var/www/_saas` (ou está num grupo
   compartilhado com quem mais escreve lá):
   ```bash
   sudo chown -R deploybot:deploybot /var/www/_saas
   ```

## Passo 8 — Deploy (mesmo padrão do `rebuild.sh` do emprego)

✅ `vitrine/rebuild.sh` já existe no repo (mesmo nome usado no `emprego`,
adaptado):

```bash
#!/bin/bash
set -e

SERVICE_NAME="vitrine"

echo "Pulling latest code..."
git pull

echo "Building and starting container..."
docker compose up -d --build --force-recreate --remove-orphans

echo "Waiting for service to be running..."
until docker compose ps --status running | grep -q "$SERVICE_NAME"; do
  sleep 2
done

echo "Reloading nginx..."
(
  cd ~/Repos/reverse-proxy-config
  docker compose exec -T nginx nginx -s reload || true
)

echo "Done!"
```
(`migrate` já roda automaticamente dentro do `run.sh`, Passo 2 — diferente
do `rebuild.sh` do emprego que pergunta interativamente, aqui já é
seguro rodar sempre porque o schema do `vitrine` é pequeno e controlado.)

## Passo 9 — Teste ponta a ponta

1. `https://saas.fastvistos.com.br/admin/` → logar com o superuser já
   criado (`edgar.segundo@gmail.com`)
2. Criar `Client` + `Project` de teste
3. Criar páginas nos 3 formatos, testar preview
   (`https://saas.fastvistos.com.br/preview/<id>/`)
4. Action "🚀 Build & Publicar" (só funciona depois do Passo 7, usuário
   `deploybot` provisionado)
5. No VPS: `ls -la /var/www/_saas/{slug}/releases/` e
   `readlink /var/www/_saas/{slug}/current`
6. `https://saas.fastvistos.com.br/app/{slug}/` → confirmar que carrega
7. Confirmar que `https://fastvistos.com.br/` (site legado) continua
   respondendo normalmente — nada neste processo deveria ter tocado nele

## Depois: Fase de domínio customizado

Quando quiser deixar usuários trazerem o próprio domínio: implementar de
verdade `write-nginx-conf` e `certbot-issue` no `vitrine-deploy.sh`
(`core/deploy.py: provision_domain_nginx_ssl()` já está pronto e testado,
espelhando o padrão do `create-astro-site-conf.sh` — webroot method,
`/var/www/certbot` compartilhado, 2 fases pra evitar o problema
ovo-e-galinha do SSL). Nada no Python muda, só o script bash do VPS.
