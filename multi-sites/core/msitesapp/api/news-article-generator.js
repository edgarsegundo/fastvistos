export async function reescreverArtigo(openai, textoArtigo1, textoArtigo2) {
  try {
    return "reescreverArtigo test text";
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
Gere o artigo completo em **Markdown** e em **formato JSON**, exatamente assim:

\`\`\`json
{
  "title": "Título do artigo",
  "seoMetaDescription": "Descrição otimizada para SEO",
  "markdownText": "Texto completo do artigo em Markdown"
}
\`\`\`

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

    // Extrai o JSON da resposta (caso venha dentro de um bloco de código)
    const jsonMatch = artigoReescrito.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonString = artigoReescrito;
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.error("❌ Erro ao fazer parse do JSON retornado pelo GPT:", e);
      console.error("Conteúdo retornado:\n", artigoReescrito);
      return null;
    }

    try {
      // Converte \n para quebras de linha reais
      const markdownFinal = parsed.markdownText.replace(/\\n/g, "\n");
      return markdownFinal;
    } catch (e) {
      console.error("❌ Erro ao fazer parse do JSON retornado pelo GPT:", e);
      console.error("Conteúdo retornado:\n", artigoReescrito);
      return null;
    }
  } catch (error) {
    console.error("❌ Erro ao reescrever o artigo:", error);
    return null;
  }
}
