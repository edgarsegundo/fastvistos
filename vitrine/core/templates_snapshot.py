"""
Snapshot / anonimização / instanciação de Templates (fase 3).

Um Template guarda um snapshot JSON do conteúdo de um Project:
    { pages: [{title, slug, page_type, is_home, is_published, order, blocks}],
      theme: {...}, chrome: {...} }

- `snapshot_project(project)`  → monta esse JSON a partir de um Project.
- `anonymize_snapshot(snap)`   → limpa SÓ PII estruturado (determinístico);
                                 prosa (títulos, Sobre, citações) fica intacta.
- `instantiate_template(...)`  → cria um Project novo + Pages a partir do snapshot.
"""
import copy

from django.utils.text import slugify

from .models import Project, Page


# ---------------------------------------------------------------------------
# Snapshot
# ---------------------------------------------------------------------------

def snapshot_project(project):
    """Monta o snapshot JSON do conteúdo de um Project (todas as páginas)."""
    pages = Page.all_objects.filter(project=project).order_by('order', 'title')
    return {
        'pages': [
            {
                'title': p.title,
                'slug': p.slug,
                'page_type': p.page_type,
                'is_home': p.is_home,
                'is_published': p.is_published,
                'order': p.order,
                'blocks': p.blocks or {'root': {'props': {}}, 'content': []},
            }
            for p in pages
        ],
        'theme': project.theme or {},
        'chrome': project.chrome or {},
    }


# ---------------------------------------------------------------------------
# Anonimização (só PII estruturado — ver plano/fase 3)
# ---------------------------------------------------------------------------

def _is_contact_href(v):
    """True se a string parece um link de contato pessoal (tel/mailto/WhatsApp)."""
    return isinstance(v, str) and (
        v.startswith('tel:') or v.startswith('mailto:') or 'wa.me/' in v
    )


def _scrub_href(v):
    return '#' if _is_contact_href(v) else v


def _anonymize_block(node):
    """Limpa PII estruturado de UM bloco, in-place. Prosa não é tocada."""
    if not isinstance(node, dict):
        return
    props = node.get('props')
    if not isinstance(props, dict):
        return
    block_type = node.get('type')

    if block_type == 'Contato':
        for field in ('phone', 'whatsapp', 'email', 'address', 'hours', 'mapEmbedUrl'):
            if field in props:
                props[field] = ''

    if block_type == 'Depoimentos':
        for item in props.get('items') or []:
            if isinstance(item, dict) and 'author' in item:
                item['author'] = ''  # nome de pessoa; a citação (prosa) fica

    # Preço: cada plano tem seu próprio ctaHref
    for plan in props.get('plans') or []:
        if isinstance(plan, dict) and 'ctaHref' in plan:
            plan['ctaHref'] = _scrub_href(plan.get('ctaHref'))

    # Qualquer campo string de nível-1 que seja link de contato (ex: Hero.ctaHref,
    # Cta.ctaHref) vira '#'. Não toca em prosa (não-href).
    for key, value in list(props.items()):
        if _is_contact_href(value):
            props[key] = '#'


def _anonymize_chrome(chrome):
    if not isinstance(chrome, dict):
        return
    header = chrome.get('header')
    if isinstance(header, dict):
        header['logoText'] = ''
        header['logoUrl'] = ''
        cta = header.get('cta')
        if isinstance(cta, dict):
            cta['href'] = _scrub_href(cta.get('href'))
        for link in header.get('links') or []:
            if isinstance(link, dict):
                link['href'] = _scrub_href(link.get('href'))
    footer = chrome.get('footer')
    if isinstance(footer, dict):
        footer['copyright'] = ''
        for col in footer.get('columns') or []:
            if isinstance(col, dict):
                for link in col.get('links') or []:
                    if isinstance(link, dict):
                        link['href'] = _scrub_href(link.get('href'))


def anonymize_snapshot(snapshot):
    """Retorna uma cópia do snapshot com o PII estruturado limpo. NÃO muta
    o original. Prosa livre (títulos, Sobre, RichText, citações) fica intacta —
    o usuário revisa ao instanciar."""
    snap = copy.deepcopy(snapshot or {})
    for page in snap.get('pages') or []:
        content = (page.get('blocks') or {}).get('content')
        if isinstance(content, list):
            for node in content:
                _anonymize_block(node)
    _anonymize_chrome(snap.get('chrome'))
    return snap


# ---------------------------------------------------------------------------
# Instanciação
# ---------------------------------------------------------------------------

def _unique_project_slug(client, base):
    """Garante slug único por client (constraint unique_project_slug_per_client)."""
    base = base or 'site'
    slug = base
    suffix = 1
    while Project.all_objects.filter(client=client, slug=slug).exists():
        suffix += 1
        slug = f'{base}-{suffix}'
    return slug


def instantiate_template(template, client, name=None, slug=None):
    """Cria um Project novo + Pages a partir do snapshot do template, no
    `client` dado. `client` é setado explicitamente (ClientModel.save aceita
    quando bate com o client corrente ou quando não há corrente)."""
    snap = template.snapshot or {}
    proj_name = name or template.name
    proj_slug = _unique_project_slug(client, slugify(slug or proj_name))

    project = Project(
        client=client,
        name=proj_name,
        slug=proj_slug,
        description=template.description or '',
        theme=snap.get('theme') or {},
        chrome=snap.get('chrome') or {},
        is_published=False,
        needs_rebuild=True,
    )
    project.save()

    for page_data in snap.get('pages') or []:
        Page(
            client=client,
            project=project,
            title=page_data.get('title') or 'Página',
            slug=page_data.get('slug') or '',
            page_type=page_data.get('page_type') or Page.PAGE_TYPE_GENERIC,
            is_home=bool(page_data.get('is_home')),
            is_published=bool(page_data.get('is_published', True)),
            order=page_data.get('order') or 0,
            blocks=page_data.get('blocks') or {'root': {'props': {}}, 'content': []},
        ).save()

    return project
