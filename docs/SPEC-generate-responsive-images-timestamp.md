# SPEC: Otimização de geração de imagens responsivas usando timestamp

## Objetivo

Evitar a re-geração desnecessária de imagens responsivas no script `generate-responsive-images.js`, processando apenas as imagens que ainda não existem ou cujas versões base foram modificadas após a última geração.

---

## Motivação

- Reduzir tempo de processamento e uso de CPU/disco em deploys incrementais.
- Evitar sobrescrever imagens responsivas já otimizadas.
- Garantir que imagens atualizadas sejam corretamente regeneradas.

---

## Estratégia

- Para cada imagem base e cada variação (breakpoint, escala, formato):
  1. Verificar se o arquivo de saída (imagem responsiva) já existe.
  2. Se existir, comparar o timestamp de modificação (`mtime`) da imagem base com o da imagem responsiva.
  3. Só gerar a imagem responsiva se:
     - Ela não existir, **ou**
     - O timestamp da imagem base for mais recente que o da responsiva.

---

## Passos de implementação

1. **No método `processImage`:**
   - Antes de chamar o processador Sharp, obter o `mtime` da imagem base e da imagem responsiva (se existir).
   - Pular a geração se a responsiva já existir e estiver mais "nova" ou igual à base.
   - Registrar no index normalmente para manter o JSON de mapeamento completo.

2. **Exemplo de lógica:**

```js
const baseStat = fs.statSync(inputPath);
let shouldProcess = true;

if (fs.existsSync(outPath)) {
    const outStat = fs.statSync(outPath);
    if (baseStat.mtime <= outStat.mtime) {
        // Responsiva está atualizada, pode pular
        this.index[baseName][type].push(`${outName} ${width}w`);
        shouldProcess = false;
    }
}

if (!shouldProcess) continue;

// ...processa normalmente
await this.processors[type](image, width, outPath);
this.index[baseName][type].push(`${outName} ${width}w`);
```

3. **Testes:**
   - Rodar o script em um diretório com imagens já processadas e garantir que apenas imagens realmente novas ou modificadas sejam regeneradas.
   - Testar atualização de uma imagem base e verificar se as versões responsivas são atualizadas.
   - Testar adição e remoção de imagens.

---

## Considerações

- Essa abordagem é eficiente e cobre a maioria dos casos reais.
- Não cobre casos extremos de manipulação de arquivos com preservação de timestamp, mas é suficiente para fluxos normais.
- Para máxima robustez, considerar hash no futuro, mas não é necessário neste estágio.

---

## Histórico

- 2026-04-11: Primeira versão da spec.
