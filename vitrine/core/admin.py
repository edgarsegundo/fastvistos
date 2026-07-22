from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin
from tenancy.admin import ClientScopedAdmin

from .models import ClientUser, Project, Page, Build, Deployment, Domain

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
    readonly_fields = ('created', 'modified')
    actions = ['action_build_and_deploy']

    fieldsets = (
        ('Básico', {
            'fields': ('name', 'slug', 'description', 'is_published')
        }),
        ('Status', {
            'fields': ('needs_rebuild',),
        }),
        ('Auditoria', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',),
        }),
    )

    def get_inlines(self, request, obj=None):
        """Mostrar histórico de Builds deste projeto (Deployment fica dentro do BuildAdmin,
        já que Deployment não tem FK direta pra Project, só pra Build)."""
        if obj:
            return [BuildInline]
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
    list_display = ('title', 'project', 'slug', 'format_badge', 'is_published', 'order', 'modified')
    list_filter = ('content_format', 'is_published', 'project', 'created')
    search_fields = ('title', 'slug', 'content')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created', 'modified', 'format_explanation', 'preview_link')

    fieldsets = (
        ('Básico', {
            'fields': ('project', 'title', 'slug', 'is_home', 'is_published', 'order')
        }),
        ('Formato do Conteúdo', {
            'fields': ('content_format', 'format_explanation'),
            'description': 'Escolha como você quer criar o conteúdo.'
        }),
        ('Conteúdo', {
            'fields': ('content',),
            'classes': ('wide',),
        }),
        ('SEO', {
            'fields': ('seo_title', 'seo_description')
        }),
        ('Auditoria', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )

    def format_badge(self, obj):
        """Mostra badge com formato da página"""
        from django.utils.html import format_html
        colors = {
            'markdown': '#3498db',
            'html_safe': '#f39c12',
            'html_custom': '#e74c3c',
        }
        format_names = {
            'markdown': '📝 Markdown',
            'html_safe': '🔒 HTML Seguro',
            'html_custom': '⚡ HTML Custom',
        }
        color = colors.get(obj.content_format, '#95a5a6')
        name = format_names.get(obj.content_format, obj.content_format)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; border-radius: 3px;">{}</span>',
            color,
            name
        )
    format_badge.short_description = 'Formato'

    def format_explanation(self, obj):
        """Mostra explicação detalhada de cada formato"""
        from django.utils.html import format_html
        explanations = {
            'markdown': '''
                <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db;">
                    <h3 style="color: #3498db; margin-top: 0;">📝 Markdown</h3>
                    <p><strong>Melhor para:</strong> Blog posts, documentação, conteúdo simples</p>
                    <p><strong>Vantagens:</strong> ⚡ Rápido | 🎯 Bom SEO | 📱 Responsivo | 🔍 Analytics funciona</p>
                    <p><strong>Desvantagens:</strong> ❌ Sem JavaScript | ❌ Sem interatividade</p>
                </div>
            ''',
            'html_safe': '''
                <div style="background: #fef5e7; padding: 15px; border-radius: 5px; border-left: 4px solid #f39c12;">
                    <h3 style="color: #f39c12; margin-top: 0;">🔒 HTML Seguro</h3>
                    <p><strong>Melhor para:</strong> Landing pages, portfolios, conteúdo com styling</p>
                    <p><strong>Vantagens:</strong> ⚡ Rápido | 🎨 CSS funciona | 🎯 Bom SEO | 🔒 Seguro</p>
                    <p><strong>Desvantagens:</strong> ❌ Sem JavaScript | ❌ Sem interatividade</p>
                </div>
            ''',
            'html_custom': '''
                <div style="background: #fadbd8; padding: 15px; border-radius: 5px; border-left: 4px solid #e74c3c;">
                    <h3 style="color: #e74c3c; margin-top: 0;">⚡ HTML Customizado (com JavaScript)</h3>
                    <p><strong>Melhor para:</strong> Aplicações interativas, dashboards, conteúdo com JavaScript</p>
                    <p><strong>Vantagens:</strong> 🚀 JavaScript funciona | 🎯 Máxima flexibilidade | 🤖 Ótimo com IA</p>
                    <p><strong>Desvantagens:</strong> ⏱️ Um pouco mais lento | 📱 CSS não herda</p>
                </div>
            ''',
        }

        return format_html(
            explanations.get(obj.content_format, '<p>Selecione um formato acima</p>')
        )
    format_explanation.short_description = 'ℹ️ Informações sobre o formato'

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


class BuildInline(admin.TabularInline):
    """Inline em ProjectAdmin — Build tem FK direta pra Project."""
    model = Build
    extra = 0
    readonly_fields = ('status', 'triggered_by', 'log_output', 'started_at', 'finished_at', 'created')
    fields = ('status', 'triggered_by', 'started_at', 'finished_at')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class DeploymentInline(admin.TabularInline):
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
