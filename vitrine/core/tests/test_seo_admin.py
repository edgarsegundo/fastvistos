from django.test import TestCase
from django_jsonform.forms.fields import JSONFormField

from core.admin import PageSeoSettingsInlineForm
from core.models import Page, Project
from core.seo_schemas import FaqPageData
from tenancy.models import Client


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
