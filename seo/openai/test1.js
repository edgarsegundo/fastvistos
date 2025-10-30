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
  const textoOriginal = fs.readFileSync(caminhoArquivoEntrada, "utf8");

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

* A seoMetaDescription seja curta, atraente e otimizada para SEO.
* A saída JSON seja válida, sem erros de formatação.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const artigoReescrito = response.choices[0].message.content;

  fs.writeFileSync(caminhoSaida, artigoReescrito, "utf8");
  console.log("✅ Artigo reescrito com sucesso!");
}

// Exemplo de uso:
await reescreverArtigo("artigo_original.txt", "artigo_reescrito.md");
