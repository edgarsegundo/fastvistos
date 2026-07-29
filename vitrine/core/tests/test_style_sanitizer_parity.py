"""
Testes de paridade + comportamento da sanitização de "Aparência por elemento"
(vitrine/core/models.py). O objetivo principal (`test_*_parity`) é pegar
divergência entre esta implementação Python (a fronteira de segurança real,
usada por `Page.serialize_blocks_for_api()`) e a fonte TS
(`multi-sites/sites/_saas/blocks/style-registry.ts`) — como Python não
importa TS, a única forma de garantir que as duas listas de propriedades
batem é comparar contra o manifest gerado
(`multi-sites/sites/_saas/blocks/style-manifest.generated.json`, produzido
por `npm run gen:style-manifest`). Se alguém adicionar uma propriedade nova
só de um lado (TS ou Python), estes testes falham.
"""
from django.test import SimpleTestCase

from core.models import (
    STYLE_SANITIZERS,
    _load_style_manifest,
    _sanitize_style_element,
    _STYLE_PROP_VALIDATORS,
)


class StyleManifestParityTestCase(SimpleTestCase):
    def setUp(self):
        self.manifest = _load_style_manifest()

    def test_property_keys_match_ts_registry(self):
        ts_keys = set(self.manifest['propertyKeys'])
        python_keys = set(_STYLE_PROP_VALIDATORS.keys())
        self.assertEqual(
            ts_keys, python_keys,
            "STYLE_PROP_REGISTRY (TS) e _STYLE_PROP_VALIDATORS (Python) divergem — "
            "propriedade adicionada/removida só de um lado. Rode `npm run "
            "gen:style-manifest` se acabou de mexer no TS, ou espelhe a mudança "
            "em core/models.py."
        )

    def test_style_sanitizers_match_manifest_blocks(self):
        self.assertEqual(
            set(STYLE_SANITIZERS.keys()), set(self.manifest['blocks'].keys()),
            "STYLE_SANITIZERS não bate com os blocos do manifest — rode "
            "`npm run gen:style-manifest` depois de registrar `elementStyleField()` "
            "num bloco novo."
        )

    def test_hero_element_map_matches_manifest(self):
        # Confirma que o mapa `<prop>Style -> elementKey` realmente vem do
        # manifest (não de uma lista hardcoded esquecida por aí).
        hero_map = self.manifest['blocks']['Hero']
        sanitizer = STYLE_SANITIZERS['Hero']
        result = sanitizer({'titleStyle': {'title': {'color': '#123456'}}})
        self.assertIn('titleStyle', result)
        self.assertIn(hero_map['titleStyle'], result['titleStyle'])


class SanitizeStyleElementTestCase(SimpleTestCase):
    def test_drops_unknown_keys(self):
        out = _sanitize_style_element({'color': '#ff0000', 'notAProperty': 'x'})
        self.assertEqual(out, {'color': '#ff0000'})

    def test_non_dict_returns_empty(self):
        self.assertEqual(_sanitize_style_element(None), {})
        self.assertEqual(_sanitize_style_element('nope'), {})
        self.assertEqual(_sanitize_style_element(123), {})

    def test_text_transform_valid_values(self):
        for value in ('none', 'uppercase', 'lowercase', 'capitalize'):
            out = _sanitize_style_element({'textTransform': value})
            self.assertEqual(out, {'textTransform': value})

    def test_text_transform_rejects_invalid(self):
        out = _sanitize_style_element({'textTransform': 'sideways'})
        self.assertEqual(out, {})

    def test_align_accepts_justify(self):
        out = _sanitize_style_element({'align': 'justify'})
        self.assertEqual(out, {'align': 'justify'})

    def test_align_rejects_invalid(self):
        out = _sanitize_style_element({'align': 'diagonal'})
        self.assertEqual(out, {})

    def test_paragraph_spacing_accepts_dimension(self):
        for value in ('12px', '1.5rem', '0'):
            out = _sanitize_style_element({'paragraphSpacing': value})
            self.assertEqual(out, {'paragraphSpacing': value})

    def test_paragraph_spacing_rejects_garbage(self):
        out = _sanitize_style_element({'paragraphSpacing': 'not-a-dimension'})
        self.assertEqual(out, {})

    def test_full_valid_payload(self):
        out = _sanitize_style_element({
            'color': '#111827',
            'font': 'Poppins',
            'fontSize': '18px',
            'align': 'justify',
            'textTransform': 'uppercase',
            'paragraphSpacing': '8px',
            'border': {'width': '1px', 'style': 'solid', 'color': '#000000'},
            'css': {'opacity': '0.9'},
            'htmlAttrs': {'id': 'my-el', 'className': 'foo bar'},
        })
        self.assertEqual(out['color'], '#111827')
        self.assertEqual(out['font'], 'Poppins')
        self.assertEqual(out['align'], 'justify')
        self.assertEqual(out['textTransform'], 'uppercase')
        self.assertEqual(out['paragraphSpacing'], '8px')
        self.assertEqual(out['border'], {'width': '1px', 'style': 'solid', 'color': '#000000'})
        self.assertEqual(out['htmlAttrs'], {'id': 'my-el', 'className': 'foo bar'})


class HeroStyleSanitizerTestCase(SimpleTestCase):
    def setUp(self):
        self.sanitize = STYLE_SANITIZERS['Hero']

    def test_removes_prop_when_value_invalid(self):
        result = self.sanitize({'titleStyle': {'title': {'color': 'not-a-hex'}}})
        self.assertEqual(result, {'titleStyle': None})

    def test_ignores_props_not_present(self):
        result = self.sanitize({'titleStyle': {'title': {'color': '#fff'}}})
        self.assertNotIn('subtitleStyle', result)

    def test_preserves_valid_nested_value(self):
        result = self.sanitize({'ctasStyle': {'ctas': {'bgColor': '#2563eb', 'hoverBgColor': '#1d4ed8'}}})
        self.assertEqual(result['ctasStyle'], {'ctas': {'bgColor': '#2563eb', 'hoverBgColor': '#1d4ed8'}})
