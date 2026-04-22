# Link Temporário para Edição de Imagem (UUID)

## Objetivo

Permitir que um artigo do blog seja editado (inclusão de imagens e edição de Markdown) via uma URL temporária, acessível de qualquer dispositivo, válida por 10 minutos, sem necessidade de autenticação adicional.

## Diferença entre SSR Astro e Página Estática

- **SSR Astro (Server-Side Rendering):**
  - A página é gerada sob demanda pelo servidor Node (multi-sites/core/msitesapp/server.js) usando Astro como engine de template.
  - Permite buscar o artigo diretamente do banco de dados, validar UUID, expiração, e injetar scripts dinâmicos.
  - Ideal para fluxos temporários, dinâmicos e seguros.
- **Página Estática:**
  - Gerada no build e servida como arquivo HTML pronto.
  - Não permite lógica dinâmica (validação de UUID, expiração, busca no BD).
  - Não atende ao requisito de expiração e edição dinâmica.

## Fluxo de Geração e Validação do Link Temporário

1. **Geração do Link**
   - Um endpoint (ex: `/api/generate-edit-link`) recebe o slug e siteId do artigo.
   - Gera um UUID v4 e calcula o timestamp de expiração (agora + 10 minutos).
   - Salva em um arquivo temporário no servidor (ex: `tmp/edit-image-uuids.json`) com estrutura:
     ```json
     {
       "<uuid>": {
         "slug": "<slug>",
         "siteId": "<siteId>",
         "expiresAt": "2026-04-17T12:34:56.000Z",
         "inUse": false
       },
       ...
     }
     ```
   - Retorna a URL: `/edit-image-temp/<uuid>`

2. **Acesso ao Link**
   - Endpoint Express (`server.js`) recebe o UUID.
   - Lê o arquivo temporário, remove UUIDs expirados.
   - Valida se o UUID existe, não expirou e não está em uso.
   - Marca como `inUse: true` para bloquear uso simultâneo.
   - Busca o artigo no banco de dados.
   - Renderiza a página Astro com o editor de imagem injetado.
   - Se inválido/expirado/em uso, retorna página de erro adequada.

3. **Expiração e Limpeza**
   - Sempre que o endpoint é acessado, faz limpeza dos UUIDs expirados no arquivo.
   - Opcional: cron job para limpeza periódica.
   - Ao fechar a página ou após 10 minutos, marca o UUID como expirado/removido.

4. **Interface e UX**
   - Exibe contador regressivo de tempo restante (ex: banner ou timer visível).
   - Ao expirar, recarrega a página automaticamente e mostra mensagem de expiração.
   - Se tentar salvar após expirar, mostra erro e bloqueia ação.

5. **Segurança e Permissões**
   - Qualquer pessoa com o link pode editar o artigo enquanto o UUID for válido.
   - Não há autenticação extra, nem limitação de IP/user-agent.
   - Não permite edição simultânea: se o UUID estiver em uso, bloqueia novos acessos.

6. **Exemplo de Endpoint Express**
```js
// multi-sites/core/msitesapp/server.js
app.get('/edit-image-temp/:uuid', async (req, res) => {
  const { uuid } = req.params;
  // 1. Ler arquivo tmp/edit-image-uuids.json
  // 2. Limpar expirados
  // 3. Validar uuid, expiração, inUse
  // 4. Buscar artigo no BD
  // 5. Renderizar página Astro com editor injetado
  // 6. Marcar inUse: true
  // 7. Se inválido, renderizar página de erro
});
```

## Observações

- O arquivo temporário pode ser um JSON simples, carregado e salvo a cada operação.
- Para evitar corrupção, usar lock simples (ex: fs.promises com atomic write).
- O editor de imagem pode ser injetado sempre que o acesso for via UUID válido, mesmo em produção.
- O fluxo é seguro o suficiente para uso temporário, pois o UUID expira e não há indexação pública.

---
