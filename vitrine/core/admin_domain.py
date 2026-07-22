"""Domain admin configuration (separate to avoid long admin.py file)"""

from django.contrib import admin, messages
from unfold.admin import ModelAdmin
from tenancy.admin import ClientScopedAdmin
from core.models import Domain


@admin.register(Domain)
class DomainAdmin(ClientScopedAdmin, ModelAdmin):
    list_display = (
        'domain', 'project', 'is_primary_badge', 'verification_badge',
        'ssl_badge', 'verified_at', 'created'
    )
    list_filter = ('verification_status', 'ssl_status', 'is_primary', 'created')
    search_fields = ('domain', 'project__name', 'project__slug')
    readonly_fields = (
        'verified_at', 'dns_check_log', 'created', 'modified'
    )
    actions = ['action_verify_dns', 'action_provision_nginx_and_ssl']
    fieldsets = (
        ('Domínio', {
            'fields': ('domain', 'project', 'is_primary')
        }),
        ('Verificação DNS', {
            'fields': ('verification_status', 'verified_at', 'dns_check_log'),
            'classes': ('collapse',)
        }),
        ('SSL/TLS', {
            'fields': ('ssl_status',),
        }),
        ('Auditoria', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )

    def is_primary_badge(self, obj):
        """Mostra se é domínio primário"""
        from django.utils.html import format_html
        if obj.is_primary:
            return format_html(
                '<span style="background-color: #3b82f6; color: white; padding: 4px 12px; border-radius: 3px;">Primário</span>'
            )
        return format_html(
            '<span style="background-color: #9ca3af; color: white; padding: 4px 12px; border-radius: 3px;">Customizado</span>'
        )
    is_primary_badge.short_description = 'Tipo'

    def verification_badge(self, obj):
        """Status de verificação DNS com cor"""
        from django.utils.html import format_html
        colors = {
            'pending_dns': '#f59e0b',
            'dns_verified': '#10b981',
            'failed': '#ef4444',
        }
        labels = {
            'pending_dns': 'Pendente',
            'dns_verified': '✅ Verificado',
            'failed': '❌ Falha',
        }
        color = colors.get(obj.verification_status, '#6b7280')
        label = labels.get(obj.verification_status, obj.verification_status)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 12px; border-radius: 3px;">{}</span>',
            color, label
        )
    verification_badge.short_description = 'DNS'

    def ssl_badge(self, obj):
        """Status SSL com cor"""
        from django.utils.html import format_html
        colors = {
            'none': '#6b7280',
            'pending': '#3b82f6',
            'issued': '#10b981',
            'failed': '#ef4444',
        }
        labels = {
            'none': 'Nenhum',
            'pending': 'Pendente',
            'issued': '🔒 Ativo',
            'failed': '❌ Falha',
        }
        color = colors.get(obj.ssl_status, '#6b7280')
        label = labels.get(obj.ssl_status, obj.ssl_status)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 12px; border-radius: 3px;">{}</span>',
            color, label
        )
    ssl_badge.short_description = 'SSL'

    def action_verify_dns(self, request, queryset):
        """Action: Verificar DNS"""
        from core.deploy import verify_domain_dns

        updated = 0
        failed = 0

        for domain in queryset:
            try:
                verify_domain_dns(domain)
                updated += 1
            except Exception as e:
                failed += 1
                domain.verification_status = Domain.VERIFICATION_FAILED
                domain.dns_check_log = str(e)
                domain.save()

        if updated:
            messages.success(request, f'✅ {updated} domínio(s) verificado(s)')
        if failed:
            messages.warning(request, f'⚠️  {failed} domínio(s) falharam na verificação')

    action_verify_dns.short_description = '✅ Verificar DNS'

    def action_provision_nginx_and_ssl(self, request, queryset):
        """Action: Provisionar Nginx + SSL"""
        from core.deploy import provision_domain_nginx_ssl

        updated = 0
        failed = 0

        for domain in queryset:
            if domain.verification_status != Domain.VERIFICATION_VERIFIED:
                messages.warning(request, f'⚠️  {domain.domain} ainda não passou na verificação DNS')
                failed += 1
                continue

            try:
                provision_domain_nginx_ssl(domain)
                updated += 1
            except Exception as e:
                failed += 1
                domain.ssl_status = Domain.SSL_FAILED
                domain.dns_check_log = str(e)
                domain.save()

        if updated:
            messages.success(request, f'✅ {updated} domínio(s) provisionado(s)')
        if failed:
            messages.error(request, f'❌ {failed} domínio(s) falharam')

    action_provision_nginx_and_ssl.short_description = '🚀 Provisionar (Nginx + SSL)'
