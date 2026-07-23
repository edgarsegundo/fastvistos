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
# de Node instalado aqui, além do Python.
# openssh-client: core/deploy.py: run_ssh_command() chama o binário `ssh`
# via subprocess pra falar com o deploybot no host — sem isso, todo deploy
# falha com "ssh: executable file not found".
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    pkg-config \
    openssh-client \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# UID/GID 1001 fixo de propósito — precisa bater com o usuário do host
# (edgar, uid=1001 no VPS) porque este container escreve dentro de
# /app/astro-repo, um bind mount do repo real no host (multi-sites/, node_modules/
# etc). Se as UIDs não baterem, todo arquivo que o Astro criar durante o
# build (.astro/, node_modules/.vite/, dist/) fica acessível só por quem
# criou (host ou container, nunca os dois) — já causou bugs reais de
# permissão (EACCES em cascata, toda vez que build rodava ora de um lado
# ora do outro). Se seu usuário no VPS tiver UID diferente de 1001, ajuste
# os 2 valores abaixo.
RUN addgroup --gid 1001 django \
    && adduser --uid 1001 --gid 1001 --home /home/django --disabled-password --gecos '' django
RUN mkdir -p /home/django && chown -R django:django /home/django
ENV HOME=/home/django
ENV TMPDIR=/tmp

COPY --from=builder /app/requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

RUN mkdir -p /app/staticfiles /app/data \
    && chown -R django:django /app

EXPOSE 8000

COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

USER django
CMD ["/app/run.sh"]
