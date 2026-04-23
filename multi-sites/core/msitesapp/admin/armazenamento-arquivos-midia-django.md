# Resumo: Armazenamento e Servir Arquivos de Mídia no Projeto Django

## 1. Armazenamento de Imagens no Django

- Os campos `ImageField` dos modelos (ex: `BlogArticle`, `BlogAsset`) usam o parâmetro `upload_to=business_image_upload_to`.
- A função `business_image_upload_to` salva as imagens em um caminho relativo como:
  ```
  images/{prefix}__{filename}
  ```
  Onde `prefix` é o nome ou id do business relacionado.

- O diretório base para uploads é definido em:
  - `MEDIA_ROOT = os.path.join(BASE_DIR, 'mediafiles/')` no `settings.py`
  - As imagens ficam fisicamente em:  
    ```
    microservicesadm/mediafiles/images/...
    ```

## 2. Docker e Volumes

- O volume Docker `microservicesadm_mediafiles` é montado em:
  ```
  /app/microservicesadm/mediafiles
  ```
  dentro dos containers (nginx e app).

- O volume é compartilhado entre o app Django (para salvar arquivos) e o nginx (para servir os arquivos).

- No host, o volume pode ser acessado em:
  ```
  /var/lib/docker/volumes/microservicesadm_mediafiles/_data/
  ```

## 3. Configuração do nginx

- O nginx serve os arquivos de mídia com o bloco:
  ```nginx
  location /media/ {
      alias /app/microservicesadm/mediafiles/;
      expires 30d;
      add_header Cache-Control "public, max-age=2592000";
  }
  ```
- Assim, qualquer arquivo salvo em `mediafiles/` estará acessível via:
  ```
  https://seu-dominio/media/...
  ```

- O bloco `/static/` serve arquivos estáticos (CSS, JS, etc.) de forma semelhante.

## 4. Como acessar as imagens no site

- Basta usar URLs relativas como `/media/images/empresa__foto.jpg` nos templates.
- O nginx entrega diretamente o arquivo do volume Docker.

## 5. Resumo do fluxo

1. Usuário faz upload de imagem via Django admin ou API.
2. Django salva em `MEDIA_ROOT` (dentro do volume Docker).
3. nginx serve o arquivo via `/media/` para a web.
4. O acesso público é imediato, sem necessidade de copiar arquivos manualmente.

---

**Exemplo de URL pública:**  
`https://sys.fastvistos.com.br/media/images/nome-da-empresa__foto.webp`

**Exemplo de caminho físico no host:**  
`/var/lib/docker/volumes/microservicesadm_mediafiles/_data/images/nome-da-empresa__foto.webp`

---

Se quiser salvar este conteúdo, basta copiar para um arquivo chamado, por exemplo, `mediafiles-arquitetura.md`.- O bloco `/static/` serve arquivos estáticos (CSS, JS, etc.) de forma semelhante.

## 4. Como acessar as imagens no site

- Basta usar URLs relativas como `/media/images/empresa__foto.jpg` nos templates.
- O nginx entrega diretamente o arquivo do volume Docker.

## 5. Resumo do fluxo

1. Usuário faz upload de imagem via Django admin ou API.
2. Django salva em `MEDIA_ROOT` (dentro do volume Docker).
3. nginx serve o arquivo via `/media/` para a web.
4. O acesso público é imediato, sem necessidade de copiar arquivos manualmente.

---

**Exemplo de URL pública:**  
`https://sys.fastvistos.com.br/media/images/nome-da-empresa__foto.webp`

**Exemplo de caminho físico no host:**  
`/var/lib/docker/volumes/microservicesadm_mediafiles/_data/images/nome-da-empresa__foto.webp`

---

Se quiser salvar este conteúdo, basta copiar para um arquivo chamado, por exemplo, `mediafiles-arquitetura.md`.