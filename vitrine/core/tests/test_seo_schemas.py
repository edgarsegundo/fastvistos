from django.test import SimpleTestCase

from core.models import Page
from core.seo_schemas import (
    PAGE_TYPE_SCHEMAS,
    ArticleData,
    BlogPostingData,
    FaqPageData,
    LocalBusinessData,
    PersonData,
    ProductData,
)


class PageTypeSchemasMappingTestCase(SimpleTestCase):
    def test_every_schema_key_is_a_valid_page_type_choice(self):
        valid_page_types = {choice for choice, _label in Page.PAGE_TYPE_CHOICES}
        self.assertTrue(set(PAGE_TYPE_SCHEMAS).issubset(valid_page_types))

    def test_no_schema_marks_a_field_as_required(self):
        """Nenhum SCHEMA pode marcar campo como obrigatório — o
        django-jsonform levantaria ValidationError e bloquearia salvar,
        quebrando a filosofia Yoast (orienta, não bloqueia) já em uso no
        checklist de SEO."""
        for schema_cls in PAGE_TYPE_SCHEMAS.values():
            self._assert_no_required(schema_cls.SCHEMA, schema_cls.__name__)

    def _assert_no_required(self, schema, label):
        if isinstance(schema, dict):
            self.assertNotIn(
                'required', schema,
                f"{label}: SCHEMA não deve marcar 'required' (bloquearia salvar)"
            )
            for value in schema.values():
                self._assert_no_required(value, label)
        elif isinstance(schema, list):
            for value in schema:
                self._assert_no_required(value, label)


class FaqPageDataTestCase(SimpleTestCase):
    def test_from_dict_empty_does_not_raise(self):
        data = FaqPageData.from_dict({})
        self.assertEqual(data.questions, [])

    def test_from_dict_tolerates_malformed_old_data(self):
        """Migração suave: dado antigo (livre, sem esta chave, ou tipo
        errado) não pode quebrar resolve_seo()."""
        data = FaqPageData.from_dict({'questions': 'não é uma lista'})
        self.assertEqual(data.questions, [])

        data = FaqPageData.from_dict({'questions': [{'question': 'Só pergunta, sem resposta'}]})
        self.assertEqual(len(data.questions), 1)
        self.assertEqual(data.questions[0].answer, '')

    def test_roundtrip_preserves_valid_data(self):
        raw = {'questions': [
            {'question': 'Como funciona?', 'answer': 'Assim.'},
            {'question': 'Quanto custa?', 'answer': 'Grátis.'},
        ]}
        result = FaqPageData.from_dict(raw).to_dict()
        self.assertEqual(result, raw)


class PersonDataTestCase(SimpleTestCase):
    def test_from_dict_empty_does_not_raise(self):
        data = PersonData.from_dict({})
        self.assertEqual(data.name, '')
        self.assertEqual(data.same_as, [])

    def test_from_dict_tolerates_malformed_same_as(self):
        data = PersonData.from_dict({'same_as': 'https://exemplo.com'})
        self.assertEqual(data.same_as, [])

    def test_roundtrip_preserves_valid_data(self):
        raw = {
            'name': 'Fulana de Tal',
            'job_title': 'Engenheira',
            'image_url': 'https://example.com/foto.png',
            'same_as': ['https://linkedin.com/in/fulana'],
        }
        self.assertEqual(PersonData.from_dict(raw).to_dict(), raw)


class ProductDataTestCase(SimpleTestCase):
    def test_from_dict_empty_does_not_raise(self):
        data = ProductData.from_dict({})
        self.assertEqual(data.name, '')
        self.assertIsNone(data.rating)
        self.assertIsNone(data.review_count)

    def test_from_dict_tolerates_non_numeric_rating(self):
        data = ProductData.from_dict({'rating': 'não é número', 'review_count': 'nem isso'})
        self.assertIsNone(data.rating)
        self.assertIsNone(data.review_count)

    def test_roundtrip_preserves_valid_data(self):
        raw = {
            'name': 'Produto X',
            'price': '99.90',
            'currency': 'BRL',
            'availability': 'InStock',
            'image_url': 'https://example.com/produto.png',
            'rating': 4.5,
            'review_count': 10,
        }
        self.assertEqual(ProductData.from_dict(raw).to_dict(), raw)


class ArticleDataTestCase(SimpleTestCase):
    def test_from_dict_empty_does_not_raise(self):
        data = ArticleData.from_dict({})
        self.assertEqual(data.headline, '')

    def test_roundtrip_preserves_valid_data(self):
        raw = {
            'headline': 'Manchete',
            'author': 'Autor X',
            'published_at': '2026-01-01',
            'image_url': 'https://example.com/img.png',
        }
        self.assertEqual(ArticleData.from_dict(raw).to_dict(), raw)


class LocalBusinessDataTestCase(SimpleTestCase):
    def test_from_dict_empty_does_not_raise(self):
        data = LocalBusinessData.from_dict({})
        self.assertEqual(data.phone, '')
        self.assertEqual(data.to_dict(), {'phone': '', 'opening_hours': ''})

    def test_roundtrip_preserves_valid_data_including_nested_address(self):
        raw = {
            'phone': '+55 11 90000-0000',
            'opening_hours': 'Mo-Fr 09:00-18:00',
            'address': {
                'streetAddress': 'Rua X, 1',
                'addressLocality': 'São Paulo',
                'addressRegion': 'SP',
                'postalCode': '00000-000',
                'addressCountry': 'BR',
            },
        }
        self.assertEqual(LocalBusinessData.from_dict(raw).to_dict(), raw)

    def test_from_dict_tolerates_missing_address(self):
        data = LocalBusinessData.from_dict({'phone': '123'})
        self.assertEqual(data.to_dict(), {'phone': '123', 'opening_hours': ''})


class BlogPostingDataTestCase(SimpleTestCase):
    def test_from_dict_empty_does_not_raise(self):
        data = BlogPostingData.from_dict({})
        self.assertEqual(data.published_at, '')
        self.assertEqual(data.author_override, '')

    def test_roundtrip_preserves_valid_data(self):
        raw = {'published_at': '2026-01-01', 'author_override': 'Fulano'}
        self.assertEqual(BlogPostingData.from_dict(raw).to_dict(), raw)
