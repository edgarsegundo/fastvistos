# Backog

## To Do

- criar posts and redirecionar 301 para todos os posts que agora não existem mais

- Review publishing steps
 ./helper.sh (option 1)
 npx prisma db pull
 npx prisma generate
 node generate-blog-content.js fastvistos
 npm run download-images:fastvistos
 npm run build:fastvistos
 node deploy-site.js fastvistos

- Descobrir porque a foto não está divulgando

- Gerar
                  "thumbnailUrl": "https://fastvistos.com.br/assets/images/blog/visa-3109800_1280_thumb.jpg",

- Colocar no webpage: "thumbnailUrl": "https://neilpatel.com/wp-content/

https://fastvistos.com.br/assets/images/blog/visa-3109800_1280.jpg

- update to the right logo url in the siteconfig :  url: siteConfig.site?.logo?.url,


- create these ids  like logoId and others in one place  to be shared

- maybe I want change to the convention buut necessary: "@id": "https://neilpatel.com/br/#/schema/logo/image/",


- por enquanto não vou pemitir publicar o original e se a pessoa quiser voltar para o original terá que clonar o original e publicar

- Missing seo stuff, all jsonLd files.

---

- Imagem no artigo?

Criar um modelo para anexar imagens de um blog? Isso não vai sobrecarregar a minha vps? Soluções alternativas?

---

- Criar um blog editor em microservicesadm com todas as md tags (ele pode arrastar esses tags) e conforme o usuario vai escrevendo o artigo, ele já vê o formato real como vai ficando e pode de lá mesmo pegar imagens e mandar para o servidor.

---

- Facilitar e se possível automatizar a criação de todos esses arquivos, ver image.

![alt text](image.png)

---

- Criar campo Author default em blog_conf e campo imagem author
- Criar campo author default em topic e campo imagem
- Permitir colocar author diferente no article caso seja outro além de Author default de blog_conf e topic

---

- flag de conf para exibir data ou não no artigo
- call to action do lado da foto do author no início do article. Achei interessante, veja:

Espero que você goste desse artigo. Se você quer que meu time faça o seu marketing, clique aqui.

![alt text](image-1.png)

---

- Implementar possibilidade de adição de comentários e criar endpoints and modelos para isso na base de dados.

---

- Criar no blog_config model um campo para o sidebar (aside) do article?

Coisas que vão:

- Call-to-action (CTA) (e.g., "Do you want more traffic?" with a form)
- Table of contents (navigational aid)
- Advertisements, promotions, or related links

**Pensando se crio um campo ou se uso o campo existente json de conf?**
**também quero misturar a possibilidade de fazer customizações direto no código**

---

## Completed

- publicar para testar e documentar os passos

---

Missing footer at home page and whasapp links not working.

---
