from django.test import TestCase, RequestFactory

from core.models import Project, Page
from core.views import project_llms_txt
from tenancy.models import Client
from tenancy.threadlocal import set_current_client, clear_current_client


class ProjectLlmsTxtTestCase(TestCase):
    """/app/<slug>/llms.txt é por-projeto, mas mesmo raciocínio de manager
    de core.tests.test_sitemap/test_robots: precisa continuar respondendo
    corretamente mesmo quando a requisição é de um usuário autenticado com
    um client corrente no threadlocal diferente do dono do projeto."""

    def setUp(self):
        self.tenant_a = Client.objects.create(name='Tenant A', slug='tenant-a')
        self.tenant_b = Client.objects.create(name='Tenant B', slug='tenant-b')

        self.project_a = Project.objects.create(
            client=self.tenant_a, name='Site A', slug='site-a', is_published=True
        )
        self.home_a = Page.objects.create(
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

    def _get_llms_txt(self, slug):
        request = RequestFactory().get(f'/app/{slug}/llms.txt')
        return project_llms_txt(request, slug)

    def test_404_for_unknown_project(self):
        response = self._get_llms_txt('does-not-exist')
        self.assertEqual(response.status_code, 404)

    def test_404_for_unpublished_project(self):
        self.project_a.is_published = False
        self.project_a.save()

        response = self._get_llms_txt('site-a')
        self.assertEqual(response.status_code, 404)

    def test_lists_only_pages_from_requested_project(self):
        page_b2 = Page.objects.create(
            client=self.tenant_b, project=self.project_b, title='Sobre B',
            slug='sobre', is_published=True,
        )

        response = self._get_llms_txt('site-b')
        body = response.content.decode()

        self.assertIn('Home B', body)
        self.assertIn(page_b2.title, body)
        self.assertNotIn('Home A', body)

    def test_does_not_404_falsely_for_other_tenant_with_authenticated_client_in_threadlocal(self):
        """Reproduz a sessão de um dono de tenant logado (client A) pedindo
        o llms.txt do projeto de OUTRO tenant (B) — precisa continuar
        respondendo normalmente, não 404."""
        set_current_client(self.tenant_a)
        try:
            response = self._get_llms_txt('site-b')
        finally:
            clear_current_client()

        self.assertEqual(response.status_code, 200)
        self.assertIn('Home B', response.content.decode())

    def test_excludes_noindex_pages(self):
        page = Page.objects.create(
            client=self.tenant_a, project=self.project_a, title='Privada',
            slug='privada', is_published=True,
        )
        page.seo_settings.noindex = True
        page.seo_settings.save()

        body = self._get_llms_txt('site-a').content.decode()
        self.assertNotIn('Privada', body)

    def test_excludes_soft_deleted_pages(self):
        page = Page.objects.create(
            client=self.tenant_a, project=self.project_a, title='Removida',
            slug='removida', is_published=True,
        )
        page.delete()  # SoftDeletableModel: is_removed=True, não hard delete

        body = self._get_llms_txt('site-a').content.decode()
        self.assertNotIn('Removida', body)

    def test_404_for_soft_deleted_project(self):
        self.project_a.delete()  # SoftDeletableModel: is_removed=True

        response = self._get_llms_txt('site-a')
        self.assertEqual(response.status_code, 404)

    def test_uses_llms_summary_when_set(self):
        self.project_a.seo_settings.llms_summary = 'Resumo dedicado do projeto A.'
        self.project_a.seo_settings.save()

        body = self._get_llms_txt('site-a').content.decode()
        self.assertIn('Resumo dedicado do projeto A.', body)

    def test_falls_back_to_home_page_description_when_llms_summary_empty(self):
        self.home_a.seo_settings.seo_description = 'Descrição SEO da home A.'
        self.home_a.seo_settings.save()

        body = self._get_llms_txt('site-a').content.decode()
        self.assertIn('Descrição SEO da home A.', body)

    def test_omits_description_line_when_both_empty(self):
        body = self._get_llms_txt('site-a').content.decode()

        lines = body.splitlines()
        self.assertEqual(lines[0], '# Site A')
        self.assertEqual(lines[1], '')
        self.assertEqual(lines[2], '## Páginas')

    def test_page_without_seo_description_omits_trailing_colon(self):
        body = self._get_llms_txt('site-a').content.decode()
        self.assertIn('[Home A](', body)
        self.assertNotIn('Home A):', body)

    def test_organization_name_falls_back_to_project_name(self):
        body = self._get_llms_txt('site-a').content.decode()
        self.assertIn('# Site A', body)
