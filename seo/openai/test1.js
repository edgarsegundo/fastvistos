import "dotenv/config"; 
import OpenAI from "openai";
import fs from "fs";

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Erro: a variável de ambiente OPENAI_API_KEY não foi definida.");
  console.error("💡 Dica: defina sua chave com um dos comandos abaixo:");
  console.error("   - Linux/macOS: export OPENAI_API_KEY='sua_chave_aqui'");
  console.error("   - Windows PowerShell: setx OPENAI_API_KEY 'sua_chave_aqui'");
  process.exit(1); // encerra o programa com erro
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // já deve estar configurada
});

async function reescreverArtigo(caminhoArquivoEntrada, caminhoSaida) {

  // Lê múltiplos arquivos de entrada e concatena os textos
  const arquivosEntrada = ["artigo1_original.txt", "artigo2_original.txt"];
  const textos = arquivosEntrada.map((arquivo) => fs.readFileSync(arquivo, "utf8"));
  const textoOriginal = textos.join("\n\n");

  const prompt = `
Você é um assistente especializado em reescrever artigos de forma criativa e natural, mantendo o significado original, mas alterando completamente a redação e a estrutura do texto.  

TAREFA:
Reescreva o artigo abaixo, modificando:
1. A ordem dos tópicos e parágrafos (reorganize o conteúdo para ter um fluxo lógico diferente).  
2. As frases e expressões (parafraseie tudo com linguagem natural e sem plágio).  
3. O estilo do texto (deixe a leitura fluida, envolvente e coerente).  
4. O formato final deve ser **em Markdown**, pronto para publicação.

IMPORTANTE:
- Preserve o sentido e as informações originais.  
- Não copie trechos literais.  
- Não invente fatos novos.  
- Use títulos e subtítulos claros e criativos.  
- Use uma linguagem natural, sem parecer robótica.
- NÃO inclua nomes de pessoas, empresas, marcas, links, contatos, propagandas ou referências de qualquer tipo. O artigo deve ser totalmente neutro e genérico, apenas com conteúdo informativo.

ARTIGO ORIGINAL:
"""
${textoOriginal}
"""

INSTRUÇÃO DE SAÍDA:
Gere um artigo completo, totalmente reescrito e pronto para publicação, usando **Markdown**. A resposta deve estar em **formato JSON** exatamente assim:

\`\`\`json
{
  "title": "Título do artigo",
  "seoMetaDescription": "Descrição otimizada para SEO",
  "markdownText": "Texto completo do artigo em Markdown"
}
\`\`\`

Certifique-se de que:

- A seoMetaDescription seja curta, atraente e otimizada para SEO.
- A saída JSON seja válida, sem erros de formatação.
- Nenhum conteúdo contenha nomes, empresas, links ou propagandas.
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
    process.exit(1);
  }

  // Converte \n para quebras de linha reais
  const markdownFinal = parsed.markdownText.replace(/\\n/g, "\n");
  fs.writeFileSync(caminhoSaida, markdownFinal, "utf8");
  console.log("✅ Artigo reescrito e salvo em Markdown!");
}

// Exemplo de uso:
await reescreverArtigo(null, "artigo_reescrito.md");
