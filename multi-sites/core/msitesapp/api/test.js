import slugify from 'slugify';
const title = 'Isenção de Visto para Turistas: O Impacto da Nova Proposta na Indústria do Turismo Brasileiro';
console.log(slugify(title, { lower: true, strict: true, locale: 'pt' }));

