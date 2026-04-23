# 📸 Image Upload direto para Django (com suporte a canvas)

## 🎯 Objetivo

Permitir que imagens:

* 📂 vindas do upload (`input file`)
* 📋 coladas via clipboard
* 🎨 ajustadas via canvas (crop, filtros, etc.)

sejam enviadas **diretamente para o backend Django**, sem passar pelo Express.

---

## 🧠 Princípio chave

O Django espera:

```
multipart/form-data
→ campo: image
→ valor: File (ou Blob com filename)
```

Logo, independente da origem da imagem, precisamos garantir:

> 🔁 Tudo vira um `File` antes do upload

---

## 🧱 Estado atual do app

O frontend trabalha com:

```js
state = {
  imageFile: File | null,
  imageDataUrl: string,
  imageName: string
}
```

---

## 🔄 Mudança proposta

Padronizar o fluxo para sempre trabalhar com:

```
File → FormData → Django
```

---

## ⚙️ 1. Criar helper: getFileForUpload

```js
function getFileForUpload() {
  // Caso 1: usuário fez upload normal
  if (state.imageFile) return state.imageFile;

  // Caso 2: imagem veio do canvas (dataURL)
  const blob = dataURLtoBlob(state.imageDataUrl);

  return new File(
    [blob],
    state.imageName + '.webp',
    { type: 'image/webp' }
  );
}
```

---

## ⚙️ 2. Criar função de upload para Django

```js
async function uploadImageToDjango() {
  const file = getFileForUpload();

  const form = new FormData();
  form.append('image', file, file.name);

  const res = await fetch(API.uploadImage(), {
    method: 'POST',
    body: form
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }

  return data; 
  // esperado: { image_url }
}
```

---

## ⚙️ 3. Alterar botão "Salvar" (app.js)

### ❌ Remover STUB atual

```js
// remover:
await new Promise(r => setTimeout(r, 800));
```

---

### ✅ Substituir por:

```js
const data = await uploadImageToDjango();

const savedImg = {
  filename: state.imageName + '.webp',
  url: data.image_url,
  copied: false
};

const newIndex = state.imagesSaved.length;
state.imagesSaved.push(savedImg);
addToImageList(savedImg, newIndex);
```

---

## ⚙️ 4. Melhorar AdjustOverlay (usar Blob ao invés de base64)

### ❌ Atual

```js
const resultDataUrl = canvas.toDataURL('image/webp', quality);
onAppliedCallback(resultDataUrl);
```

---

### ✅ Novo (recomendado)

```js
canvas.toBlob((blob) => {
  onAppliedCallback(blob);
}, 'image/webp', quality);
```

---

## ⚙️ 5. Adaptar callback do AdjustOverlay

### ❌ Atual

```js
state.imageDataUrl = newDataUrl;
state.imageFile = null;
```

---

### ✅ Novo

```js
AdjustOverlay.init((result) => {

  if (result instanceof Blob) {
    const file = new File(
      [result],
      state.imageName + '.webp',
      { type: 'image/webp' }
    );

    state.imageFile = file;
    state.imageDataUrl = URL.createObjectURL(result);

  } else {
    // fallback (caso ainda use dataURL)
    state.imageDataUrl = result;
    state.imageFile = null;
  }

  updatePreview();
});
```

---

## ⚙️ 6. (Opcional) Remover uso de base64 completamente

Se quiser otimizar memória:

* eliminar `imageDataUrl` como fonte principal
* usar apenas `Blob/File`
* gerar preview com `URL.createObjectURL`

---

## ⚠️ Cuidados importantes

### ✔ Nome do arquivo

Garantir:

```js
state.imageName.trim()
```

---

### ✔ Tipo MIME correto

```js
{ type: 'image/webp' }
```

---

### ✔ Evitar upload sem imagem

```js
if (!state.imageFile && !state.imageDataUrl) {
  throw new Error('Nenhuma imagem selecionada');
}
```

---

## 🚀 Fluxo final

### Upload normal:

```
File → FormData → Django
```

### Clipboard:

```
Clipboard → File → FormData → Django
```

### Ajuste:

```
Canvas → Blob → File → FormData → Django
```

---

## 🧾 Resultado esperado

Após upload:

```js
{
  image_url: "https://cdn.site.com/images/slug/imagem.webp"
}
```

E no frontend:

```md
![imagem.webp](https://cdn.site.com/images/slug/imagem.webp)
```

---

## 💡 Benefícios

* 🚀 Sem backend intermediário
* ⚡ Menor latência
* 🧠 Código mais simples
* 📦 Menos memória (com toBlob)
* 🔄 Mesmo fluxo para todos os casos

---

## 🏁 Conclusão

Você não precisa alterar seu backend Express.

Basta garantir:

> 👉 Sempre transformar a imagem final em `File`

E enviar direto para o Django.

---
