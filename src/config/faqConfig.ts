// FAQ Configuration for Fast Vistos
export interface FaqItem {
    question: string;
    answer: string;
}

export const faqData: FaqItem[] = [
    {
        question: 'O valor da assessoria inclui as taxas consulares?',
        answer: 'Não. As taxas consulares são pagas diretamente por você, para garantir sua segurança. Isso garante que você tenha controle total sobre seus pagamentos oficiais e evita qualquer intermediação desnecessária.',
    },
    {
        question: 'Meus dados e documentos estarão seguros?',
        answer: 'Sim. Recebemos seus documentos em endereço comercial, com funcionários treinados e armazenamento seguro. Seguimos rigorosos protocolos de segurança para proteger suas informações pessoais e documentos confidenciais.',
    },
    {
        question: 'Se eu já tiver iniciado o processo, posso contratar a assessoria?',
        answer: 'Sim. Podemos entrar no processo em qualquer etapa, incluindo simulações de entrevista para você se sentir confiante. Nossa experiência nos permite otimizar seu processo em qualquer fase, aumentando suas chances de aprovação.',
    },
    {
        question: 'Posso ser atendido online ou preciso ir ao escritório?',
        answer: 'O atendimento é 100% online por vídeo chamada. No escritório, apenas recebemos documentos. Isso oferece total comodidade e flexibilidade para você, sem necessidade de deslocamento.',
    },
    {
        question: 'Vocês atendem clientes de qualquer cidade ou país?',
        answer: 'Sim. Atendemos todos os consulados do Brasil e clientes no exterior. Como o serviço é online, ajudamos de qualquer lugar do mundo com a mesma qualidade e dedicação.',
    },
    {
        question: 'Qual o horário de atendimento e canais de contato?',
        answer: 'Atendemos de segunda a sexta, das 8h às 17h. Entre em contato pelo WhatsApp, telefone ou e-mail para receber atendimento especializado e personalizado.',
    },
    {
        question: 'Qual a taxa de aprovação média dos vistos?',
        answer: 'Temos 90% de aprovação. Avaliamos seu perfil gratuitamente e só seguimos se as chances forem boas. Nossa experiência nos permite identificar os melhores perfis e estratégias para cada caso.',
    },
    {
        question: 'Por que escolher a Fast Vistos?',
        answer: 'Avaliamos seu perfil sem custo, cuidamos de toda a burocracia e treinamos você para a entrevista consular. Com nossa experiência e 90% de aprovação, você tem a tranquilidade de estar em boas mãos.',
    },
    {
        question: 'Vocês já ajudaram quantos clientes?',
        answer: 'Mais de 300 clientes atendidos e mais de 260 avaliações 5 estrelas no Google. Nossa reputação fala por si só - confira os depoimentos de quem já realizou o sonho de viajar conosco!',
    },
    {
        question: 'Quais serviços de assessoria vocês oferecem?',
        answer: 'Vistos para EUA (B1/B2, F1, ESTA), Canadá (eTA), Índia (eVisa), Nova Zelândia (NZeTA), Passaporte Brasileiro e Visto Mexicano. Somos especialistas em todos os principais destinos!',
    },
    {
        question: 'O que a assessoria inclui?',
        answer: 'Acompanhamento completo do início à aprovação: preenchimento de formulários, agendamento de entrevistas, análise detalhada de documentos, simulação de entrevistas e orientação completa. Você não precisará se preocupar com nada!',
    },
];

// Simple keyword highlighting - much cleaner!
const keyPhrases = [
    '90% de aprovação',
    '100% online',
    'sem custo',
    'mais de 300 clientes',
    'mais de 260 avaliações 5 estrelas',
    'avaliamos seu perfil gratuitamente',
    'acompanhamento completo',
    'segunda a sexta, das 8h às 17h',
    'Sim.',
    'Não.',
];

// Simple formatting function
export function formatAnswerForDisplay(answer: string): string {
    return keyPhrases.reduce(
        (text, phrase) => text.replace(new RegExp(phrase, 'gi'), `<strong>${phrase}</strong>`),
        answer
    );
}
