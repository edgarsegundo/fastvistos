from django.test import TestCase

from core.models import PlatformSeoDefaults, Project, Page
from core.seo import resolve_seo
from tenancy.models import Client


class ResolveSeoTestCase(TestCase):
    def setUp(self):
        self.tenant = Client.objects.create(name='Acme', slug='acme')
        self.project = Project.objects.create(
            client=self.tenant, name='Site X', slug='site-x'
        )
        self.page = Page.objects.create(
            client=self.tenant, project=self.project, title='Contato', slug='contato'
        )

    def test_page_defines_everything_wins(self):
        self.page.seo_settings.seo_title = 'Título da Página'
        self.page.seo_settings.seo_description = 'Descrição da página'
        self.page.seo_settings.og_image_override = 'https://example.com/page.png'
        self.page.seo_settings.save()

        self.project.seo_settings.og_image_url = 'https://example.com/project.png'
        self.project.seo_settings.save()

        platform = PlatformSeoDefaults.load()
        platform.default_og_image_url = 'https://example.com/platform.png'
        platform.save()

        data = resolve_seo(self.page)
        self.assertEqual(data['title'], 'Título da Página')
        self.assertEqual(data['description'], 'Descrição da página')
        self.assertEqual(data['og_image'], 'https://example.com/page.png')

    def test_page_empty_falls_back_to_project(self):
        self.project.seo_settings.og_image_url = 'https://example.com/project.png'
        self.project.seo_settings.author_name = 'Autor do Projeto'
        self.project.seo_settings.save()

        data = resolve_seo(self.page)
        self.assertEqual(data['og_image'], 'https://example.com/project.png')
        self.assertEqual(data['author_name'], 'Autor do Projeto')
        # Sem seo_title definido, cai no título da própria página
        self.assertEqual(data['title'], 'Contato')

    def test_project_empty_falls_back_to_platform(self):
        platform = PlatformSeoDefaults.load()
        platform.default_og_image_url = 'https://example.com/platform.png'
        platform.default_author_name = 'Autor da Plataforma'
        platform.organization_name = 'Plataforma Org'
        platform.save()

        data = resolve_seo(self.page)
        self.assertEqual(data['og_image'], 'https://example.com/platform.png')
        self.assertEqual(data['author_name'], 'Autor da Plataforma')
        self.assertEqual(data['organization_name'], 'Plataforma Org')

    def test_platform_empty_uses_hardcoded_fallback(self):
        data = resolve_seo(self.page)
        self.assertEqual(data['title'], 'Contato')
        self.assertEqual(data['description'], '')
        self.assertEqual(data['og_image'], '')
        # organization_name cai pro nome do Project quando nada mais define
        self.assertEqual(data['organization_name'], 'Site X')

    def test_canonical_built_from_project_and_page_slug(self):
        data = resolve_seo(self.page)
        self.assertTrue(data['canonical'].endswith('/app/site-x/contato/'))

    def test_canonical_home_page_has_no_slug_segment(self):
        self.page.is_home = True
        self.page.save()
        data = resolve_seo(self.page)
        self.assertTrue(data['canonical'].endswith('/app/site-x/'))
        self.assertFalse(data['canonical'].endswith('/contato/'))

    def test_title_suffix_applied_when_page_title_not_set(self):
        self.project.seo_settings.default_title_suffix = ' | Acme'
        self.project.seo_settings.save()
        data = resolve_seo(self.page)
        self.assertEqual(data['title'], 'Contato | Acme')

    def test_site_url_is_project_root_not_page_url(self):
        data = resolve_seo(self.page)
        self.assertTrue(data['site_url'].endswith('/app/site-x/'))
        self.assertNotIn('contato', data['site_url'])

    def test_canonical_domain_override_replaces_platform_base_and_app_prefix(self):
        """canonical_domain_override existe pra domínio customizado — o
        site_url resultante não deve ter o segmento /app/{slug}/ (a raiz
        do domínio customizado já É a raiz do projeto)."""
        self.project.seo_settings.canonical_domain_override = 'https://meusite.com.br'
        self.project.seo_settings.save()

        data = resolve_seo(self.page)
        self.assertEqual(data['site_url'], 'https://meusite.com.br/')
        self.assertEqual(data['canonical'], 'https://meusite.com.br/contato/')
        self.assertNotIn('/app/', data['canonical'])

    def test_page_canonical_override_does_not_corrupt_site_url(self):
        """Um canonical_override de página (ex: apontando pra outro
        domínio) não deve afetar site_url, que é derivado independentemente
        a partir do projeto — não de um regex sobre o canonical final."""
        self.page.seo_settings.canonical_override = 'https://outrodominio.com.br/pagina-especial/'
        self.page.seo_settings.save()

        data = resolve_seo(self.page)
        self.assertEqual(data['canonical'], 'https://outrodominio.com.br/pagina-especial/')
        self.assertTrue(data['site_url'].endswith('/app/site-x/'))
