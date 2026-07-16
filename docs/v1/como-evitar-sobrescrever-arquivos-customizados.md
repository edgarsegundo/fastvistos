# Como Evitar Sobrescrever Arquivos Customizados ao Sincronizar Sites

## Propósito

Ao sincronizar arquivos do core para os sites (ex: com o script `sync-blog.js`), alguns arquivos devem ser copiados apenas na primeira vez, para permitir customização futura sem risco de sobrescrita. Isso é útil para arquivos como `shared.css`, que podem ser personalizados por site.

## Como Implementar para Outros Arquivos

### 1. Identifique o Arquivo
Escolha o arquivo que deve ser copiado apenas se não existir no destino (exemplo: `shared.css`, `custom.js`, etc).

### 2. Adicione a Verificação no Script
No seu script de sincronização (ex: `sync-blog.js`), antes de copiar o arquivo, verifique se ele já existe no destino usando `fs.access`. Só copie se não existir.

#### Exemplo de Código:
```js
const destPath = join(destDir, 'nome-do-arquivo.ext');
try {
  await fs.access(destPath);
  // Arquivo já existe, não sobrescreve
  console.log(`⏩ Skipped nome-do-arquivo.ext (already exists)`);
} catch {
  // Arquivo não existe, pode copiar
  const content = await fs.readFile(srcPath, 'utf-8');
  await fs.writeFile(destPath, content);
  console.log(`✅ Copied nome-do-arquivo.ext`);
}
```

### 3. Onde Colocar
- Faça isso dentro da função responsável por copiar arquivos específicos.
- No caso do `shared.css`, a lógica está dentro da função `syncBlogToSite`.

### 4. Para Quais Arquivos Usar
- Use para arquivos que serão customizados por site após a primeira cópia.
- Exemplos comuns: arquivos de CSS, configurações locais, imagens customizadas, etc.

### 5. Propósito
- Permitir que cada site personalize arquivos sem perder alterações em futuras sincronizações.
- Evitar sobrescrever customizações manuais feitas após a criação inicial do site.

## Resumo
Sempre que um arquivo precisar ser customizado por site, implemente a verificação de existência antes de copiar. Assim, a primeira cópia é feita automaticamente, mas futuras execuções do script não sobrescrevem o arquivo customizado.