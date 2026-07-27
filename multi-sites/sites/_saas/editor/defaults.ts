/*
 * Conteúdo placeholder por bloco — o que o Puck insere ao adicionar um bloco
 * novo do catálogo. Dá um ponto de partida visível (não campos vazios) que o
 * usuário edita por cima. Deve casar com os tipos em blocks/types.ts.
 */
export const EDITOR_DEFAULT_PROPS: Record<string, any> = {
    Hero: {
        layout: 'centered',
        eyebrow: 'Sua categoria em uma linha',
        title: 'Seu título aqui',
        subtitle: 'Um subtítulo curto que explica o que você faz.',
        align: 'center',
        // Centralizado completo (paridade s1) — toggles ligados por padrão
        showEyebrow: 'yes',
        showSubtitle: 'yes',
        showBadge: 'yes',
        showHelper: 'yes',
        showRating: 'yes',
        showTrust: 'yes',
        announcementBadge: { tag: 'NOVO', label: 'Novidade recém-lançada', href: '#' },
        heroVisual: { imageUrl: '', position: 'none' },
        ctas: [
            { label: 'Comece agora', href: '#contato', variant: 'primary' },
            { label: 'Saiba mais', href: '#sobre', variant: 'outline' },
        ],
        helperText: 'Sem compromisso · cancele quando quiser',
        rating: { value: '4.9', count: '1.200' },
        trustBar: [{ text: 'Empresa A' }, { text: 'Empresa B' }, { text: 'Empresa C' }],
        socialProofOrder: 'rating-first',
        // legados (retrocompat com Heroes antigos)
        ctaText: 'Fale conosco',
        ctaHref: '#contato',
        // placeholders das outras variantes (aparecem ao trocar o Layout)
        bigWord: 'GRANDE',
        accentWord: 'IDEIA.',
        caption: 'Uma frase curta de apoio ao conceito.',
        avatars: [
            { imageUrl: '', alt: 'Cliente' },
            { imageUrl: '', alt: 'Cliente' },
            { imageUrl: '', alt: 'Cliente' },
        ],
        ratingValue: '4.9',
        ratingCount: '1.200',
        plan: {
            name: 'Plano',
            price: 'R$ 0',
            period: 'à vista',
            features: [{ text: 'Item incluído' }, { text: 'Outro item' }],
            ctaText: 'Assinar',
            ctaHref: '#',
        },
    },
    Features: {
        heading: 'O que oferecemos',
        items: [
            { title: 'Serviço 1', description: 'Descrição do serviço.' },
            { title: 'Serviço 2', description: 'Descrição do serviço.' },
            { title: 'Serviço 3', description: 'Descrição do serviço.' },
        ],
    },
    Sobre: {
        heading: 'Quem somos',
        text: 'Conte a história do seu negócio aqui.\n\nUm segundo parágrafo com mais detalhes.',
        imagePosition: 'right',
    },
    Depoimentos: {
        heading: 'O que dizem nossos clientes',
        items: [{ quote: 'Excelente atendimento!', author: 'Cliente', role: '' }],
    },
    Preco: {
        heading: 'Planos',
        plans: [
            {
                name: 'Plano',
                price: 'R$0',
                period: 'mês',
                features: [{ text: 'Item incluído' }, { text: 'Outro item' }],
                ctaText: 'Assinar',
                ctaHref: '#',
                highlighted: false,
            },
        ],
    },
    Faq: {
        heading: 'Perguntas frequentes',
        items: [{ question: 'Uma pergunta comum?', answer: 'A resposta clara e direta.' }],
    },
    Cta: {
        title: 'Pronto para começar?',
        subtitle: 'Fale com a gente hoje mesmo.',
        ctaText: 'Entrar em contato',
        ctaHref: '#contato',
    },
    Contato: {
        heading: 'Contato',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        hours: '',
    },
    RichText: { markdown: '## Título\n\nEscreva em **markdown** aqui.' },
    HtmlSafe: { html: '<p>Cole seu HTML (sem JavaScript) aqui.</p>' },
    CodeEmbed: { html: '<div>Cole HTML + CSS + JS aqui.</div>', minHeight: 400 },
};
