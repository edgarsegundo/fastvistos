"""Schemas formais para `PageSeoSettings.type_specific_data`, um por
`page_type` que gera JSON-LD extra além do básico (WebSite/Organization/
WebPage/Breadcrumb).

Cada dataclass define:
- `from_dict(data)` — parsing **tolerante**: nunca levanta exceção,
  chaves ausentes/malformadas viram default vazio. Isso é o que permite
  a "migração suave" — dado salvo antes desta mudança (JSON livre,
  potencialmente com chaves faltando) continua resolvendo sem quebrar
  `resolve_seo()`.
- `to_dict()` — forma canônica, é o que volta pro dict resolvido por
  `resolve_seo()` e chega no Astro.
- `SCHEMA` — schema no dialeto do `django-jsonform` (aceita `keys` como
  sinônimo de `properties`), usado pelo admin pra renderizar campos reais
  em vez de um textarea de JSON cru.

De propósito, nenhum campo é marcado `required` no `SCHEMA`: a filosofia
do produto (ver `_seo_checklist_html()` em `core/admin.py`) é orientar,
nunca bloquear salvamento — um schema com `required` faria o
`django-jsonform` recusar salvar a página com uma `ValidationError` do
form, quebrando essa filosofia.
"""

from dataclasses import asdict, dataclass, field
from typing import ClassVar, Optional


def _str(data: dict, key: str, default: str = '') -> str:
    value = data.get(key, default) if isinstance(data, dict) else default
    return value if isinstance(value, str) else default


def _optional_float(data: dict, key: str) -> Optional[float]:
    value = data.get(key) if isinstance(data, dict) else None
    if value is None or value == '':
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _optional_int(data: dict, key: str) -> Optional[int]:
    value = data.get(key) if isinstance(data, dict) else None
    if value is None or value == '':
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _str_list(data: dict, key: str) -> list:
    raw = data.get(key) if isinstance(data, dict) else None
    if not isinstance(raw, list):
        return []
    return [item for item in raw if isinstance(item, str)]


@dataclass
class LocalBusinessAddress:
    street_address: str = ''
    address_locality: str = ''
    address_region: str = ''
    postal_code: str = ''
    address_country: str = ''

    @classmethod
    def from_dict(cls, data: dict) -> 'LocalBusinessAddress':
        data = data if isinstance(data, dict) else {}
        return cls(
            street_address=_str(data, 'streetAddress'),
            address_locality=_str(data, 'addressLocality'),
            address_region=_str(data, 'addressRegion'),
            postal_code=_str(data, 'postalCode'),
            address_country=_str(data, 'addressCountry'),
        )

    def to_dict(self) -> dict:
        return {
            'streetAddress': self.street_address,
            'addressLocality': self.address_locality,
            'addressRegion': self.address_region,
            'postalCode': self.postal_code,
            'addressCountry': self.address_country,
        }

    def is_empty(self) -> bool:
        return not any(self.to_dict().values())


@dataclass
class LocalBusinessData:
    """page_type=contact — alimenta JsonLdLocalBusinessBlock.astro.

    Mesmas chaves já usadas hoje por convenção (ver
    core/views.py::debug_fill_seo_fake_data) — formalizar aqui não muda o
    contrato com o componente Astro existente.
    """
    phone: str = ''
    opening_hours: str = ''
    address: LocalBusinessAddress = field(default_factory=LocalBusinessAddress)

    @classmethod
    def from_dict(cls, data: dict) -> 'LocalBusinessData':
        data = data if isinstance(data, dict) else {}
        return cls(
            phone=_str(data, 'phone'),
            opening_hours=_str(data, 'opening_hours'),
            address=LocalBusinessAddress.from_dict(data.get('address')),
        )

    def to_dict(self) -> dict:
        result = {'phone': self.phone, 'opening_hours': self.opening_hours}
        if not self.address.is_empty():
            result['address'] = self.address.to_dict()
        return result

    SCHEMA: ClassVar[dict] = {
        'type': 'object',
        'keys': {
            'phone': {'type': 'string', 'title': 'Telefone'},
            'opening_hours': {
                'type': 'string',
                'title': 'Horário de funcionamento',
                'help_text': 'ex: "Mo-Fr 09:00-18:00" (formato schema.org)',
            },
            'address': {
                'type': 'object',
                'title': 'Endereço',
                'keys': {
                    'streetAddress': {'type': 'string', 'title': 'Rua/número'},
                    'addressLocality': {'type': 'string', 'title': 'Cidade'},
                    'addressRegion': {'type': 'string', 'title': 'Estado (UF)'},
                    'postalCode': {'type': 'string', 'title': 'CEP'},
                    'addressCountry': {'type': 'string', 'title': 'País (ex: BR)'},
                },
            },
        },
    }


@dataclass
class BlogPostingData:
    """page_type=blog_post — alimenta JsonLdBlogPostBlock.astro.

    Mesmas chaves já usadas hoje por convenção — formalizar aqui não
    muda o contrato com o componente Astro existente.
    """
    published_at: str = ''
    author_override: str = ''

    @classmethod
    def from_dict(cls, data: dict) -> 'BlogPostingData':
        data = data if isinstance(data, dict) else {}
        return cls(
            published_at=_str(data, 'published_at'),
            author_override=_str(data, 'author_override'),
        )

    def to_dict(self) -> dict:
        return {
            'published_at': self.published_at,
            'author_override': self.author_override,
        }

    SCHEMA: ClassVar[dict] = {
        'type': 'object',
        'keys': {
            'published_at': {
                'type': 'string',
                'title': 'Data de publicação',
                'help_text': 'formato ISO 8601, ex: 2026-07-24',
            },
            'author_override': {
                'type': 'string',
                'title': 'Autor (sobrescreve o autor padrão do projeto)',
            },
        },
    }


@dataclass
class FaqItem:
    question: str = ''
    answer: str = ''


@dataclass
class FaqPageData:
    """page_type=faq — alimenta JsonLdFaqBlock.astro (schema.org FAQPage)."""
    questions: list = field(default_factory=list)  # list[FaqItem]

    @classmethod
    def from_dict(cls, data: dict) -> 'FaqPageData':
        data = data if isinstance(data, dict) else {}
        raw_questions = data.get('questions')
        items = []
        if isinstance(raw_questions, list):
            for entry in raw_questions:
                if isinstance(entry, dict):
                    items.append(FaqItem(
                        question=_str(entry, 'question'),
                        answer=_str(entry, 'answer'),
                    ))
        return cls(questions=items)

    def to_dict(self) -> dict:
        return {'questions': [asdict(item) for item in self.questions]}

    SCHEMA: ClassVar[dict] = {
        'type': 'object',
        'keys': {
            'questions': {
                'type': 'array',
                'title': 'Perguntas frequentes',
                'items': {
                    'type': 'object',
                    'keys': {
                        'question': {'type': 'string', 'title': 'Pergunta'},
                        'answer': {
                            'type': 'string',
                            'title': 'Resposta',
                            'widget': 'textarea',
                        },
                    },
                },
            },
        },
    }


@dataclass
class PersonData:
    """page_type=person — alimenta JsonLdPersonBlock.astro (schema.org Person)."""
    name: str = ''
    job_title: str = ''
    image_url: str = ''
    same_as: list = field(default_factory=list)  # list[str]

    @classmethod
    def from_dict(cls, data: dict) -> 'PersonData':
        data = data if isinstance(data, dict) else {}
        return cls(
            name=_str(data, 'name'),
            job_title=_str(data, 'job_title'),
            image_url=_str(data, 'image_url'),
            same_as=_str_list(data, 'same_as'),
        )

    def to_dict(self) -> dict:
        return {
            'name': self.name,
            'job_title': self.job_title,
            'image_url': self.image_url,
            'same_as': self.same_as,
        }

    SCHEMA: ClassVar[dict] = {
        'type': 'object',
        'keys': {
            'name': {'type': 'string', 'title': 'Nome'},
            'job_title': {'type': 'string', 'title': 'Cargo/função'},
            'image_url': {'type': 'string', 'title': 'URL da foto', 'format': 'uri'},
            'same_as': {
                'type': 'array',
                'title': 'Perfis/redes sociais (URLs)',
                'items': {'type': 'string', 'format': 'uri'},
            },
        },
    }


@dataclass
class ProductData:
    """page_type=product — alimenta JsonLdProductBlock.astro (schema.org Product)."""
    name: str = ''
    price: str = ''
    currency: str = ''
    availability: str = ''
    image_url: str = ''
    rating: Optional[float] = None
    review_count: Optional[int] = None

    @classmethod
    def from_dict(cls, data: dict) -> 'ProductData':
        data = data if isinstance(data, dict) else {}
        return cls(
            name=_str(data, 'name'),
            price=_str(data, 'price'),
            currency=_str(data, 'currency'),
            availability=_str(data, 'availability'),
            image_url=_str(data, 'image_url'),
            rating=_optional_float(data, 'rating'),
            review_count=_optional_int(data, 'review_count'),
        )

    def to_dict(self) -> dict:
        return {
            'name': self.name,
            'price': self.price,
            'currency': self.currency,
            'availability': self.availability,
            'image_url': self.image_url,
            'rating': self.rating,
            'review_count': self.review_count,
        }

    SCHEMA: ClassVar[dict] = {
        'type': 'object',
        'keys': {
            'name': {'type': 'string', 'title': 'Nome do produto'},
            'price': {'type': 'string', 'title': 'Preço', 'help_text': 'ex: "199.90"'},
            'currency': {
                'type': 'string',
                'title': 'Moeda',
                'choices': ['BRL', 'USD', 'EUR'],
                'default': 'BRL',
            },
            'availability': {
                'type': 'string',
                'title': 'Disponibilidade',
                'choices': ['InStock', 'OutOfStock', 'PreOrder'],
            },
            'image_url': {'type': 'string', 'title': 'URL da imagem', 'format': 'uri'},
            'rating': {'type': 'number', 'title': 'Nota média (opcional)'},
            'review_count': {'type': 'number', 'title': 'Número de avaliações (opcional)'},
        },
    }


@dataclass
class ArticleData:
    """page_type=article — alimenta JsonLdArticleBlock.astro (schema.org Article)."""
    headline: str = ''
    author: str = ''
    published_at: str = ''
    image_url: str = ''

    @classmethod
    def from_dict(cls, data: dict) -> 'ArticleData':
        data = data if isinstance(data, dict) else {}
        return cls(
            headline=_str(data, 'headline'),
            author=_str(data, 'author'),
            published_at=_str(data, 'published_at'),
            image_url=_str(data, 'image_url'),
        )

    def to_dict(self) -> dict:
        return {
            'headline': self.headline,
            'author': self.author,
            'published_at': self.published_at,
            'image_url': self.image_url,
        }

    SCHEMA: ClassVar[dict] = {
        'type': 'object',
        'keys': {
            'headline': {'type': 'string', 'title': 'Título do artigo'},
            'author': {'type': 'string', 'title': 'Autor'},
            'published_at': {
                'type': 'string',
                'title': 'Data de publicação',
                'help_text': 'formato ISO 8601, ex: 2026-07-24',
            },
            'image_url': {'type': 'string', 'title': 'URL da imagem', 'format': 'uri'},
        },
    }


# Mapeia page_type (string, sem importar core.models pra evitar
# acoplamento circular) -> dataclass de schema. Um teste em
# core/tests/test_seo_schemas.py garante que estas chaves batem com
# Page.PAGE_TYPE_CHOICES.
PAGE_TYPE_SCHEMAS = {
    'contact': LocalBusinessData,
    'blog_post': BlogPostingData,
    'faq': FaqPageData,
    'person': PersonData,
    'product': ProductData,
    'article': ArticleData,
}
