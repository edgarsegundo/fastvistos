import { extract } from '@extractus/article-extractor';
const article = await extract('https://g1.globo.com/turismo-e-viagem/noticia/2025/09/19/visto-americano-nova-regra-entrevista-presencial.ghtml');
console.log(article.content);  // article body text + HTML
