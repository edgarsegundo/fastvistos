from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.http import require_GET
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.conf import settings
from core.models import Project, Page
from tenancy.threadlocal import get_current_client
import json
import markdown as md


def _check_build_api_access(request):
    """Verifica se é uma chamada autorizada da API de build (localhost ou header X-Build-Secret)"""
    client_ip = request.META.get('REMOTE_ADDR', '')
    is_localhost = client_ip in ('127.0.0.1', '::1')

    build_secret = getattr(settings, 'BUILD_API_SECRET', None)
    if build_secret:
        header_secret = request.headers.get('X-Build-Secret', '')
        is_authorized = header_secret == build_secret
    else:
        is_authorized = is_localhost

    return is_authorized


@require_http_methods(["GET"])
def api_projects_list(request):
    """GET /api/projects/

    Retorna todos os projetos publicados (usado por Astro em build-time).
    Restringe a acesso autorizado: localhost ou X-Build-Secret header.
    """
    if not _check_build_api_access(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    try:
        projects = Project.all_objects.filter(
            is_published=True
        ).values('id', 'slug', 'name', 'description')

        return JsonResponse(list(projects), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def api_project_pages(request, project_slug):
    """GET /api/projects/{project_slug}/pages/

    Retorna todas as páginas publicadas de um projeto com info de renderização.
    Restringe a acesso autorizado: localhost ou X-Build-Secret header.
    """
    if not _check_build_api_access(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    try:
        project = Project.all_objects.get(slug=project_slug, is_published=True)
    except Project.DoesNotExist:
        return JsonResponse({'error': 'Project not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    try:
        pages = Page.objects.filter(
            project=project,
            is_published=True
        ).order_by('order', 'title')

        pages_data = []
        for page in pages:
            render_info = page.render_content_for_api()

            pages_data.append({
                'slug': page.slug or 'index',
                'title': page.title,
                'content': render_info['content'],
                'content_format': render_info['format'],
                'render_type': render_info['render_type'],
                'seo_title': page.seo_title,
                'seo_description': page.seo_description,
                'modified': page.modified.isoformat(),
            })

        return JsonResponse(pages_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_GET
def preview_page(request, page_id):
    """GET /preview/<page_id>/

    Renderiza uma página em preview (draft ou published).
    Requer autenticação e acesso ao client.
    """
    try:
        page = Page.all_objects.get(id=page_id)
    except Page.DoesNotExist:
        return JsonResponse({'error': 'Page not found'}, status=404)

    # Verificar acesso: o user deve estar associado ao client da página
    # Simplificado: apenas verificar se é superuser ou staff (em prod, usar ClientProfile)
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    # Renderizar conteúdo
    render_info = page.render_content_for_api()
    render_type = render_info['render_type']
    content = render_info['content']

    # Converter markdown para HTML se necessário
    if render_type == 'marked':
        content = md.markdown(content, extensions=['extra', 'codehilite'])

    context = {
        'page': page,
        'project': page.project,
        'render_type': render_type,
        'content': content,
        'seo_title': page.seo_title or page.title,
        'seo_description': page.seo_description,
    }

    return render(request, 'core/preview.html', context)


@require_http_methods(["POST"])
def api_trigger_rebuild(request):
    """POST /api/trigger-rebuild/

    Dispara build+deploy (síncrono) de todos os projetos com needs_rebuild=True.
    Requer staff. Cada projeto é buildado individualmente via core.deploy
    (que já tem lock de concorrência — ver core/deploy.py:BuildLockError),
    então dois requests simultâneos não corrompem o dist/_saas compartilhado.

    Endpoint JSON: retorna 401/403 em JSON em vez de redirecionar pra uma
    página de login (por isso não usa @login_required, que faz redirect).
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    from core.deploy import build_project, deploy_build, BuildLockError

    dirty_projects = list(Project.all_objects.filter(needs_rebuild=True))

    if not dirty_projects:
        return JsonResponse({'status': 'no_projects_need_rebuild', 'results': []})

    results = []
    for project in dirty_projects:
        try:
            build = build_project(project, triggered_by=request.user)
            deployment = deploy_build(build)
            results.append({
                'project': project.slug,
                'build_id': build.id,
                'build_status': build.status,
                'deployment_status': deployment.status,
            })
        except BuildLockError as e:
            # Outro build já está rodando — para aqui, não insiste nos demais
            results.append({'project': project.slug, 'error': str(e)})
            break
        except Exception as e:
            results.append({'project': project.slug, 'error': str(e)})

    return JsonResponse({'status': 'completed', 'results': results})
