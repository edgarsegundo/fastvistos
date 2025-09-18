// FastVistos FAQ Configuration
export const faqData = [
    {
        question: 'Quanto ...?',
        answer: 'O processo ....',
    },
];

export function formatAnswerForDisplay(answer) {
    return answer.replace(/\n/g, '<br>');
}
