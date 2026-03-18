
# Refatoração do [slug].astro para Consumo Dinâmico dos Dados de Visto

## Contexto Geral

O objetivo é transformar a página de visto por país ([slug].astro) para consumir dados dinâmicos via endpoints, eliminando o array hardcoded e aproveitando o schema completo do projeto visa-crawler. O visa-crawler mantém um banco SQLite com snapshots atualizados de informações de visto para brasileiros em diversos países, seguindo o schema detalhado abaixo.

A refatoração deve garantir performance, escalabilidade e facilidade de atualização, evitando rebuild global desnecessário. O frontend deve ser adaptado para consumir todos os campos relevantes do schema, exibindo informações completas, confiáveis e atualizadas.

---

## Estrutura dos Endpoints REST

- **GET /api/visa-countries**
  - Retorna a lista de países ativos:
    ```json
    [
      { "id": "eua", "nome": "Estados Unidos", "codigo_iso": "US" },
      { "id": "portugal", "nome": "Portugal", "codigo_iso": "PT" }
      // ...
    ]
    ```

- **GET /api/visa/:slug**
  - Retorna o snapshot mais recente do país, incluindo o campo `json_completo`:
    ```json
    {
      "id": 1,
      "pais_id": "pt",
      "coletado_em": "2026-03-18",
      "schema_versao": 1,
      "status": "atual",
      "type_label": "Isento de visto",
      "custo": null,
      "entrevista": 0,
      "validade_min_passaporte": "Mais de 3 meses após a data de retorno",
      "seguro_saude": 1,
      "confiabilidade": "alta",
      "json_completo": {
        "typeLabel": "Isento de visto",
        "visaName": "Turismo 90 dias",
        "prazo": "Imediato",
        "tempoAntecedencia": "Nenhuma",
        "validade": "90 dias",
        "estadia": "90 dias em qualquer período de 180 dias",
        "custo": null,
        "solicitacao": "Entrada direta com passaporte válido",
        "entrevista": false,
        "seguroSaude": null,
        "comprovanteRetorno": true,
        "validadeMinPassaporte": "Mais de 3 meses após a data de retorno",
        "confiabilidade": "alta",
        "documentos": [
          "Passaporte válido",
          "Comprovante de acomodação (reserva de hotel, carta-convite ou contrato de aluguel)",
          "Seguro de viagem com cobertura mínima de €30.000",
          "Comprovante de meios financeiros (extratos bancários ou declaração)",
          "Passagem de ida e volta ou comprovante de retorno"
        ],
        "vacinas": ["Febre Amarela"],
        "consulados": [
          {"cidade": "Lisboa", "site": "https://lisboa.itamaraty.gov.br/pt-br/"}
        ],
        "observacoes": "A partir de 2026, será exigida autorização ETIAS para entrada no Espaço Schengen.",
        "fonte": [
          "https://www.vfsglobal.com/portugal/brazil/schengen-visa.html",
          "https://vistos.mne.gov.pt/pt/vistos-nacionais/informacao-geral/tipo-de-visto"
        ],
        "atualizadoEm": "2026-03-18",
        "recursos": [
          {
            "titulo": "Visto para Portugal 2026: Requisitos, Custos e Como Aplicar",
            "url": "https://simbye.com/pt/blogs/blog/portugal-visa-guide-2026-tourist-work-digital-nomad-residence-permits",
            "tipo": "artigo"
          }
        ]
      }
    }
    ```

---


## Estratégia Recomendada de Build e Atualização

- **Build inicial:** Gere todas as páginas de visto (SSG).
- **Atualizações:** Use um script incremental que detecta países alterados (com base em `atualizadoEm` ou similar) e só re-builda esses países.
- **Publicação:** Separe comandos/aliases para build global (raro) e build incremental (rotina).
- **Fallback:** Se não houver snapshot atual, exiba o último disponível ou um aviso.

---

## Fluxo Incremental de Build/Publicação

Para garantir eficiência e evitar rebuild global desnecessário, recomenda-se o seguinte fluxo:

### 1. Build Inicial

- Gere páginas para todos os países ativos no banco, consultando `/api/visa-countries`.
- Isso garante que todas as páginas estejam presentes após o primeiro deploy.

### 2. Builds Futuros (Incrementais)

- Antes do build, rode um script que consulte `/api/visa-countries` e, para cada país, compare o campo `atualizadoEm` (ou similar) com um registro local (ex: arquivo JSON com o último build).
- Monte uma lista de slugs de países que mudaram desde o último build.
- Passe essa lista de slugs para o comando de build (ex: `npm run build:siteid -- --slugs=pt,eua,franca`).
- O build só gera/atualiza as páginas desses países.
- Após o build, atualize o registro local com os novos timestamps.

### 3. Adaptação dos Scripts

- Adapte o script de publicação para:
  - Detectar países alterados.
  - Gerar tudo no primeiro build, e apenas os alterados nos builds seguintes.
  - Exemplo de lógica:
    ```bash
    CHANGED=$(node detect-changed-countries.js "$SITEID") # retorna pt,eua,franca
    if [ -z "$CHANGED" ]; then
      echo "Nenhum país alterado, nada a publicar."
      exit 0
    fi
    npm run build:"$SITEID" -- --slugs=$CHANGED
    ```

- O script `detect-changed-countries.js` deve:
  - Consultar todos os países e seus `atualizadoEm`.
  - Comparar com um arquivo local (ex: `last-build.json`).
  - Retornar a lista de slugs alterados.
  - Atualizar o arquivo local após o build.

---

### Observação Importante para a Próxima IA

> **Atenção:**  
> Este fluxo é uma sugestão baseada nas melhores práticas para build incremental em projetos SSG/SSR.  
> **A IA responsável pela implementação deve avaliar criticamente este design, validar se ele é o mais adequado para o contexto atual do projeto e, se encontrar uma solução mais eficiente, escalável ou moderna, pode (e deve) propor e implementar melhorias.**  
> O objetivo é garantir performance, simplicidade de manutenção e robustez, sem engessar a arquitetura.

**Este documento serve como guia e contexto, mas a próxima IA tem liberdade para inovar e aprimorar a solução conforme sua análise.**

---

## Refatoração do [slug].astro

### 1. getStaticPaths
- Buscar todos os slugs válidos via `/api/visa-countries`.
- Gerar as rotas dinâmicas a partir da resposta.

### 2. getStaticProps (ou equivalente Astro)
- Buscar os dados completos do país via `/api/visa/:slug`.
- Passar o JSON completo como prop para o componente.

### 3. Remover o array `countries`
- Eliminar o array hardcoded e todo o mapeamento manual.

### 4. Ajustes no Frontend
- Trocar todos os acessos a `country.*` para usar os campos do novo JSON (`json_completo`).
- Adaptar para campos que podem ser `null` ou ausentes (ex: `visaName`, `prazo`, `recursos`).
- Exibir seções extras: recursos, observações, fontes, confiabilidade, etc.
- Usar os campos críticos para badges, alertas ou destaques (ex: seguro saúde obrigatório, entrevista, etc).
- Exibir badges de confiabilidade e alertas de mudanças futuras (ex: ETIAS).
- Listar fontes oficiais e recursos úteis (artigos, vídeos, tutoriais).

---

## Exemplo de Fluxo de Código

```js
// getStaticPaths
export async function getStaticPaths() {
  const countries = await fetch('http://localhost:3000/api/visa-countries').then(r => r.json());
  return countries.map(c => ({ params: { slug: c.id } }));
}

// getStaticProps
export async function get({ params }) {
  const country = await fetch(`http://localhost:3000/api/visa/${params.slug}`).then(r => r.json());
  return { props: { country } };
}
```

No template Astro:
```astro
<h1>Visto para {country.json_completo.typeLabel}</h1>
<p>{country.json_completo.estadia}</p>
{country.json_completo.seguroSaude && <div>Seguro saúde obrigatório</div>}
{country.json_completo.observacoes && <div class="alert">{country.json_completo.observacoes}</div>}
<ul>
  {country.json_completo.documentos.map(doc => <li>{doc}</li>)}
</ul>
{country.json_completo.recursos?.length > 0 && (
  <section>
    <h2>Links úteis</h2>
    <ul>
      {country.json_completo.recursos.map(r => (
        <li><a href={r.url} target="_blank">{r.titulo} ({r.tipo})</a></li>
      ))}
    </ul>
  </section>
)}
```

---

## Considerações e Melhorias Futuras

- Badge de confiabilidade e alertas para campos críticos divergentes.
- Garantir que o frontend lide com campos opcionais e valores nulos de forma resiliente.

---

## Prompt para Implementação (Claude Sonet)

**Prompt:**

> Você é um desenvolvedor responsável por refatorar a página [slug].astro de um projeto Astro/Node.js para consumir dados dinâmicos de vistos internacionais, usando endpoints REST que expõem o schema completo do visa-crawler (ver exemplos acima).  
> 
> - Implemente a busca dinâmica dos slugs de países e dos dados completos de visto via endpoints.
> - Remova o array hardcoded de países.
> - Adapte o frontend para consumir todos os campos do JSON retornado, exibindo informações completas, recursos, observações, fontes, badges de confiabilidade e alertas.
> - Implemente lógica de build incremental, para que apenas países alterados sejam rebuildados em atualizações.
> 
> Use os exemplos de estrutura de dados e código fornecidos nesta documentação como referência.

---

**Este arquivo serve como contexto completo para qualquer modelo de IA ou desenvolvedor que for implementar a refatoração.**
