import json

from django import forms
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.urls import path, reverse
from django.utils.html import format_html, format_html_join
from django_jsonform.forms.fields import JSONFormField
from unfold.admin import ModelAdmin, StackedInline, TabularInline
from tenancy.admin import ClientScopedAdmin

from .models import (
    ClientUser, Project, Page, Build, Deployment, Domain,
    PlatformSeoDefaults, ProjectSeoSettings, PageSeoSettings,
)
from .seo import resolve_seo
from .seo_schemas import PAGE_TYPE_SCHEMAS

# Validação de fronteira pro upload de "Importar JSON" (ver
# PageAdmin.import_type_specific_json) — arquivo vem de fora do sistema.
MAX_IMPORT_FILE_SIZE = 512 * 1024  # 512 KB
MAX_FAQ_QUESTIONS_PER_IMPORT = 200

# Import DomainAdmin from separate file to keep admin.py manageable
from .admin_domain import DomainAdmin as _DomainAdmin


@admin.register(ClientUser)
class ClientUserAdmin(BaseUserAdmin, ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'created')
    list_filter = ('is_staff', 'is_active', 'created')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    fieldsets = (
        ('Credenciais', {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('first_name', 'last_name')}),
        ('Permissões', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Auditoria', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

    readonly_fields = ('created', 'modified')


@admin.register(Project)
class ProjectAdmin(ClientScopedAdmin, ModelAdmin):
    list_display = ('name', 'slug', 'is_published', 'needs_rebuild', 'created')
    list_filter = ('is_published', 'needs_rebuild', 'created')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    actions = ['action_build_and_deploy']

    readonly_fields = ('created', 'modified')

    fieldsets = (
        ('Básico', {
            'fields': ('name', 'slug', 'description', 'is_published'),
            'description': (
                'O slug vira parte da URL pública do projeto '
                '(seudominio.com/app/{slug}/) e do nome da pasta no '
                'servidor. Se você mudar o slug depois de já ter '
                'publicado, o sistema renomeia a pasta no servidor e '
                'republica o projeto automaticamente (via SSH) — não '
                'precisa clicar em "Build & Publicar" de novo. Isso só '
                'funciona se o deploybot estiver configurado; se falhar, '
                'você vai ver um aviso pedindo pra rodar "Build & '
                'Publicar" manualmente.'
            ),
        }),
        ('Aparência (nível de Site)', {
            'fields': ('theme', 'chrome'),
            'classes': ('wide',),
            'description': (
                'Config de nível de Site em JSON (STOPGAP da fase 1 — o painel '
                'visual vem na fase 2). '
                'theme: {"colors":{"primary":"#2563eb","ink":"#1f2937",...},'
                '"fonts":{"heading":"Poppins","body":"Inter"},"radius":"12px"}. '
                'chrome: {"header":{"logoText":"...","links":[{"label":"..","href":".."}],'
                '"cta":{"label":"..","href":".."}},"footer":{"columns":[...],"copyright":".."}}. '
                'Vazio = usa os defaults do tema.'
            ),
        }),
        ('Status', {
            'fields': ('needs_rebuild',),
        }),
        ('Auditoria', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',),
        }),
    )

    def save_model(self, request, obj, form, change):
        """Se o slug mudou e o projeto já tem deploy bem-sucedido, tenta
        renomear a pasta no VPS automaticamente (evita o cenário: slug
        antigo com arquivos, slug novo com pasta vazia → 404)."""
        old_slug = None
        if change and 'slug' in form.changed_data:
            old_slug = Project.all_objects.filter(pk=obj.pk).values_list('slug', flat=True).first()

        super().save_model(request, obj, form, change)

        if old_slug and old_slug != obj.slug:
            has_deployment = obj.builds.filter(deployment__status='success').exists()
            if has_deployment:
                from django.db import transaction

                # O admin envolve save_model() inteiro numa transação. Se
                # renomear+rebuildar aqui dentro, o `npm run build` sobe um
                # subprocess que faz fetch() de volta pra API do Django
                # (/api/projects/<slug>/pages/) numa CONEXÃO NOVA — que ainda
                # não enxerga o UPDATE do slug, porque a transação externa
                # não commitou. Resultado: "Project not found", build falha
                # com 0 páginas, mesmo o slug já estando salvo (só não
                # visível pra outras conexões ainda). Rodar via
                # transaction.on_commit() garante que o rename+rebuild só
                # dispara depois que o commit realmente aconteceu.
                transaction.on_commit(
                    lambda: self._rename_and_rebuild(request, obj, old_slug)
                )

    def _rename_and_rebuild(self, request, obj, old_slug):
        from core.deploy import rename_project_release, build_project, deploy_build

        try:
            rename_project_release(old_slug, obj.slug)
        except Exception as e:
            messages.warning(
                request,
                f'⚠️ Slug mudado de "{old_slug}" pra "{obj.slug}", mas não consegui '
                f'renomear a pasta no servidor automaticamente ({str(e)[:150]}). '
                f'Rode "Build & Publicar" de novo pra publicar em /{obj.slug}/.'
            )
            return

        # A pasta renomeada só resolve o caminho externo — o HTML já gerado
        # tem o slug antigo embutido nos links internos (breadcrumbs, nav),
        # então precisa reconstruir pra ficar 100% correto. Fazemos isso
        # automaticamente aqui pra não depender do usuário lembrar de clicar
        # em "Build & Publicar" de novo.
        try:
            build = build_project(obj, triggered_by=request.user)
            deployment = deploy_build(build)
            if deployment.status == Deployment.STATUS_SUCCESS:
                messages.success(
                    request,
                    f'📦 Pasta renomeada de "{old_slug}" pra "{obj.slug}" e projeto '
                    f'republicado automaticamente com os links atualizados.'
                )
            else:
                messages.warning(
                    request,
                    f'📦 Pasta renomeada de "{old_slug}" pra "{obj.slug}", mas o rebuild '
                    f'automático falhou ({deployment.log_output[:150]}). Rode "Build & '
                    f'Publicar" manualmente pra corrigir os links internos.'
                )
        except Exception as e:
            messages.warning(
                request,
                f'📦 Pasta renomeada de "{old_slug}" pra "{obj.slug}", mas o rebuild '
                f'automático falhou ({str(e)[:150]}). Rode "Build & Publicar" '
                f'manualmente pra corrigir os links internos.'
            )

    def get_inlines(self, request, obj=None):
        """Mostrar SEO do projeto (branding/fallback pras páginas) e o
        histórico de Builds (Deployment fica dentro do BuildAdmin, já que
        Deployment não tem FK direta pra Project, só pra Build)."""
        if obj:
            return [ProjectSeoSettingsInline, BuildInline]
        return []

    def action_build_and_deploy(self, request, queryset):
        """Action: Build & Deploy — roda 1 build por projeto selecionado
        (build é sempre escopado a 1 projeto, ver docs/build-por-projeto.md)"""
        from django.contrib import messages
        from core.deploy import build_project, deploy_build

        succeeded = 0
        failed = 0

        for project in queryset:
            try:
                build = build_project(project, triggered_by=request.user)
                deployment = deploy_build(build)

                if deployment.status == Deployment.STATUS_SUCCESS:
                    succeeded += 1
                else:
                    failed += 1
                    messages.error(request, f'❌ Deploy de "{project.slug}" falhou: {deployment.log_output[:200]}')
            except Exception as e:
                failed += 1
                messages.error(request, f'❌ Erro em "{project.slug}": {str(e)[:200]}')

        if succeeded:
            messages.success(request, f'✅ {succeeded} projeto(s) publicado(s) com sucesso')

    action_build_and_deploy.short_description = '🚀 Build & Publicar'


@admin.register(Page)
class PageAdmin(ClientScopedAdmin, ModelAdmin):
    list_display = ('title', 'project', 'slug', 'blocks_count', 'is_published', 'live_link_actions', 'order', 'modified')
    list_filter = ('is_published', 'project', 'created')
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created', 'modified', 'preview_link', 'live_link_actions')

    fieldsets = (
        ('Básico', {
            'fields': ('project', 'title', 'slug', 'page_type', 'is_home', 'is_published', 'order')
        }),
        ('Links', {
            'fields': ('preview_link', 'live_link_actions'),
            'description': 'Preview mostra rascunhos (mesmo não publicados). Link ao vivo só funciona depois de "Build & Publicar" no projeto.'
        }),
        ('Blocos', {
            'fields': ('blocks',),
            'classes': ('wide',),
            'description': (
                'Documento de blocos (formato Puck): {"content": [{"type": "Hero", '
                '"props": {...}}, ...]}. Edição por JSON cru é STOPGAP da fase 0 — '
                'o editor visual inline vem na fase 2. Tipos disponíveis: '
                'Hero, Features, RichText, HtmlSafe, CodeEmbed.'
            ),
        }),
        ('Auditoria', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )

    def get_urls(self):
        custom = [
            path(
                '<int:page_id>/import-type-specific-json/',
                self.admin_site.admin_view(self.import_type_specific_json),
                name='core_page_import_type_specific_json',
            ),
        ]
        return custom + super().get_urls()

    def import_type_specific_json(self, request, page_id):
        """Importa `type_specific_data` de um arquivo JSON enviado pelo
        usuário — só pra page_type=faq nesta fase (ver
        docs/decisoes/import-json-type-specific-data.md pro porquê e o
        plano de generalizar pros outros tipos).

        `self.admin_site.admin_view()` (aplicado em get_urls) já garante
        login+staff+CSRF antes de chegar aqui — mesmo mecanismo nativo
        que protege qualquer outra view do admin, não precisa reimplementar."""
        if request.method != 'POST':
            return JsonResponse({'error': 'Method not allowed'}, status=405)

        page = get_object_or_404(self.get_queryset(request), pk=page_id)

        if page.page_type != Page.PAGE_TYPE_FAQ:
            return JsonResponse(
                {'error': 'Importação de JSON só está disponível pra FAQ nesta fase.'},
                status=400,
            )
        schema_cls = PAGE_TYPE_SCHEMAS[Page.PAGE_TYPE_FAQ]

        upload = request.FILES.get('file')
        if not upload:
            return JsonResponse({'error': 'Nenhum arquivo enviado.'}, status=400)
        if upload.size > MAX_IMPORT_FILE_SIZE:
            return JsonResponse({'error': 'Arquivo maior que 512 KB.'}, status=400)

        try:
            raw = json.loads(upload.read().decode('utf-8'))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return JsonResponse({'error': 'Arquivo não é um JSON válido.'}, status=400)

        # Aceita tanto lista solta ([{question,answer}, ...]) quanto o
        # formato canônico ({"questions": [...]})
        if isinstance(raw, list):
            raw = {'questions': raw}
        if not isinstance(raw, dict):
            return JsonResponse({'error': 'JSON precisa ser uma lista ou objeto.'}, status=400)

        parsed = schema_cls.from_dict(raw)
        if len(parsed.questions) > MAX_FAQ_QUESTIONS_PER_IMPORT:
            return JsonResponse(
                {'error': f'Máximo de {MAX_FAQ_QUESTIONS_PER_IMPORT} perguntas por importação.'},
                status=400,
            )

        page.seo_settings.type_specific_data = parsed.to_dict()
        page.seo_settings.save()

        return JsonResponse({
            'status': 'imported',
            'count': len(parsed.questions),
            'message': f'✅ {len(parsed.questions)} pergunta(s) importada(s).',
        })

    def get_inlines(self, request, obj=None):
        if obj:
            return [PageSeoSettingsInline]
        return []

    def blocks_count(self, obj):
        """Quantos blocos a página tem (stopgap da fase 0)."""
        doc = obj.blocks if isinstance(obj.blocks, dict) else {}
        content = doc.get('content')
        n = len(content) if isinstance(content, list) else 0
        return f'🧱 {n}'
    blocks_count.short_description = 'Blocos'

    def preview_link(self, obj):
        """Renderiza um link para visualizar a página em preview"""
        from django.urls import reverse
        from django.utils.html import format_html
        if obj.id:
            url = reverse('preview_page', args=[obj.id])
            return format_html(
                '<a href="{}" target="_blank" style="background: #3b82f6; color: white; padding: 8px 16px; '
                'border-radius: 4px; text-decoration: none; font-weight: 600;">👁 Ver Preview</a>',
                url
            )
        return '-'
    preview_link.short_description = 'Preview'

    def _live_url(self, obj):
        """Monta a URL pública da página já publicada (não confundir com
        preview — essa exige que "Build & Publicar" já tenha rodado pro
        projeto, senão o arquivo não existe ainda no VPS)."""
        from django.conf import settings
        base = settings.PLATFORM_PUBLIC_BASE_URL.rstrip('/')
        project_slug = obj.project.slug
        # Página home (is_home ou slug vazio) fica na raiz do projeto, sem
        # segmento de página — mesma convenção do Astro (ver
        # multi-sites/sites/_saas/pages/[project]/[...slug].astro).
        if obj.is_home or not obj.slug:
            return f'{base}/app/{project_slug}/'
        return f'{base}/app/{project_slug}/{obj.slug}/'

    def live_link_actions(self, obj):
        """Ícone pra abrir a página publicada (nova aba) + botão de copiar
        o link — pedido explicitamente pra aparecer na lista de Páginas."""
        from django.utils.html import format_html
        if not obj.id:
            return '-'
        url = self._live_url(obj)
        return format_html(
            '<div style="display:flex; gap:10px; align-items:center;">'
            '<a href="{}" target="_blank" rel="noopener" title="Abrir página ao vivo" '
            'style="text-decoration:none; font-size:1.15em;">🔗</a>'
            '<button type="button" data-copy-url="{}" '
            'onclick="navigator.clipboard.writeText(this.dataset.copyUrl); '
            'const t=this; t.textContent=\'✅\'; setTimeout(()=>{{t.textContent=\'📋\';}}, 1500);" '
            'title="Copiar link" '
            'style="border:none; background:none; cursor:pointer; font-size:1.15em; padding:0;">📋</button>'
            '</div>',
            url, url
        )
    live_link_actions.short_description = '🔗 Link ao vivo'


def _seo_checklist_html(resolved):
    """Checklist textual estilo Yoast — não bloqueia salvamento, só avisa."""
    rows = []

    title_len = len(resolved['title'])
    if not (30 <= title_len <= 60):
        rows.append(('#f59e0b', f'⚠️ Título com {title_len} caracteres (ideal: 30–60)'))
    else:
        rows.append(('#10b981', '✅ Título com tamanho ideal'))

    desc_len = len(resolved['description'])
    if desc_len == 0:
        rows.append(('#ef4444', '❌ Sem descrição — buscadores vão gerar uma automaticamente'))
    elif not (120 <= desc_len <= 160):
        rows.append(('#f59e0b', f'⚠️ Descrição com {desc_len} caracteres (ideal: 120–160)'))
    else:
        rows.append(('#10b981', '✅ Descrição com tamanho ideal'))

    if not resolved['og_image']:
        rows.append(('#ef4444', '❌ Sem imagem de compartilhamento (og:image) — nem na página, nem no projeto, nem na plataforma'))
    else:
        rows.append(('#10b981', '✅ Imagem de compartilhamento definida'))

    items = format_html_join(
        '', '<li style="color:{}; margin-bottom:4px;">{}</li>', rows
    )
    return format_html('<ul style="list-style:none; padding-left:0; margin:0;">{}</ul>', items)


class ProjectSeoSettingsInline(StackedInline):
    """SEO/branding a nível de projeto — fallback pra todas as páginas
    que não definirem os próprios campos (ver core/seo.py::resolve_seo)."""
    model = ProjectSeoSettings
    can_delete = False
    max_num = 1
    verbose_name_plural = 'SEO do Projeto (fallback pras páginas)'
    fields = (
        'og_image_url', 'favicon_url', 'author_name',
        'organization_name_override', 'default_title_suffix', 'llms_summary',
    )


class PageSeoSettingsInlineForm(forms.ModelForm):
    """Troca o textarea de JSON cru de `type_specific_data` por campos
    reais, escolhendo o schema (`django-jsonform`) conforme o `page_type`
    da página dona deste registro — ver core/seo_schemas.py.

    A inline só aparece na edição de uma `Page` já existente
    (`PageAdmin.get_inlines`), então `page_type` já está persistido
    quando este form é instanciado — não precisa de JS pra reagir a uma
    mudança de `page_type` no mesmo request."""
    class Meta:
        model = PageSeoSettings
        fields = [
            'seo_title', 'seo_description', 'og_image_override',
            'canonical_override', 'noindex', 'type_specific_data',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        page = getattr(self.instance, 'page', None)
        schema_cls = PAGE_TYPE_SCHEMAS.get(page.page_type) if page else None
        if schema_cls:
            self.fields['type_specific_data'] = JSONFormField(
                schema=schema_cls.SCHEMA,
                required=False,
                model_name='PageSeoSettings',
            )


class PageSeoSettingsInline(StackedInline):
    """SEO específico da página — sobrescreve o fallback do projeto/plataforma."""
    model = PageSeoSettings
    form = PageSeoSettingsInlineForm
    can_delete = False
    max_num = 1
    verbose_name_plural = 'SEO da Página'

    def get_fields(self, request, obj=None):
        base = [
            'seo_checklist', 'seo_title', 'seo_description',
            'og_image_override', 'canonical_override', 'noindex', 'type_specific_data',
        ]
        if obj and obj.page_type == Page.PAGE_TYPE_FAQ:
            base.insert(base.index('type_specific_data'), 'import_faq_json_button')
        if request.GET.get('debug') == '1':
            base.insert(1, 'debug_fill_button')
        return base

    def get_readonly_fields(self, request, obj=None):
        base = ['seo_checklist']
        if obj and obj.page_type == Page.PAGE_TYPE_FAQ:
            base.append('import_faq_json_button')
        if request.GET.get('debug') == '1':
            base.append('debug_fill_button')
        return base

    def seo_checklist(self, obj):
        if not obj or not obj.pk:
            return 'Salve a página pra ver o checklist de SEO.'
        return _seo_checklist_html(resolve_seo(obj.page))
    seo_checklist.short_description = 'Checklist de SEO'

    def import_faq_json_button(self, obj):
        """Botão "Importar JSON" — só aparece pra page_type=faq (ver
        get_fields/get_readonly_fields). Faz upload direto pro endpoint
        (PageAdmin.import_type_specific_json), sem passar pelo form
        principal do admin — por isso não precisa de enctype
        multipart no <form> do admin em si."""
        if not obj or not obj.pk:
            return ''

        import_url = reverse('admin:core_page_import_type_specific_json', args=[obj.page_id])
        return format_html(
            '''<input type="file" id="import-faq-json-file" accept="application/json,.json">
            <button type="button" id="import-faq-json-btn"
               style="background:#3b82f6; color:white; padding:8px 16px; border:none;
                      border-radius:4px; cursor:pointer; font-weight:600; margin-left:8px;"
               onclick="importFaqJson()">
              📥 Importar JSON
            </button>
            <div id="import-faq-json-status" style="margin-top:8px; font-size:0.9em;"></div>
            <p style="margin-top:8px; font-size:0.85em; color:#6b7280;">
              Formato aceito: <code>[{{"question": "...", "answer": "..."}}]</code>
              ou <code>{{"questions": [...]}}</code>.
            </p>
            <script>
              function getCookie(name) {{
                let value = null;
                if (document.cookie) {{
                  for (let part of document.cookie.split(';')) {{
                    part = part.trim();
                    if (part.startsWith(name + '=')) {{
                      value = decodeURIComponent(part.substring(name.length + 1));
                      break;
                    }}
                  }}
                }}
                return value;
              }}

              function importFaqJson() {{
                const fileInput = document.getElementById('import-faq-json-file');
                const btn = document.getElementById('import-faq-json-btn');
                const status = document.getElementById('import-faq-json-status');

                if (!fileInput.files.length) {{
                  status.textContent = '❌ Selecione um arquivo primeiro.';
                  status.style.color = '#ef4444';
                  return;
                }}

                const formData = new FormData();
                formData.append('file', fileInput.files[0]);

                btn.disabled = true;
                btn.style.opacity = '0.6';
                status.textContent = '⏳ Importando...';
                status.style.color = '';

                fetch('{}', {{
                  method: 'POST',
                  headers: {{'X-CSRFToken': getCookie('csrftoken')}},
                  body: formData,
                }})
                  .then(r => r.json())
                  .then(data => {{
                    if (data.status === 'imported') {{
                      status.textContent = data.message;
                      status.style.color = '#10b981';
                      setTimeout(() => window.location.reload(), 1500);
                    }} else {{
                      status.textContent = '❌ Erro: ' + (data.error || 'Desconhecido');
                      status.style.color = '#ef4444';
                      btn.disabled = false;
                      btn.style.opacity = '1';
                    }}
                  }})
                  .catch(err => {{
                    status.textContent = '❌ Erro: ' + err.message;
                    status.style.color = '#ef4444';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                  }});
              }}
            </script>
            ''',
            import_url,
        )
    import_faq_json_button.short_description = '📥 Importar de arquivo'

    def debug_fill_button(self, obj):
        """Botão "Preencher com Fake Data" — aparece apenas se ?debug=1"""
        if not obj or not obj.pk:
            return ''

        # Renderiza um botão que chama a API via AJAX
        return format_html(
            '''<button type="button" id="debug-fill-seo-btn"
               style="background:#10b981; color:white; padding:8px 16px; border:none;
                      border-radius:4px; cursor:pointer; font-weight:600;"
               onclick="debugFillSEOFake({})">
              🤖 Preencher com Fake Data
            </button>
            <div id="debug-fill-status" style="margin-top:8px; font-size:0.9em;"></div>
            <script>
              function debugFillSEOFake(pageId) {{
                const btn = document.getElementById('debug-fill-seo-btn');
                const status = document.getElementById('debug-fill-status');
                btn.disabled = true;
                btn.style.opacity = '0.6';
                status.textContent = '⏳ Preenchendo...';

                fetch('/api/debug/fill-seo-fake/' + pageId + '/?debug=1')
                  .then(r => r.json())
                  .then(data => {{
                    if (data.status === 'filled') {{
                      status.innerHTML = '✅ ' + data.message;
                      status.style.color = '#10b981';
                      // Recarrega a página em 2 segundos
                      setTimeout(() => window.location.reload(), 2000);
                    }} else {{
                      status.textContent = '❌ Erro: ' + (data.error || 'Desconhecido');
                      status.style.color = '#ef4444';
                      btn.disabled = false;
                      btn.style.opacity = '1';
                    }}
                  }})
                  .catch(err => {{
                    status.textContent = '❌ Erro: ' + err.message;
                    status.style.color = '#ef4444';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                  }});
              }}
            </script>
            ''',
            obj.pk
        )
    debug_fill_button.short_description = '🤖 Debug'


class BuildInline(TabularInline):
    """Inline em ProjectAdmin — Build tem FK direta pra Project."""
    model = Build
    extra = 0
    readonly_fields = ('status', 'triggered_by', 'log_output', 'started_at', 'finished_at', 'created')
    fields = ('status', 'triggered_by', 'started_at', 'finished_at')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class DeploymentInline(TabularInline):
    """Inline em BuildAdmin — Deployment só tem FK direta pra Build,
    não pra Project (por isso não pode ser inline de ProjectAdmin)."""
    model = Deployment
    extra = 0
    readonly_fields = ('status', 'deployed_at', 'log_output', 'created')
    fields = ('status', 'deployed_at')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Build)
class BuildAdmin(ClientScopedAdmin, ModelAdmin):
    list_display = ('id', 'project', 'status_badge', 'triggered_by', 'started_at', 'finished_at', 'created')
    list_filter = ('status', 'project', 'created')
    search_fields = ('id', 'project__slug', 'project__name', 'log_output')
    readonly_fields = (
        'project', 'status', 'triggered_by', 'log_output', 'content_snapshot',
        'release_path', 'started_at', 'finished_at', 'created', 'modified'
    )
    inlines = [DeploymentInline]
    fieldsets = (
        ('Build Info', {
            'fields': ('project', 'status', 'triggered_by', 'release_path')
        }),
        ('Timing', {
            'fields': ('started_at', 'finished_at')
        }),
        ('Content', {
            'fields': ('content_snapshot',),
            'classes': ('collapse',)
        }),
        ('Logs', {
            'fields': ('log_output',),
            'classes': ('collapse',)
        }),
        ('Auditoria', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        """Status com cor"""
        from django.utils.html import format_html
        colors = {
            'pending': '#6b7280',
            'running': '#3b82f6',
            'success': '#10b981',
            'failed': '#ef4444',
        }
        labels = {
            'pending': 'Pendente',
            'running': 'Em execução',
            'success': 'Sucesso',
            'failed': 'Falha',
        }
        color = colors.get(obj.status, '#6b7280')
        label = labels.get(obj.status, obj.status)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 12px; border-radius: 3px;">{}</span>',
            color, label
        )
    status_badge.short_description = 'Status'

    def has_add_permission(self, request):
        return False


@admin.register(Deployment)
class DeploymentAdmin(ClientScopedAdmin, ModelAdmin):
    list_display = ('id', 'build', 'status_badge', 'deployed_at', 'created')
    list_filter = ('status', 'created')
    search_fields = ('id', 'build__id', 'log_output')
    readonly_fields = (
        'build', 'status', 'log_output', 'deployed_at', 'created', 'modified'
    )
    fieldsets = (
        ('Deployment Info', {
            'fields': ('build', 'status', 'deployed_at')
        }),
        ('Logs', {
            'fields': ('log_output',),
            'classes': ('collapse',)
        }),
        ('Auditoria', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        """Status com cor"""
        from django.utils.html import format_html
        colors = {
            'pending': '#6b7280',
            'deploying': '#3b82f6',
            'success': '#10b981',
            'failed': '#ef4444',
            'rolled_back': '#f59e0b',
        }
        labels = {
            'pending': 'Pendente',
            'deploying': 'Deployando',
            'success': 'Sucesso',
            'failed': 'Falha',
            'rolled_back': 'Revertido',
        }
        color = colors.get(obj.status, '#6b7280')
        label = labels.get(obj.status, obj.status)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 12px; border-radius: 3px;">{}</span>',
            color, label
        )
    status_badge.short_description = 'Status'

    def has_add_permission(self, request):
        return False


@admin.register(PlatformSeoDefaults)
class PlatformSeoDefaultsAdmin(ModelAdmin):
    """Singleton — substitui multi-sites/sites/_saas/site-config.ts.

    Uma única entrada de menu, sem changelist: qualquer acesso vai direto
    pro (único) registro, criando-o se ainda não existir.
    """
    fieldsets = (
        ('Identidade', {
            'fields': ('site_name', 'locale', 'theme_color'),
        }),
        ('Branding padrão', {
            'fields': ('default_favicon_url', 'default_og_image_url', 'default_author_name'),
            'description': 'Usado por qualquer Projeto/Página que não definir o próprio.',
        }),
        ('Organização (JSON-LD)', {
            'fields': ('organization_name', 'organization_logo_url'),
        }),
        ('Verificação/Analytics', {
            'fields': ('google_site_verification', 'gtm_id'),
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        obj = PlatformSeoDefaults.load()
        return redirect(reverse('admin:core_platformseodefaults_change', args=[obj.pk]))
