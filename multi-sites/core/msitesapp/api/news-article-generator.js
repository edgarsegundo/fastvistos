export async function reescreverArtigo(openai, textoArtigo1, textoArtigo2) {
  try {
    // return "reescreverArtigo test text";
      const prompt = `
Você é um assistente especialista em criar artigos informativos e originais, com estilo envolvente e linguagem natural. Sua tarefa é gerar conteúdo que **combine e transforme informações de múltiplos artigos**, criando um artigo novo, coeso e pronto para publicação.

TAREFA AVANÇADA:
1. **Mescle informações de todos os artigos fornecidos** (mínimo 2), combinando, omitindo ou reorganizando tópicos para criar um fluxo lógico próprio.
2. **Crie novos títulos e subtítulos** quando necessário, evitando qualquer sequência do texto original.
3. **Reescreva completamente frases, expressões e parágrafos**, mantendo o sentido, mas garantindo que o estilo e a estrutura sejam únicos.
4. **Adicione exemplos genéricos, analogias ou explicações** quando apropriado, para tornar o texto mais original e informativo.
5. **Omitir partes repetitivas ou irrelevantes** para melhorar a fluidez e evitar copiar diretamente os textos originais.
6. **O artigo final deve ser em Markdown**, pronto para publicação, com subtítulos claros, listas ou destaques se necessário.

REGRAS IMPORTANTES:
- Não invente fatos novos.
- Não inclua nomes de pessoas, empresas, marcas, links, contatos ou propagandas.
- Use linguagem natural, fluida e envolvente, evitando tom robótico ou mecânico.
- Preserve o significado e as informações principais, mas não copie trechos literais.
- O resultado deve parecer completamente original, mesmo que baseado nos artigos fornecidos.

ARTIGOS ORIGINAIS:
"""
Artigo 1:
${textoArtigo1}

Artigo 2:
${textoArtigo2}
"""

INSTRUÇÃO DE SAÍDA:
Retorne APENAS um objeto JSON válido, sem blocos de código markdown (sem \`\`\`json), sem backticks extras, sem formatação adicional.

O conteúdo do artigo (markdownText) DEVE ser escrito em formato Markdown (com # para títulos, ## para subtítulos, listas, etc.).

O JSON de resposta deve estar exatamente neste formato:

{"title": "Título do artigo", "seoMetaDescription": "Descrição otimizada para SEO", "markdownText": "# Título\n\n## Subtítulo\n\nTexto do artigo em Markdown..."}

IMPORTANTE: 
- Retorne SOMENTE o objeto JSON puro, começando com { e terminando com }.
- NÃO adicione \`\`\`json ou qualquer outra marcação ao redor do JSON.
- O markdownText DEVE conter o artigo formatado em Markdown (com #, ##, listas, etc.).

CERTIFICAÇÕES:
* \`seoMetaDescription\` deve ser curta, atraente e otimizada para SEO.
* A saída JSON deve ser válida, sem erros de formatação.
* Nenhum conteúdo deve conter nomes, empresas, links ou propagandas.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let artigoReescrito = response.choices[0].message.content;

    console.log('🛑🛑🛑 Artigo Reescrito Raw:', artigoReescrito);

    // Tenta extrair JSON de múltiplas formas (mais robusto)
    let jsonString = artigoReescrito.trim();

    // 1. Tenta detectar se está dentro de bloco de código markdown (```json...```)
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
      console.log('✅ JSON extraído de bloco de código markdown');
    }

    // 2. Se ainda tiver texto antes/depois do JSON, tenta encontrar apenas o objeto
    const jsonObjectMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch && jsonObjectMatch[0].length < jsonString.length) {
      jsonString = jsonObjectMatch[0];
      console.log('✅ JSON extraído usando regex de objeto');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
      console.log('✅ JSON parseado com sucesso');
    } catch (e) {
      console.error("❌ Erro ao fazer parse do JSON retornado pelo GPT:", e);
      console.error("JSON extraído (primeiros 500 chars):\n", jsonString.substring(0, 500));
      console.error("Conteúdo original (primeiros 500 chars):\n", artigoReescrito.substring(0, 500));
      return null;
    }

    // Valida que o objeto tem as propriedades esperadas
    if (!parsed.title || !parsed.seoMetaDescription || !parsed.markdownText) {
      console.error("❌ JSON parseado não contém as propriedades esperadas:", Object.keys(parsed));
      console.error("Objeto recebido:", parsed);
      return null;
    }

    // Retorna os dados extraídos (markdownText já vem com \n correto do JSON)
    return {
      title: parsed.title,
      seoMetaDescription: parsed.seoMetaDescription,
      markdownText: parsed.markdownText
    };
  } catch (error) {
    console.error("❌ Erro ao reescrever o artigo:", error);
    return null;
  }
}
