"""
Semeia os templates OFICIAIS (catálogo global da plataforma). Idempotente:
usa update_or_create por (name, is_official=True), então rodar de novo
atualiza o snapshot em vez de duplicar.

Fase 3: 1 template de exemplo (Advocacia). Expandir o catálogo oficial é
trabalho de conteúdo contínuo — adicione mais entradas aqui conforme forem
autoradas.
"""
from django.core.management.base import BaseCommand

from core.models import Template


def _blk(block_type, **props):
    """Monta um nó de bloco no formato Puck ({type, props}) com um id estável."""
    bid = props.pop('_id', block_type.lower())
    return {'type': block_type, 'props': {'id': bid, **props}}


def _advocacia_snapshot():
    home_blocks = {
        'root': {'props': {}},
        'content': [
            _blk('Hero',
                 title='Defesa jurídica séria, do seu lado',
                 subtitle='Atuação em Direito de Família, Trabalhista e Cível com atendimento próximo e transparente.',
                 ctaText='Fale com um advogado',
                 ctaHref='#contato',
                 align='center'),
            _blk('Sobre', _id='sobre',
                 heading='Sobre o escritório',
                 text='Somos um escritório dedicado a resolver o seu problema com clareza e '
                      'compromisso.\n\nCada caso recebe atenção pessoal — você fala direto com '
                      'quem cuida da sua causa, sem intermediários.',
                 imagePosition='right'),
            _blk('Features', _id='areas',
                 heading='Áreas de atuação',
                 items=[
                     {'title': 'Direito de Família', 'description': 'Divórcio, guarda, pensão e inventário.'},
                     {'title': 'Direito Trabalhista', 'description': 'Rescisões, verbas, acordos e ações.'},
                     {'title': 'Direito Cível', 'description': 'Contratos, cobranças e indenizações.'},
                 ]),
            _blk('Depoimentos', _id='depo',
                 heading='O que dizem nossos clientes',
                 items=[
                     {'quote': 'Resolveram meu caso com rapidez e me mantiveram informado o tempo todo.',
                      'author': '', 'role': 'Cliente'},
                     {'quote': 'Atendimento humano e honesto. Recomendo de olhos fechados.',
                      'author': '', 'role': 'Cliente'},
                 ]),
            _blk('Preco', _id='planos',
                 heading='Como trabalhamos',
                 plans=[
                     {'name': 'Consulta', 'price': 'Sob consulta', 'period': '',
                      'features': [{'text': 'Análise inicial do caso'}, {'text': 'Orientação clara sobre os próximos passos'}],
                      'ctaText': 'Agendar', 'ctaHref': '#contato', 'highlighted': True},
                 ]),
            _blk('Faq', _id='faq',
                 heading='Dúvidas frequentes',
                 items=[
                     {'question': 'A primeira consulta é paga?',
                      'answer': 'Entre em contato para verificar as condições da avaliação inicial do seu caso.'},
                     {'question': 'Vocês atendem online?',
                      'answer': 'Sim, atendemos presencialmente e por videochamada, conforme sua preferência.'},
                 ]),
            _blk('Cta', _id='cta',
                 title='Precisa de orientação jurídica?',
                 subtitle='Conte seu caso e receba um retorno rápido.',
                 ctaText='Falar agora',
                 ctaHref='#contato'),
            _blk('Contato', _id='contato',
                 heading='Fale conosco',
                 phone='', whatsapp='', email='', address='', hours='Seg–Sex, 9h–18h'),
        ],
    }

    return {
        'pages': [
            {
                'title': 'Início',
                'slug': 'index',
                'page_type': 'home',
                'is_home': True,
                'is_published': True,
                'order': 0,
                'blocks': home_blocks,
            },
        ],
        'theme': {
            'colors': {
                'primary': '#1e3a5f',
                'ink': '#1f2937',
                'muted': '#6b7280',
                'canvas': '#ffffff',
                'surface': '#f4f6f8',
                'line': '#e5e7eb',
            },
            'fonts': {'heading': 'Playfair Display', 'body': 'Inter'},
            'radius': '8px',
        },
        'chrome': {
            'header': {
                'logoText': 'Advocacia',
                'links': [
                    {'label': 'Sobre', 'href': '#sobre'},
                    {'label': 'Áreas', 'href': '#areas'},
                    {'label': 'Contato', 'href': '#contato'},
                ],
                'cta': {'label': 'Fale conosco', 'href': '#contato'},
            },
            'footer': {
                'columns': [
                    {'title': 'Atendimento', 'links': [{'label': 'Contato', 'href': '#contato'}]},
                ],
                'copyright': '',
            },
        },
    }


OFFICIAL_TEMPLATES = [
    {
        'name': 'Advocacia',
        'niche': 'Advocacia',
        'description': 'Site institucional para escritórios de advocacia: áreas de '
                       'atuação, sobre, depoimentos, FAQ e contato.',
        'snapshot': _advocacia_snapshot,
    },
]


class Command(BaseCommand):
    help = 'Cria/atualiza os templates oficiais (catálogo global). Idempotente.'

    def handle(self, *args, **options):
        for spec in OFFICIAL_TEMPLATES:
            snapshot = spec['snapshot']() if callable(spec['snapshot']) else spec['snapshot']
            obj, created = Template.objects.update_or_create(
                name=spec['name'],
                is_official=True,
                defaults={
                    'niche': spec['niche'],
                    'description': spec['description'],
                    'owner_client': None,
                    'snapshot': snapshot,
                },
            )
            verb = 'criado' if created else 'atualizado'
            self.stdout.write(self.style.SUCCESS(f'✅ Template oficial "{obj.name}" {verb}.'))
