from django.test import TestCase

from core.models import Project, Page
from tenancy.models import Client


class PageTypeSyncTestCase(TestCase):
    """is_home e page_type devem ficar sincronizados: is_home=True implica
    page_type='home'; desmarcar is_home reseta page_type='home' pra
    'generic'. Ver Page.save() e docs/guia-seo-projetos-paginas.md."""

    def setUp(self):
        self.tenant = Client.objects.create(name='Acme', slug='acme')
        self.project = Project.objects.create(
            client=self.tenant, name='Site X', slug='site-x'
        )

    def test_is_home_true_forces_page_type_home(self):
        page = Page.objects.create(
            client=self.tenant, project=self.project, title='Início',
            slug='', is_home=True, page_type=Page.PAGE_TYPE_CONTACT,
        )
        self.assertEqual(page.page_type, Page.PAGE_TYPE_HOME)

    def test_unmarking_is_home_resets_page_type_from_home_to_generic(self):
        page = Page.objects.create(
            client=self.tenant, project=self.project, title='Início',
            slug='', is_home=True,
        )
        self.assertEqual(page.page_type, Page.PAGE_TYPE_HOME)

        page.is_home = False
        page.save()
        self.assertEqual(page.page_type, Page.PAGE_TYPE_GENERIC)

    def test_unmarking_is_home_does_not_touch_explicit_non_home_type(self):
        """Se o page_type não é 'home' quando is_home é desmarcado (ex:
        já era 'contact' antes por algum motivo), não deve ser mexido."""
        page = Page.objects.create(
            client=self.tenant, project=self.project, title='Contato',
            slug='contato', is_home=False, page_type=Page.PAGE_TYPE_CONTACT,
        )
        page.save()
        self.assertEqual(page.page_type, Page.PAGE_TYPE_CONTACT)

    def test_non_home_page_type_untouched(self):
        page = Page.objects.create(
            client=self.tenant, project=self.project, title='Blog',
            slug='blog', page_type=Page.PAGE_TYPE_BLOG_POST,
        )
        self.assertEqual(page.page_type, Page.PAGE_TYPE_BLOG_POST)
