# Refatoração: Geração de Conteúdo de Artigos Somente no Servidor

## Objetivo

- Gerar arquivos de conteúdo (Markdown dos artigos) apenas no servidor (VPS) durante o deploy/build.
- Não versionar mais esses arquivos no Git.
- Permitir geração local de um artigo específico para debug, sem afetar o fluxo normal.
- Garantir que o conteúdo gerado localmente não seja comitado (adicionar ao .gitignore).
- O deploy no VPS já copia o conteúdo de /dist para /var/www/site_id.

---

## Mudanças Necessárias

### 1. .gitignore

- Adicionar as pastas de conteúdo gerado ao `.gitignore`:
  ```
  multi-sites/sites/*/content/blog/
  ```
- Opcional: criar um README.md em cada pasta ignorada explicando que o conteúdo é gerado no VPS.

---

### 2. Geração de Conteúdo no VPS

- No fluxo de deploy (ex: publish-from-local.sh), mover a chamada do script `generate-blog-content.js` para o VPS, antes do build.
- Exemplo:
  ```bash
  ssh user@vps 'cd /path/projeto && node core/generate-blog-content.js "$SITEID"'
  ```
- Remover a geração local do conteúdo dos artigos do fluxo principal.

---

### 3. Geração Local para Debug

- Adicionar uma flag ou comando para gerar apenas um artigo específico localmente:
  - Exemplo de uso:
    ```
    node core/generate-blog-content.js fastvistos --slug=meu-artigo
    ```
- O script deve aceitar o parâmetro `--slug` e gerar apenas o arquivo correspondente.
- O conteúdo gerado localmente continuará sendo ignorado pelo Git.

---

### 4. Ajustes no Script de Geração

- Modificar `generate-blog-content.js` para:
  - Aceitar o parâmetro `--slug=slug-do-artigo`.
  - Se informado, gerar apenas esse artigo (e não todos).
  - Manter o comportamento atual para geração completa/incremental.

---

### 5. Build e Deploy

- Garantir que o build no VPS rode após a geração dos artigos.
- O conteúdo gerado estará disponível para o build Astro/AstroJS normalmente.

---

### 6. Documentação

- Atualizar a documentação do projeto explicando:
  - O conteúdo de artigos não é mais versionado.
  - Como gerar um artigo localmente para debug.
  - O fluxo de geração no VPS.

---

## Impactos

- **Positivos:**
  - Repositório mais limpo, sem arquivos gerados.
  - Menos conflitos de merge em conteúdo.
  - Geração sempre atualizada no deploy.
- **Cuidados:**
  - O build local completo não funcionará sem gerar os artigos antes (mas para debug de um artigo, basta gerar só ele).
  - O ambiente de produção (VPS) precisa ter acesso ao banco de dados para gerar os artigos.
  - O script de geração precisa ser robusto para rodar no VPS (verificar dependências).

---

## Exemplo de .gitignore

```gitignore
# Ignorar conteúdo gerado dos artigos
multi-sites/sites/*/content/blog/
```

---

## Exemplo de uso local para debug

```bash
node core/generate-blog-content.js fastvistos --slug=meu-artigo
```

---

## Exemplo de passo no deploy VPS

```bash
# No VPS, antes do build
node core/generate-blog-content.js "$SITEID"
npm run build:"$SITEID"
```

---

## Resumo

- O conteúdo dos artigos será gerado apenas no VPS.
- Não será mais versionado no Git.
- Para debug local, gere apenas o artigo necessário.
- O fluxo de build/deploy no VPS deve garantir a geração antes do build.
