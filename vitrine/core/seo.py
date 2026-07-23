"""Resolução de SEO em cascata: Page > Project > Platform.

Centraliza aqui a regra de precedência (em vez de espalhar `or`s pela
view da API ou pelo template Astro) para que seja testável isoladamente
e para que o Astro só precise renderizar um payload já resolvido.
"""

from django.conf import settings

from core.models import PlatformSeoDefaults


def resolve_seo(page, platform=None):
    """Recebe uma `Page` e retorna um dict plano com todos os metadados
    de SEO já resolvidos pela cascata Page > Project > Platform.

    `platform` é opcional — quem resolve SEO de várias páginas em loop
    (ex: core.views.sitemap_xml) deve carregar `PlatformSeoDefaults.load()`
    uma vez só e passar aqui, evitando 1 query extra por página."""
    project = page.project
    page_seo = getattr(page, 'seo_settings', None)
    project_seo = getattr(project, 'seo_settings', None)
    platform = platform or PlatformSeoDefaults.load()

    page_seo_title = page_seo.seo_title if page_seo else ''
    page_seo_description = page_seo.seo_description if page_seo else ''
    page_og_image = page_seo.og_image_override if page_seo else ''
    page_canonical = page_seo.canonical_override if page_seo else ''
    noindex = page_seo.noindex if page_seo else False
    type_specific_data = page_seo.type_specific_data if page_seo else {}

    project_og_image = project_seo.og_image_url if project_seo else ''
    project_favicon = project_seo.favicon_url if project_seo else ''
    project_author = project_seo.author_name if project_seo else ''
    title_suffix = project_seo.default_title_suffix if project_seo else ''
    organization_name = (
        (project_seo.organization_name_override if project_seo else '')
        or platform.organization_name
        or project.name
    )

    title = page_seo_title or f"{page.title}{title_suffix}"
    description = page_seo_description
    og_image = page_og_image or project_og_image or platform.default_og_image_url
    favicon = project_favicon or platform.default_favicon_url
    author_name = project_author or platform.default_author_name

    page_slug = page.slug or 'index'
    domain_override = project_seo.canonical_domain_override if project_seo else ''
    base_url = (domain_override or settings.PLATFORM_PUBLIC_BASE_URL).rstrip('/')
    site_url = f"{base_url}/app/{project.slug}/" if not domain_override else f"{base_url}/"
    default_canonical = site_url + ('' if page.is_home else f"{page_slug}/")
    canonical = page_canonical or default_canonical

    return {
        'title': title,
        'description': description,
        'canonical': canonical,
        'site_url': site_url,
        'og_image': og_image,
        'favicon': favicon,
        'author_name': author_name,
        'site_name': platform.site_name,
        'organization_name': organization_name,
        'organization_logo_url': platform.organization_logo_url,
        'theme_color': platform.theme_color,
        'locale': platform.locale,
        'noindex': noindex,
        'page_type': page.page_type,
        'type_specific_data': type_specific_data,
    }
