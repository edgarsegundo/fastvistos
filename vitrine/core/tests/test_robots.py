from django.test import TestCase, RequestFactory

from core.models import Project
from core.views import robots_txt
from tenancy.models import Client
from tenancy.threadlocal import set_current_client, clear_current_client


class RobotsTxtTestCase(TestCase):
    """/robots.txt é público e cross-tenant por natureza, mesmo raciocínio
    de core.tests.test_sitemap.SitemapXmlTestCase: precisa listar domínios
    customizados de TODOS os clients, mesmo quando a requisição é de um
    usuário autenticado com um client corrente no threadlocal."""

    def setUp(self):
        self.tenant_a = Client.objects.create(name='Tenant A', slug='tenant-a')
        self.tenant_b = Client.objects.create(name='Tenant B', slug='tenant-b')

        self.project_a = Project.objects.create(
            client=self.tenant_a, name='Site A', slug='site-a', is_published=True
        )
        self.project_b = Project.objects.create(
            client=self.tenant_b, name='Site B', slug='site-b', is_published=True
        )

    def _get_robots(self):
        request = RequestFactory().get('/robots.txt')
        response = robots_txt(request)
        return response.content.decode()

    def test_robots_txt_includes_default_platform_sitemap(self):
        body = self._get_robots()
        self.assertIn('User-agent: *', body)
        self.assertIn('Allow: /', body)
        self.assertIn('Disallow: /admin/', body)
        self.assertIn('Disallow: /preview/', body)
        self.assertIn('Sitemap: https://saas.fastvistos.com.br/sitemap.xml', body)

    def test_robots_txt_includes_custom_domain_sitemap(self):
        self.project_a.seo_settings.canonical_domain_override = 'https://meusite.com'
        self.project_a.seo_settings.save()

        body = self._get_robots()
        self.assertIn('Sitemap: https://meusite.com/sitemap.xml', body)

    def test_robots_txt_lists_all_tenants_even_with_authenticated_tenant_in_threadlocal(self):
        """Reproduz a sessão de um dono de tenant logado — o robots.txt não
        pode enxergar só o próprio tenant."""
        self.project_a.seo_settings.canonical_domain_override = 'https://meusite-a.com'
        self.project_a.seo_settings.save()
        self.project_b.seo_settings.canonical_domain_override = 'https://meusite-b.com'
        self.project_b.seo_settings.save()

        set_current_client(self.tenant_a)
        try:
            body = self._get_robots()
        finally:
            clear_current_client()

        self.assertIn('Sitemap: https://meusite-a.com/sitemap.xml', body)
        self.assertIn('Sitemap: https://meusite-b.com/sitemap.xml', body)

    def test_robots_txt_excludes_soft_deleted_projects_domain(self):
        self.project_b.seo_settings.canonical_domain_override = 'https://meusite-b.com'
        self.project_b.seo_settings.save()
        self.project_b.delete()  # SoftDeletableModel: is_removed=True, não hard delete

        body = self._get_robots()
        self.assertNotIn('Sitemap: https://meusite-b.com/sitemap.xml', body)
