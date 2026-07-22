"""
Deploy service: orchestrates Astro builds and VPS deployments.
Handles: building, copying to VPS, versioning, and rollback.
"""

import os
import subprocess
import json
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.utils import timezone

from core.models import Build, Deployment, Page


def get_build_timestamp():
    """Retorna timestamp formatado para release path (ex: 20260722-153000)"""
    return datetime.now().strftime('%Y%m%d-%H%M%S')


def snapshot_pages():
    """Cria snapshot do conteúdo de todas as páginas publicadas"""
    pages = Page.all_objects.filter(is_published=True).values(
        'id', 'slug', 'project__slug', 'title', 'content_format'
    )
    # Converter para list com timestamps como strings
    result = []
    for page in pages:
        page['timestamp'] = timezone.now().isoformat()
        result.append(page)
    return result


def run_ssh_command(command_args):
    """
    Executa comando remoto no VPS via SSH restrito.
    Usa chave privada e connect a deploybot@localhost.

    Args:
        command_args (list): ex: ['rsync-release', 'project-slug', '20260722-153000']

    Returns:
        tuple: (returncode, stdout, stderr)
    """
    ssh_key = getattr(settings, 'DEPLOY_SSH_KEY_PATH', '/etc/vitrine/deploy_key')
    ssh_host = getattr(settings, 'DEPLOY_SSH_HOST', 'localhost')
    ssh_user = getattr(settings, 'DEPLOY_SSH_USER', 'deploybot')

    # Construir comando SSH (passa os args como uma string única pro script restrito)
    cmd_str = ' '.join(command_args)
    ssh_cmd = ['ssh', '-i', ssh_key, f'{ssh_user}@{ssh_host}', cmd_str]

    try:
        result = subprocess.run(
            ssh_cmd,
            capture_output=True,
            timeout=300,
            text=True
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return 1, '', 'SSH command timeout (>5 min)'
    except Exception as e:
        return 1, '', str(e)


def build_project(project=None, force=False, client=None):
    """
    Executa build de todos os projetos via Astro.

    Args:
        project: Project instance (ignored, build é sempre site-wide)
        force: bool, force rebuild even if not needed
        client: Client instance (required for ClientModel)

    Returns:
        Build: instance com status updated

    Raises:
        Exception: on critical failure
    """
    from django.contrib.auth import get_user_model
    from tenancy.models import Client

    User = get_user_model()

    # Se não tem client, usar o primeiro (plataforma global)
    if not client:
        client = Client.objects.first()
        if not client:
            raise ValueError('No Client found in database')

    # Criar registro Build
    try:
        user = User.objects.filter(is_staff=True).first()
    except:
        user = None

    build = Build.objects.create(
        client=client,
        status=Build.STATUS_RUNNING,
        triggered_by=user,
        content_snapshot=snapshot_pages()
    )
    build.started_at = timezone.now()
    build.save()

    try:
        # Rodar management command
        astro_root = getattr(settings, 'ASTRO_ROOT', '/Users/edgar/Repos/fastvistos')
        platform_site_id = getattr(settings, 'PLATFORM_SITE_ID', '_saas')

        # Chamar build_static_sites command (já configura SITE_ID)
        from io import StringIO
        out = StringIO()

        if force:
            call_command('build_static_sites', '--force', stdout=out, stderr=out)
        else:
            call_command('build_static_sites', stdout=out, stderr=out)

        log = out.getvalue()
        build.log_output = log
        build.status = Build.STATUS_SUCCESS
        build.finished_at = timezone.now()
        build.save()

        return build

    except Exception as e:
        build.log_output = f'Build failed: {str(e)}'
        build.status = Build.STATUS_FAILED
        build.finished_at = timezone.now()
        build.save()
        raise


def deploy_build(build):
    """
    Faz deploy de um Build pro VPS (rsync + symlink).
    Executa via SSH restrito em deploybot.

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
        build=build,
        status=Deployment.STATUS_DEPLOYING
    )

    try:
        # Gerar timestamp de release
        release_ts = get_build_timestamp()

        # Copiar dist/_saas/* para VPS /var/www/_saas/releases/{ts}/
        # Comando: rsync-release <site_id> <timestamp>
        rc, stdout, stderr = run_ssh_command(['rsync-release', '_saas', release_ts])

        if rc != 0:
            raise Exception(f'rsync-release failed: {stderr}')

        # Fazer symlink /var/www/_saas/current -> /var/www/_saas/releases/{ts}
        # Comando: switch-symlink <site_id> <timestamp>
        rc, stdout, stderr = run_ssh_command(['switch-symlink', '_saas', release_ts])

        if rc != 0:
            raise Exception(f'switch-symlink failed: {stderr}')

        # Recarregar Nginx
        rc, stdout, stderr = run_ssh_command(['reload-nginx'])

        if rc != 0:
            raise Exception(f'reload-nginx failed: {stderr}')

        # Sucesso
        deployment.status = Deployment.STATUS_SUCCESS
        deployment.deployed_at = timezone.now()
        deployment.log_output = stdout

    except Exception as e:
        deployment.status = Deployment.STATUS_FAILED
        deployment.log_output = str(e)
        deployment.deployed_at = timezone.now()

    deployment.save()
    return deployment


def rollback_to_build(build):
    """
    Volta o symlink /var/www/_saas/current para uma release anterior.
    Re-aponta para o release_path do Build fornecido.

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

    # Criar novo Deployment record
    deployment = Deployment.objects.create(
        build=build,
        status=Deployment.STATUS_DEPLOYING
    )

    try:
        # Re-aponta symlink ao release anterior (extrair timestamp do release_path)
        # release_path format: "releases/20260722-153000"
        release_ts = build.release_path.split('/')[-1]

        rc, stdout, stderr = run_ssh_command(['switch-symlink', '_saas', release_ts])

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
    Provisiona Nginx + SSL para um domínio.
    Requer que DNS tenha sido verificado antes.

    Args:
        domain: Domain instance (deve estar em VERIFICATION_VERIFIED status)

    Raises:
        Exception: if provisioning fails
    """
    from core.nginx_templates import generate_nginx_server_block

    if domain.verification_status != domain.VERIFICATION_VERIFIED:
        raise ValueError(f'Domain {domain.domain} must be DNS verified before provisioning')

    try:
        # Gerar config Nginx
        nginx_config = generate_nginx_server_block(
            domain=domain.domain,
            project_slug=domain.project.slug,
            platform_site_id=getattr(settings, 'PLATFORM_SITE_ID', '_saas')
        )

        # Enviar pra VPS via SSH restrito
        # Comando: write-nginx-conf <domain> <config-content>
        # (O script no VPS faz o parsing)
        rc, stdout, stderr = run_ssh_command(['write-nginx-conf', domain.domain, nginx_config])

        if rc != 0:
            raise Exception(f'write-nginx-conf failed: {stderr}')

        # Atualizar status SSL
        domain.ssl_status = domain.SSL_PENDING
        domain.dns_check_log = 'Nginx config written, awaiting SSL provisioning...'
        domain.save()

        # Rodar Certbot pra pegar SSL
        # Comando: certbot-issue <domain>
        rc, stdout, stderr = run_ssh_command(['certbot-issue', domain.domain])

        if rc != 0:
            domain.ssl_status = domain.SSL_FAILED
            domain.dns_check_log = f'Certbot failed: {stderr}'
            domain.save()
            raise Exception(f'certbot-issue failed: {stderr}')

        # Sucesso! Reload Nginx e marcar como ativo
        rc, stdout, stderr = run_ssh_command(['reload-nginx'])

        if rc != 0:
            raise Exception(f'reload-nginx failed: {stderr}')

        domain.ssl_status = domain.SSL_ISSUED
        domain.dns_check_log = f'✅ Nginx + SSL provisioned successfully'
        domain.save()

    except Exception as e:
        domain.ssl_status = domain.SSL_FAILED
        domain.dns_check_log = str(e)
        domain.save()
        raise
