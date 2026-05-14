// get-article-title.js
// Utilitário para buscar o título do artigo pelo blogArticleId

export async function fetchArticleTitle(articleId) {
  if (!articleId) return '';
  try {
    const res = await fetch(`https://fastvistos.com.br/msitesapp/api/image-editor/articles/${articleId}/meta/`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.title || '';
  } catch {
    return '';
  }
}
