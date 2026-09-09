// get-article-title.js
// Utilitário para buscar metadados do artigo pelo blogArticleId

export async function fetchArticleMeta(articleId) {
  if (!articleId) return null;
  try {
    const res = await fetch(`https://fastvistos.com.br/msitesapp/api/image-editor/articles/${articleId}/meta/`);
    if (!res.ok) {
      console.warn(`Failed to fetch article meta: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching article meta:', err);
    return null;
  }
}

export async function fetchArticleTitle(articleId) {
  const data = await fetchArticleMeta(articleId);
  return data ? (data.title || '') : '';
}
