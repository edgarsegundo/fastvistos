# Instruções pro Claude Code nesta pasta

- Edite só `page.html`. Não edite nada dentro de `_original/` ou
  `_snapshots/` — são cópias de segurança, não conteúdo de trabalho.
- `page.html` é HTML+CSS já achatado (um `<div>` com um `<style>` escopado
  via `@scope` dentro dele) — não precisa (nem deve) adicionar
  `<!doctype>`/`<html>`/`<head>`/`<body>` em volta.
- Imagem nova: solte o arquivo em `images/` e referencie por caminho
  relativo (`<img src="images/foto.jpg">`) — o watcher sobe e reescreve a
  URL sozinho. Trocar por uma imagem que já tem URL é só editar o
  `src="..."` normalmente.
- Ao salvar, um watcher externo sincroniza automaticamente com o banco de
  dados — não é necessário rodar nenhum comando de build/deploy pra ver o
  resultado no preview local.
- O servidor pode reescrever levemente o HTML por segurança (sanitização),
  removendo `<script>`/atributos `on*` se existirem. Isso é esperado.
