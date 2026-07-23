from django.test import TestCase, RequestFactory

from core.models import Project, Page
from core.views import sitemap_xml
from tenancy.models import Client
from tenancy.threadlocal import set_current_client, clear_current_client


class SitemapXmlTestCase(TestCase):
    """/sitemap.xml é público e cross-tenant por natureza — precisa listar
    projetos publicados de TODOS os clients, mesmo quando a requisição é
    de um usuário autenticado com um client corrente no threadlocal (ver
    tenancy.middleware.CurrentClientMiddleware). Usar o manager errado
    (`objects` em vez de `all_objects`) faz o sitemap enxergar só o
    tenant do usuário logado — bug real encontrado em revisão."""

    def setUp(self):
        self.tenant_a = Client.objects.create(name='Tenant A', slug='tenant-a')
        self.tenant_b = Client.objects.create(name='Tenant B', slug='tenant-b')

        self.project_a = Project.objects.create(
            client=self.tenant_a, name='Site A', slug='site-a', is_published=True
        )
        Page.objects.create(
            client=self.tenant_a, project=self.project_a, title='Home A',
            slug='', is_home=True, is_published=True,
        )

        self.project_b = Project.objects.create(
            client=self.tenant_b, name='Site B', slug='site-b', is_published=True
        )
        Page.objects.create(
            client=self.tenant_b, project=self.project_b, title='Home B',
            slug='', is_home=True, is_published=True,
        )

    def _get_sitemap(self):
        request = RequestFactory().get('/sitemap.xml')
        response = sitemap_xml(request)
        return response.content.decode()

    def test_sitemap_lists_all_tenants_when_no_client_in_threadlocal(self):
        body = self._get_sitemap()
        self.assertIn('site-a', body)
        self.assertIn('site-b', body)

    def test_sitemap_lists_all_tenants_even_with_authenticated_tenant_in_threadlocal(self):
        """Reproduz a sessão de um dono de tenant logado (ClientProfile
        fixo no próprio client) — o sitemap não pode enxergar só o
        próprio tenant."""
        set_current_client(self.tenant_a)
        try:
            body = self._get_sitemap()
        finally:
            clear_current_client()

        self.assertIn('site-a', body)
        self.assertIn('site-b', body)

    def test_sitemap_excludes_noindex_pages(self):
        page = Page.objects.create(
            client=self.tenant_a, project=self.project_a, title='Privada',
            slug='privada', is_published=True,
        )
        page.seo_settings.noindex = True
        page.seo_settings.save()

        body = self._get_sitemap()
        self.assertNotIn('privada', body)

    def test_sitemap_excludes_soft_deleted_projects(self):
        self.project_b.delete()  # SoftDeletableModel: is_removed=True, não hard delete

        body = self._get_sitemap()
        self.assertIn('site-a', body)
        self.assertNotIn('site-b', body)
