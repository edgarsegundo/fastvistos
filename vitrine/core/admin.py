from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin
from tenancy.admin import ClientScopedAdmin

from .models import ClientUser, Project, Page


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
