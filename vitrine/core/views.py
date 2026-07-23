from django.contrib.auth import authenticate, login
from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect
from django.views import View
from django.views.decorators.http import require_http_methods
from django.views.decorators.http import require_GET
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.conf import settings
from core.forms import SignupForm, LoginForm
from core.models import Project, Page, PlatformSeoDefaults
from core.provisioning import provision_tenant_for_user
from core.seo import resolve_seo
from tenancy.threadlocal import get_current_client
import json
import markdown as md


class AuthView(View):
    """Tela pública de cadastro/login (/entrar/) — o usuário escolhe entre
    criar conta (email/senha) ou logar (email/senha OU botão do Google,
    que leva pro fluxo allauth em /accounts/google/login/).

    Depois de autenticado (por qualquer um dos 2 caminhos), cai no
    /admin/ (painel do cliente, reformulado via Unfold) — mesmo destino
    pros dois fluxos.
    """
    template_name = 'core/auth.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('/admin/')
        return render(request, self.template_name, {
            'signup_form': SignupForm(),
            'login_form': LoginForm(),
        })

    def post(self, request):
        action = request.POST.get('action')

        if action == 'register':
            form = SignupForm(request.POST)
            if form.is_valid():
                user = form.save()
                provision_tenant_for_user(user)
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                return redirect('/admin/')
            return render(request, self.template_name, {
                'signup_form': form,
                'login_form': LoginForm(),
                'active_tab': 'register',
            })

        elif action == 'login':
            form = LoginForm(request.POST)
            if form.is_valid():
                user = authenticate(
                    request,
                    username=form.cleaned_data['email'],
                    password=form.cleaned_data['password'],
                )
                if user is not None:
                    login(request, user)
                    return redirect('/admin/')
                form.add_error(None, 'Email ou senha inválidos.')
            return render(request, self.template_name, {
                'signup_form': SignupForm(),
                'login_form': form,
                'active_tab': 'login',
            })

        return redirect('entrar')


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
            seo = resolve_seo(page)

            pages_data.append({
                'slug': page.slug or 'index',
                'is_home': page.is_home,
                'title': page.title,
                'content': render_info['content'],
                'content_format': render_info['format'],
                'render_type': render_info['render_type'],
                'seo': seo,
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

    seo = resolve_seo(page)

    context = {
        'page': page,
        'project': page.project,
        'render_type': render_type,
        'content': content,
        'seo_title': seo['title'],
        'seo_description': seo['description'],
    }

    return render(request, 'core/preview.html', context)


@require_GET
def sitemap_xml(request):
    """GET /sitemap.xml

    Gerado dinamicamente a partir do banco (não pelo build do Astro) —
    é o Django, não o Astro, quem sabe de fato quais Projects/Pages estão
    publicados e qual a URL canônica de cada um (core.seo.resolve_seo).
    Evita o gap que existia antes: o plugin @astrojs/sitemap montava URLs
    com o domínio/path errados pro _saas, porque dependia da config
    estática `site:` do astro.config.mjs (pensada pros sites legados,
    1 domínio fixo por site-id), que não existe pro _saas (multi-tenant,
    1 domínio pra N projetos, cada um com seu path /app/{slug}/).

    Páginas com seo.noindex=True são excluídas — não faz sentido pedir
    ao Google pra indexar e simultaneamente sugerir isso no sitemap.

    Usa `all_objects` (não `objects`) tanto pra Project quanto pra Page:
    este endpoint é público e cross-tenant por natureza (lista projetos
    de TODOS os clients), mas `Page.objects`/`Project.objects` (o manager
    padrão, `ClientManager`) filtram implicitamente por
    `tenancy.threadlocal.get_current_client()` quando setado — o que
    aconteceria pra qualquer request autenticado (staff/client-user
    logado testando a URL, por exemplo). Isso faria o sitemap silenciar
    todas as páginas de outros tenants, retornando só (ou nada) do
    tenant do usuário logado. `all_objects` ignora esse filtro
    threadlocal, então também precisa filtrar `is_removed=False` na mão
    (não vem de graça como no `objects`), senão projeto soft-deletado
    com is_published=True ainda vazaria pro sitemap público.
    """
    urls = []
    platform = PlatformSeoDefaults.load()
    projects = Project.all_objects.filter(is_published=True, is_removed=False)
    for project in projects:
        pages = Page.all_objects.filter(
            project=project, is_published=True, is_removed=False
        )
        for page in pages:
            seo = resolve_seo(page, platform=platform)
            if seo['noindex']:
                continue
            urls.append({
                'loc': seo['canonical'],
                'lastmod': page.modified.date().isoformat(),
            })

    from xml.sax.saxutils import escape

    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_parts.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for url in urls:
        xml_parts.append(
            f"<url><loc>{escape(url['loc'])}</loc><lastmod>{url['lastmod']}</lastmod></url>"
        )
    xml_parts.append('</urlset>')

    return HttpResponse('\n'.join(xml_parts), content_type='application/xml')


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
