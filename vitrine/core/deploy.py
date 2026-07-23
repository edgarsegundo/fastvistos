"""
Deploy service: orchestrates Astro builds and VPS deployments.
Handles: building, copying to VPS, versioning, and rollback.
"""

import os
import shlex
import subprocess
import json
from datetime import datetime, timedelta
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.db import transaction
from django.utils import timezone

from core.models import Build, Deployment, Page

# Builds "travados" (running/pending) por mais que isso são tratados como
# órfãos de um worker que crashou, e viram failed automaticamente — sem
# isso, um crash deixaria o lock preso pra sempre.
BUILD_STALE_TIMEOUT_MINUTES = 15


class BuildLockError(Exception):
    """Levantado quando já existe um build em andamento.

    O Astro builda todos os projetos no mesmo `dist/_saas` compartilhado —
    rodar 2 builds ao mesmo tempo faz um apagar a saída do outro no meio da
    geração (ver docs/build-por-projeto.md, seção "efeito colateral"). Por
    isso só pode existir 1 build (de qualquer projeto) rodando por vez.
    """
    pass


def get_build_timestamp():
    """Retorna timestamp formatado para release path (ex: 20260722-153000)"""
    return datetime.now().strftime('%Y%m%d-%H%M%S')


def _mark_stale_builds_as_failed():
    """Builds presos em pending/running além do timeout viram failed.

    Protege contra o lock ficar preso pra sempre se um worker morrer no
    meio de um build (ex: processo do Django reiniciado, VM derrubada).
    """
    cutoff = timezone.now() - timedelta(minutes=BUILD_STALE_TIMEOUT_MINUTES)
    stale = Build.objects.filter(
        status__in=[Build.STATUS_PENDING, Build.STATUS_RUNNING],
        created__lt=cutoff
    )
    return stale.update(status=Build.STATUS_FAILED, finished_at=timezone.now())


def snapshot_pages(project):
    """Cria snapshot do conteúdo das páginas publicadas de 1 projeto"""
    pages = Page.all_objects.filter(project=project, is_published=True).values(
        'id', 'slug', 'title', 'content_format'
    )
    # Converter para list com timestamp como string
    result = []
    for page in pages:
        page['timestamp'] = timezone.now().isoformat()
        result.append(page)
    return result


def run_ssh_command(command_args, stdin_data=None):
    """
    Executa comando remoto no VPS via SSH restrito.
    Usa chave privada e connect a deploybot@localhost.

    IMPORTANTE: conteúdo grande/multi-linha (ex: um arquivo de config Nginx
    inteiro) NUNCA deve ir como elemento de `command_args` — argumentos de
    shell não sobrevivem a quebras de linha, aspas, `$`, `;` etc quando
    concatenados numa string de comando remoto. Use `stdin_data` pra isso:
    o script restrito no VPS deve ler o conteúdo de stdin, não de um
    argumento posicional. Ex:
        run_ssh_command(['write-nginx-conf', domain], stdin_data=nginx_config)
        # equivalente a: ssh deploybot@host 'write-nginx-conf example.com' < config.txt

    Args:
        command_args (list): ex: ['rsync-release', 'project-slug', '20260722-153000']
        stdin_data (str, optional): conteúdo a mandar via stdin do comando remoto

    Returns:
        tuple: (returncode, stdout, stderr)
    """
    ssh_key = getattr(settings, 'DEPLOY_SSH_KEY_PATH', '/etc/vitrine/deploy_key')
    ssh_host = getattr(settings, 'DEPLOY_SSH_HOST', 'localhost')
    ssh_user = getattr(settings, 'DEPLOY_SSH_USER', 'deploybot')

    # Cada argumento é escapado individualmente (shlex.quote) antes de juntar
    # numa string de comando — defesa em profundidade além da validação de
    # domain/project_slug já feita antes de chegar aqui.
    cmd_str = ' '.join(shlex.quote(str(arg)) for arg in command_args)
    ssh_cmd = [
        'ssh', '-i', ssh_key,
        # BatchMode=yes: nunca cai pra prompt de senha — sem isso, um deploy
        # disparado pelo admin (sem terminal/TTY) travaria em silêncio até o
        # timeout de 300s esperando uma senha que nunca vai vir.
        '-o', 'BatchMode=yes',
        # deploybot@host é sempre o mesmo par fixo (não é acesso interativo
        # a hosts variados) — StrictHostKeyChecking=no + known_hosts em
        # /dev/null evita falha na primeira conexão (host novo, sem entrada
        # prévia) e não deixa resíduo em disco a cada deploy.
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'UserKnownHostsFile=/dev/null',
        f'{ssh_user}@{ssh_host}', cmd_str,
    ]

    try:
        result = subprocess.run(
            ssh_cmd,
            input=stdin_data,
            capture_output=True,
            timeout=300,
            text=True
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return 1, '', 'SSH command timeout (>5 min)'
    except Exception as e:
        return 1, '', str(e)


def build_project(project, force=False, triggered_by=None):
    """
    Executa build de Astro escopado a UM projeto (ver docs/build-por-projeto.md).

    O client do Build é sempre derivado de project.client — nunca escolhido
    arbitrariamente, porque o build agora representa de fato uma operação
    de 1 tenant só (o dono do projeto).

    Args:
        project: Project instance (obrigatório — build é sempre por-projeto)
        force: bool, ignora needs_rebuild e builda mesmo assim
        triggered_by: ClientUser instance opcional (quem disparou o build)

    Returns:
        Build: instance com status updated

    Raises:
        BuildLockError: se outro build já está em andamento (ver módulo)
        Exception: on critical failure
    """
    if project is None:
        raise ValueError('build_project() requer um Project — build não é mais site-wide')

    _mark_stale_builds_as_failed()

    # Lock: só pode existir 1 build (de qualquer projeto) rodando por vez,
    # porque todos compartilham o mesmo dist/_saas no Astro. A checagem +
    # criação do Build acontece na mesma transação pra minimizar a janela
    # de corrida entre "checar se tem build rodando" e "criar o meu".
    with transaction.atomic():
        active = Build.objects.select_for_update().filter(
            status__in=[Build.STATUS_PENDING, Build.STATUS_RUNNING]
        )
        blocking = active.first()
        if blocking is not None:
            raise BuildLockError(
                f'Build {blocking.id} (projeto "{blocking.project.slug}") já está em '
                'andamento. Aguarde terminar antes de iniciar outro build — builds '
                'concorrentes corrompem o diretório de saída compartilhado do Astro.'
            )

        build = Build.objects.create(
            client=project.client,
            project=project,
            status=Build.STATUS_RUNNING,
            triggered_by=triggered_by,
            content_snapshot=snapshot_pages(project),
            started_at=timezone.now(),
        )

    # Fora do try: garante que `out` sempre existe no except, mesmo se
    # call_command() falhar imediatamente — sem isso, o log real (stdout/
    # stderr do `npm run build`, com o erro de verdade) era descartado e só
    # sobrava a mensagem genérica do CommandError.
    from io import StringIO
    out = StringIO()

    try:
        args = ['--project', project.slug]
        if force:
            args.append('--force')

        # build_static_sites levanta CommandError quando o build de 1 projeto
        # falha (modo --project), então um sucesso aqui é confiável.
        call_command('build_static_sites', *args, stdout=out, stderr=out)

        build.log_output = out.getvalue()
        build.status = Build.STATUS_SUCCESS
        build.finished_at = timezone.now()
        build.save()

        return build

    except Exception as e:
        build.log_output = f'{out.getvalue()}\nBuild failed: {str(e)}'
        build.status = Build.STATUS_FAILED
        build.finished_at = timezone.now()
        build.save()
        raise


def deploy_build(build):
    """
    Faz deploy de um Build pro VPS (rsync + symlink), escopado ao projeto
    do build (build.project.slug), não mais ao site inteiro.

    Cada projeto tem sua própria árvore de releases no VPS, TODAS aninhadas
    sob 1 diretório pai compartilhado (nunca 1 bind mount novo por projeto —
    ver docs/provisionamento-producao.md, seção "Por que /var/www/_saas
    como diretório único"):
        /var/www/_saas/{project.slug}/releases/{timestamp}/
        /var/www/_saas/{project.slug}/current -> releases/{timestamp}/

    O prefixo exato (`_saas`) é decidido pelo script restrito no VPS
    (`vitrine-deploy.sh`), não aqui — este código só manda project_slug e
    timestamp, sem opinião sobre o path físico completo.

    Args:
        build: Build instance (deve estar em SUCCESS status)

    Returns:
        Deployment: instance com status updated

    Raises:
        Exception: on deployment failure
    """
    if build.status != Build.STATUS_SUCCESS:
        raise ValueError(f'Cannot deploy build with status {build.status}')

    deployment = Deployment.objects.create(
        client=build.client,
        build=build,
        status=Deployment.STATUS_DEPLOYING
    )

    project_slug = build.project.slug

    try:
        # Gerar timestamp de release
        release_ts = get_build_timestamp()

        # Copiar dist/_saas/{project_slug}/ para VPS /var/www/{project_slug}/releases/{ts}/
        # Comando: rsync-release <project_slug> <timestamp>
        rc, stdout, stderr = run_ssh_command(['rsync-release', project_slug, release_ts])

        if rc != 0:
            raise Exception(f'rsync-release failed: {stderr}')

        # Fazer symlink /var/www/{project_slug}/current -> /var/www/{project_slug}/releases/{ts}
        # Comando: switch-symlink <project_slug> <timestamp>
        rc, stdout, stderr = run_ssh_command(['switch-symlink', project_slug, release_ts])

        if rc != 0:
            raise Exception(f'switch-symlink failed: {stderr}')

        # Recarregar Nginx
        rc, stdout, stderr = run_ssh_command(['reload-nginx'])

        if rc != 0:
            raise Exception(f'reload-nginx failed: {stderr}')

        # Sucesso: persistir release_path no Build, senão rollback nunca funciona
        build.release_path = f'releases/{release_ts}'
        build.save(update_fields=['release_path'])

        deployment.status = Deployment.STATUS_SUCCESS
        deployment.deployed_at = timezone.now()
        deployment.log_output = stdout

    except Exception as e:
        deployment.status = Deployment.STATUS_FAILED
        deployment.log_output = str(e)
        deployment.deployed_at = timezone.now()

    deployment.save()
    return deployment


def rename_project_release(old_slug, new_slug):
    """
    Renomeia a pasta de releases de um projeto no VPS depois que o slug
    muda no Django (ex: /var/www/_saas/velho-slug/ → /var/www/_saas/novo-slug/).

    Sem isso, mudar o slug de um Project já publicado deixaria os arquivos
    "presos" no nome antigo — a URL nova (com o slug novo) ficaria 404 até
    rodar um build novo do zero.

    Chamado por ProjectAdmin.save_model() quando detecta que `slug` mudou
    num projeto que já tem pelo menos 1 deploy bem-sucedido.

    Args:
        old_slug: slug anterior (nome da pasta atual no VPS)
        new_slug: slug novo (nome que a pasta deve passar a ter)

    Raises:
        ValueError: slugs inválidos (defesa em profundidade — o script
            restrito no VPS valida de novo, mas não custa checar aqui também)
        Exception: se o comando SSH falhar (pasta não existe, permissão, etc)
    """
    import re
    slug_re = re.compile(r'^[a-z0-9-]+$')
    if not slug_re.match(old_slug) or not slug_re.match(new_slug):
        raise ValueError(f'Slug inválido: old={old_slug!r} new={new_slug!r}')

    rc, stdout, stderr = run_ssh_command(['rename-project', old_slug, new_slug])
    if rc != 0:
        raise Exception(f'rename-project failed: {stderr}')

    rc, stdout, stderr = run_ssh_command(['reload-nginx'])
    if rc != 0:
        raise Exception(f'reload-nginx (após rename) failed: {stderr}')


def rollback_to_build(build):
    """
    Volta o symlink /var/www/{project_slug}/current para uma release
    anterior desse MESMO projeto. Re-aponta para o release_path do Build.

    Args:
        build: Build instance com deployment sucesso anterior

    Returns:
        Deployment: novo deployment (rolled back)

    Raises:
        Exception: if build has no successful deployment
    """
    if not hasattr(build, 'deployment') or build.deployment.status != Deployment.STATUS_SUCCESS:
        raise ValueError(f'Build {build.id} has no successful deployment to rollback to')

    if not build.release_path:
        raise ValueError(f'Build {build.id} has no release_path stored')

    project_slug = build.project.slug

    # Criar novo Deployment record
    deployment = Deployment.objects.create(
        client=build.client,
        build=build,
        status=Deployment.STATUS_DEPLOYING
    )

    try:
        # Re-aponta symlink ao release anterior (extrair timestamp do release_path)
        # release_path format: "releases/20260722-153000"
        release_ts = build.release_path.split('/')[-1]

        rc, stdout, stderr = run_ssh_command(['switch-symlink', project_slug, release_ts])

        if rc != 0:
            raise Exception(f'switch-symlink failed: {stderr}')

        rc, stdout, stderr = run_ssh_command(['reload-nginx'])

        if rc != 0:
            raise Exception(f'reload-nginx failed: {stderr}')

        deployment.status = Deployment.STATUS_ROLLED_BACK
        deployment.deployed_at = timezone.now()
        deployment.log_output = stdout

    except Exception as e:
        deployment.status = Deployment.STATUS_FAILED
        deployment.log_output = str(e)
        deployment.deployed_at = timezone.now()

    deployment.save()
    return deployment


def verify_domain_dns(domain):
    """
    Verifica se o domínio está resolvendo pro IP público do VPS.

    Args:
        domain: Domain instance

    Raises:
        Exception: if DNS doesn't resolve or doesn't point to VPS IP
    """
    import socket

    vps_ip = getattr(settings, 'VPS_PUBLIC_IP', '72.60.57.150')

    try:
        resolved_ip = socket.gethostbyname(domain.domain)
    except socket.gaierror as e:
        domain.verification_status = domain.VERIFICATION_FAILED
        domain.dns_check_log = f'DNS resolution failed: {str(e)}'
        domain.save()
        raise Exception(f'DNS resolution failed for {domain.domain}: {str(e)}')

    if resolved_ip != vps_ip:
        domain.verification_status = domain.VERIFICATION_FAILED
        domain.dns_check_log = f'DNS points to {resolved_ip}, expected {vps_ip}'
        domain.save()
        raise Exception(f'DNS points to {resolved_ip}, expected {vps_ip}')

    # DNS verificado!
    domain.verification_status = domain.VERIFICATION_VERIFIED
    domain.verified_at = timezone.now()
    domain.dns_check_log = f'✅ DNS verified: {domain.domain} → {resolved_ip}'
    domain.save()


def provision_domain_nginx_ssl(domain):
    """
    Provisiona Nginx + SSL para um domínio, em 2 fases pra evitar o problema
    "ovo e galinha" (escrever config HTTPS antes do cert existir faz
    `nginx -t` falhar e aborta o reload pra TODOS os domínios do host):

      Fase 1: escreve config HTTP-only (sem ssl_certificate), recarrega.
      Fase 2: roda Certbot (webroot method, usando o path compartilhado
              /var/www/certbot pro desafio ACME — mesmo padrão já usado
              pelos sites legados, não um docroot por-projeto).
      Fase 3: só agora escreve a config completa (HTTP→HTTPS + bloco SSL)
              e recarrega de novo.

    Requer que:
    - DNS já tenha sido verificado (verify_domain_dns)
    - O projeto já tenha sido deployado ao menos 1 vez (precisa existir
      /var/www/{PLATFORM_SITE_ID}/{project_slug}/current no VPS, senão o
      Nginx bootstrap não tem o que servir na location "/")

    Args:
        domain: Domain instance (deve estar em VERIFICATION_VERIFIED status)

    Raises:
        Exception: if provisioning fails
    """
    from core.nginx_templates import generate_nginx_bootstrap_block, generate_nginx_full_block

    if domain.verification_status != domain.VERIFICATION_VERIFIED:
        raise ValueError(f'Domain {domain.domain} must be DNS verified before provisioning')

    www_root = getattr(settings, 'WWW_ROOT', '/var/www')
    platform_site_id = getattr(settings, 'PLATFORM_SITE_ID', '_saas')
    project_slug = domain.project.slug

    try:
        # --- Fase 1: config HTTP-only (sem SSL), pra servir o desafio ACME ---
        bootstrap_config = generate_nginx_bootstrap_block(
            domain=domain.domain,
            project_slug=project_slug,
            www_root=www_root,
            platform_site_id=platform_site_id,
        )

        # Conteúdo vai via stdin (nunca concatenado num argumento de shell —
        # config multi-linha não sobrevive a isso, ver run_ssh_command())
        rc, stdout, stderr = run_ssh_command(
            ['write-nginx-conf', domain.domain], stdin_data=bootstrap_config
        )
        if rc != 0:
            raise Exception(f'write-nginx-conf (bootstrap) failed: {stderr}')

        rc, stdout, stderr = run_ssh_command(['reload-nginx'])
        if rc != 0:
            raise Exception(f'reload-nginx (bootstrap) failed: {stderr}')

        domain.ssl_status = domain.SSL_PENDING
        domain.dns_check_log = 'Bootstrap HTTP config ativo, solicitando certificado...'
        domain.save()

        # --- Fase 2: Certbot (webroot, usa o docroot que a Fase 1 já está servindo) ---
        rc, stdout, stderr = run_ssh_command(['certbot-issue', domain.domain])
        if rc != 0:
            domain.ssl_status = domain.SSL_FAILED
            domain.dns_check_log = f'Certbot failed: {stderr}'
            domain.save()
            raise Exception(f'certbot-issue failed: {stderr}')

        # --- Fase 3: agora sim, config completa com HTTPS (certs já existem) ---
        full_config = generate_nginx_full_block(
            domain=domain.domain,
            project_slug=project_slug,
            www_root=www_root,
            platform_site_id=platform_site_id,
        )

        rc, stdout, stderr = run_ssh_command(
            ['write-nginx-conf', domain.domain], stdin_data=full_config
        )
        if rc != 0:
            raise Exception(f'write-nginx-conf (full) failed: {stderr}')

        rc, stdout, stderr = run_ssh_command(['reload-nginx'])
        if rc != 0:
            raise Exception(f'reload-nginx (full) failed: {stderr}')

        domain.ssl_status = domain.SSL_ISSUED
        domain.dns_check_log = '✅ Nginx + SSL provisioned successfully'
        domain.save()

    except Exception as e:
        domain.ssl_status = domain.SSL_FAILED
        domain.dns_check_log = str(e)
        domain.save()
        raise
