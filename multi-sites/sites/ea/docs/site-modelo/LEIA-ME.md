# Edição local — browserbase/browserbase

Pacote baixado do admin do vitrine. Depois de descompactar:

1. Instale as dependências (uma vez só): `npm install`
2. Rode o watcher: `npm run watch`
3. Abra o preview que ele imprimir no terminal (ex: http://localhost:8901)
4. Edite `page.html` no VSCode (ou Claude Code) — o preview recarrega na
   hora, e a mudança é sincronizada com o banco de dados do vitrine em
   background, automaticamente.

Pré-requisito: Node.js instalado (https://nodejs.org — qualquer versão
recente). Não tem como evitar esse passo sem publicar isto como um
pacote/instalador próprio — fica documentado aqui, não escondido.

## O que sincroniza
Só o `props.html` deste bloco `FreeHtml` (id `cloned`). Nada mais
desta página, nem de outra, é tocado.

## Preview vs. banco
O preview mostra o ARQUIVO cru; o banco guarda uma versão SANITIZADA
(remove `<script>`/atributos `on*` por segurança) — pode divergir um
pouco. A rota `/__sanitized` do preview mostra a versão real que está no
banco.

## Imagens
- **Trocar por uma que já tem URL**: edite o `src="..."` (ou o `url(...)`
  no CSS embutido) direto no `page.html` — é texto puro, sincroniza igual
  qualquer outra edição.
- **Adicionar uma imagem nova sua**: solte o arquivo dentro da pasta
  `images/` (já vem criada) e referencie por caminho relativo, ex:
  `<img src="images/foto.jpg">`. O watcher detecta, sobe pro storage de
  verdade sozinho, e reescreve a referência pra URL real antes de
  sincronizar — você vê o `page.html` mudar automaticamente quando isso
  acontece. Formatos aceitos: jpg/png/webp/gif.

## Sem git aqui de propósito
O banco é a fonte da verdade, não esta pasta.
- `_original/page.html` — cópia intocada de antes da primeira edição.
- `_snapshots/` — criada pelo watcher, uma cópia de cada versão enviada
  (pra restaurar: `npm run restore -- --list` / `npm run restore --
  --from <nome-ou-original>`).

## O token deste pacote
`.vitrine-local-edit.json` tem um token válido por 7 dias, só
pra ESTA página — baixar de novo pelo admin invalida este e gera outro.

## Atenção
Se alguém editar e SALVAR esta mesma página pelo editor visual (Puck)
enquanto você edita este arquivo, esse save sobrescreve o bloco inteiro
no banco — seu trabalho aqui pode ser perdido (o watcher tenta detectar
isso e avisar, mas não é garantido). Evite ter as duas pontas abertas ao
mesmo tempo.
