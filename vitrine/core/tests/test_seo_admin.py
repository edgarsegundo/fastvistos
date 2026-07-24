import json

from django.contrib import admin as django_admin
from django.core.files.uploadedfile import SimpleUploadedFile
from django.http import Http404
from django.test import Client as HttpClient
from django.test import RequestFactory, TestCase
from django_jsonform.forms.fields import JSONFormField

from core.admin import MAX_FAQ_QUESTIONS_PER_IMPORT, PageAdmin, PageSeoSettingsInlineForm
from core.models import ClientUser, Page, Project
from core.seo_schemas import FaqPageData
from tenancy.models import Client
from tenancy.threadlocal import clear_current_client, set_current_client


class PageSeoSettingsInlineFormTestCase(TestCase):
    def setUp(self):
        self.tenant = Client.objects.create(name='Acme', slug='acme')
        self.project = Project.objects.create(
            client=self.tenant, name='Site X', slug='site-x'
        )

    def _make_page(self, page_type):
        return Page.objects.create(
            client=self.tenant, project=self.project, title='Página', slug='pagina',
            page_type=page_type,
        )

    def test_page_type_with_schema_gets_jsonform_field(self):
        page = self._make_page('faq')
        form = PageSeoSettingsInlineForm(instance=page.seo_settings)
        self.assertIsInstance(form.fields['type_specific_data'], JSONFormField)
        self.assertEqual(form.fields['type_specific_data'].widget.get_schema(), FaqPageData.SCHEMA)

    def test_page_type_without_schema_keeps_default_field(self):
        page = self._make_page('generic')
        form = PageSeoSettingsInlineForm(instance=page.seo_settings)
        self.assertNotIsInstance(form.fields['type_specific_data'], JSONFormField)

    def test_saving_faq_questions_through_form_persists_type_specific_data(self):
        page = self._make_page('faq')
        form = PageSeoSettingsInlineForm(
            data={
                'seo_title': '',
                'seo_description': '',
                'og_image_override': '',
                'canonical_override': '',
                'noindex': False,
                'type_specific_data': '{"questions": [{"question": "Q?", "answer": "A."}]}',
            },
            instance=page.seo_settings,
        )
        self.assertTrue(form.is_valid(), form.errors)
        saved = form.save()
        self.assertEqual(
            saved.type_specific_data,
            {'questions': [{'question': 'Q?', 'answer': 'A.'}]},
        )


class ImportTypeSpecificJsonTestCase(TestCase):
    """PageAdmin.import_type_specific_json — chamado direto via
    RequestFactory (mesmo padrão de core/tests/test_sitemap.py), sem
    passar pelo resolver de URL: o que queremos testar é a lógica de
    parsing/validação, não o CSRF/login do admin_view() (mecanismo
    nativo do Django, já testado pelo próprio framework)."""

    def setUp(self):
        self.tenant = Client.objects.create(name='Acme', slug='acme')
        self.other_tenant = Client.objects.create(name='Other', slug='other')
        self.project = Project.objects.create(
            client=self.tenant, name='Site X', slug='site-x'
        )
        self.page = Page.objects.create(
            client=self.tenant, project=self.project, title='FAQ', slug='faq',
            page_type='faq',
        )
        self.superuser = ClientUser.objects.create_superuser(
            email='admin@example.com', password='x'
        )
        self.factory = RequestFactory()
        self.admin = PageAdmin(Page, django_admin.site)
        set_current_client(self.tenant)
        self.addCleanup(clear_current_client)

    def _post(self, page_id, file_content, user=None):
        upload = SimpleUploadedFile('faq.json', file_content, content_type='application/json')
        request = self.factory.post(
            f'/admin/core/page/{page_id}/import-type-specific-json/',
            {'file': upload},
        )
        request.user = user or self.superuser
        return self.admin.import_type_specific_json(request, page_id)

    def test_bare_list_format_imports_successfully(self):
        payload = b'[{"question": "Q1?", "answer": "A1."}, {"question": "Q2?", "answer": "A2."}]'
        response = self._post(self.page.id, payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'imported')
        self.assertEqual(data['count'], 2)

        self.page.seo_settings.refresh_from_db()
        self.assertEqual(len(self.page.seo_settings.type_specific_data['questions']), 2)

    def test_wrapped_dict_format_imports_successfully(self):
        payload = b'{"questions": [{"question": "Q?", "answer": "A."}]}'
        response = self._post(self.page.id, payload)
        self.assertEqual(response.status_code, 200)

        self.page.seo_settings.refresh_from_db()
        self.assertEqual(
            self.page.seo_settings.type_specific_data,
            {'questions': [{'question': 'Q?', 'answer': 'A.'}]},
        )

    def test_invalid_json_returns_400_and_does_not_overwrite(self):
        self.page.seo_settings.type_specific_data = {
            'questions': [{'question': 'Original', 'answer': 'Mantido'}],
        }
        self.page.seo_settings.save()

        response = self._post(self.page.id, b'isto nao e json')
        self.assertEqual(response.status_code, 400)

        self.page.seo_settings.refresh_from_db()
        self.assertEqual(
            self.page.seo_settings.type_specific_data['questions'][0]['question'],
            'Original',
        )

    def test_no_file_returns_400(self):
        request = self.factory.post(f'/admin/core/page/{self.page.id}/import-type-specific-json/')
        request.user = self.superuser
        response = self.admin.import_type_specific_json(request, self.page.id)
        self.assertEqual(response.status_code, 400)

    def test_wrong_page_type_returns_400(self):
        generic_page = Page.objects.create(
            client=self.tenant, project=self.project, title='Generic', slug='generic',
            page_type='generic',
        )
        response = self._post(generic_page.id, b'[]')
        self.assertEqual(response.status_code, 400)

    def test_too_many_questions_returns_400(self):
        many = [
            {'question': f'Q{i}?', 'answer': 'A.'}
            for i in range(MAX_FAQ_QUESTIONS_PER_IMPORT + 1)
        ]
        response = self._post(self.page.id, json.dumps(many).encode('utf-8'))
        self.assertEqual(response.status_code, 400)

    def test_get_method_not_allowed(self):
        request = self.factory.get(f'/admin/core/page/{self.page.id}/import-type-specific-json/')
        request.user = self.superuser
        response = self.admin.import_type_specific_json(request, self.page.id)
        self.assertEqual(response.status_code, 405)

    def test_cross_tenant_page_raises_404(self):
        """get_queryset() (ClientScopedAdmin) filtra pelo tenant corrente
        no threadlocal — uma Page de outro tenant não pode ser
        encontrada, mesmo sabendo o id."""
        set_current_client(self.other_tenant)
        with self.assertRaises(Http404):
            self._post(self.page.id, b'[]')


class PageChangeViewRenderingTestCase(TestCase):
    """Renderiza a change view real do admin via Client HTTP — pega
    regressões que os testes de unidade acima não pegam. Ex: um bug real
    encontrado nesta sessão — `PageSeoSettingsInline.get_fields`/
    `get_readonly_fields` recebem a `Page` PAI como `obj` (não a
    `PageSeoSettings` do inline, que é o `obj` recebido pelos métodos que
    renderizam campos, tipo `seo_checklist`/`import_faq_json_button`) —
    `obj.page.page_type` levantava AttributeError; o certo é
    `obj.page_type` direto. Só apareceu renderizando a página de verdade,
    não instanciando o form isoladamente."""

    def setUp(self):
        self.tenant = Client.objects.create(name='Acme', slug='acme')
        self.project = Project.objects.create(
            client=self.tenant, name='Site X', slug='site-x'
        )
        self.superuser = ClientUser.objects.create_superuser(
            email='admin@example.com', password='x'
        )
        self.http_client = HttpClient(SERVER_NAME='localhost')
        self.http_client.force_login(self.superuser)
        set_current_client(self.tenant)
        self.addCleanup(clear_current_client)

    def _change_view(self, page):
        return self.http_client.get(
            f'/admin/core/page/{page.id}/change/', SERVER_NAME='localhost'
        )

    def test_faq_page_change_view_renders_import_button(self):
        page = Page.objects.create(
            client=self.tenant, project=self.project, title='FAQ', slug='faq',
            page_type='faq',
        )
        response = self._change_view(page)
        self.assertEqual(response.status_code, 200)
        self.assertIn('import-faq-json-btn', response.content.decode())

    def test_generic_page_change_view_has_no_import_button(self):
        page = Page.objects.create(
            client=self.tenant, project=self.project, title='Generic', slug='generic',
            page_type='generic',
        )
        response = self._change_view(page)
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('import-faq-json-btn', response.content.decode())
