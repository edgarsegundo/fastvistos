// FastVistos FAQ Configuration
export const faqData = [
    {
        question: 'Quanto tempo demora para conseguir um visto americano?',
        answer: 'O processo varia de 3 a 8 semanas, dependendo do tipo de visto e da época do ano. Nosso serviço agiliza ao máximo esse processo.',
    },
    {
        question: 'Qual é a taxa de aprovação dos vistos?',
        answer: 'Nossa taxa de aprovação é superior a 95%. Isso se deve ao nosso processo rigoroso de preparação e documentação.',
    },
    {
        question: 'Que tipos de visto vocês ajudam a conseguir?',
        answer: 'Trabalhamos com vistos de turismo (B1/B2), estudante (F1), trabalho (H1B, L1), investidor (E2) e outros tipos específicos.',
    },
    {
        question: 'Preciso falar inglês para a entrevista?',
        answer: 'Não necessariamente. Oferecemos preparação completa incluindo simulação de entrevista e dicas para quem não tem fluência em inglês.',
    },
    {
        question: 'Quanto custa o serviço completo?',
        answer: 'Os valores variam conforme o tipo de visto e complexidade do caso. Entre em contato para uma cotação personalizada.',
    },
    {
        question: 'O que acontece se meu visto for negado?',
        answer: 'Oferecemos análise completa do motivo da negativa e orientação para uma nova solicitação. Em casos específicos, há garantia de reembolso.',
    },
    {
        question: 'Vocês fazem o agendamento da entrevista?',
        answer: 'Sim, cuidamos de todo o processo desde o preenchimento do formulário DS-160 até o agendamento da entrevista no consulado.',
    },
    {
        question: 'Posso aplicar para visto mesmo com negativa anterior?',
        answer: 'Sim! Analisamos cada caso individualmente e desenvolvemos estratégias específicas para superar negativas anteriores.',
    },

    {
        question: 'question test 1?',
        answer: 'answer test 1',
    },



];

export function formatAnswerForDisplay(answer) {
    return answer.replace(/\n/g, '<br>');
}
