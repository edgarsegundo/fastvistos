from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.apps import apps
from core.models import Project, Page, ProjectSeoSettings, PageSeoSettings


class EnsureSiteMiddleware:
    """Middleware que garante que o Site existe e está atualizado."""

    def __init__(self, get_response):
        self.get_response = get_response
        self._site_checked = False

    def __call__(self, request):
        # Na primeira request, garante que o Site existe
        if not self._site_checked:
            ensure_site_exists(domain=request.get_host())
            self._site_checked = True

        response = self.get_response(request)
        return response


def ensure_site_exists(domain=None):
    """Cria um Site padrão se não existir — necessário pra allauth/django-sites.

    Em dev, cria um Site genérico sem porta (Django Sites não deve incluir porta).
    """
    try:
        from django.contrib.sites.models import Site
        from django.conf import settings

        # Remove porta do domínio se existir (Django Sites não deve incluir)
        if domain and ':' in domain:
            domain = domain.rsplit(':', 1)[0]

        # Detecta o domínio (localhost em dev, settings em prod)
        if settings.DEBUG:
            default_domain = domain or 'localhost'
            site_name = 'Vitrine Local'
        else:
            default_domain = settings.PLATFORM_PUBLIC_BASE_URL.lstrip('https://').lstrip('http://').rstrip('/').rsplit(':', 1)[0]
            site_name = 'Vitrine'

        # Tenta usar id=1 (padrão do Django), ou cria se não existir
        try:
            site = Site.objects.get(pk=1)
            # Se já existe mas domínio está errado, atualiza (comum em dev)
            if site.domain != default_domain:
                site.domain = default_domain
                site.name = site_name
                site.save()
        except Site.DoesNotExist:
            Site.objects.create(pk=1, domain=default_domain, name=site_name)
    except Exception as e:
        # Silencia erros (pode falhar se a tabela não existir ainda durante migrations)
        pass


@receiver(post_save, sender=Project)
def create_project_seo_settings(sender, instance, created, **kwargs):
    """Cria a camada de SEO do projeto vazia — resolução cai pro
    PlatformSeoDefaults até o usuário preencher algo específico."""
    if created:
        ProjectSeoSettings.objects.get_or_create(project=instance)


@receiver(post_save, sender=Page)
def create_page_seo_settings(sender, instance, created, **kwargs):
    """Cria a camada de SEO da página vazia — resolução cai pro
    ProjectSeoSettings/PlatformSeoDefaults até o usuário preencher."""
    if created:
        PageSeoSettings.objects.get_or_create(page=instance)


@receiver(post_save, sender=Page)
def mark_project_rebuild_on_page_change(sender, instance, created, **kwargs):
    """Quando uma página é criada/editada, marca projeto para rebuild"""
    instance.project.needs_rebuild = True
    instance.project.save(update_fields=['needs_rebuild'])
    action = "criada" if created else "editada"
    print(f"🔄 Página '{instance.slug}' {action} → Project '{instance.project.slug}' marcado para rebuild")


@receiver(post_delete, sender=Page)
def mark_project_rebuild_on_page_delete(sender, instance, **kwargs):
    """Quando uma página é deletada, marca projeto para rebuild"""
    instance.project.needs_rebuild = True
    instance.project.save(update_fields=['needs_rebuild'])
    print(f"🔄 Página '{instance.slug}' deletada → Project '{instance.project.slug}' marcado para rebuild")
