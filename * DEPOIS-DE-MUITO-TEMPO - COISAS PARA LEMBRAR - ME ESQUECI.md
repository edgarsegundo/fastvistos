

---

* Sim, você precisa iniciar o túnel sempre que for trabalhar. Ele não sobe sozinho. Abra um terminal e rode:

ssh -N fv-db

Sim. Criei o [.vscode/tasks.json](.vscode/tasks.json) com uma task que roda sozinha quando você abre a pasta do projeto no VS Code.

- **O que ela faz:** roda `ssh -N fv-db` num terminal dedicado, em segundo plano, sem tirar o foco do que você está fazendo. Se a porta 3307 já estiver escutando, ela só avisa e não tenta abrir outro túnel.
- **Quando para:** o túnel fecha quando você fecha o VS Code ou o terminal dessa task.

**Primeira vez:** o VS Code pede permissão para rodar tasks automáticas. Rode **Tasks: Manage Automatic Tasks in Folder** e escolha **Allow Automatic Tasks**. Depois disso ele roda sozinho. Para testar agora sem reabrir, rode **Tasks: Run Task** e escolha "Túnel SSH do banco (fv-db)".

**Chave SSH:** se a chave tiver senha e não estiver no `ssh-agent`, o terminal da task vai pedir a senha. Vale rodar `ssh-add --apple-use-keychain ~/.ssh/<sua_chave>` uma vez para não pedir mais.

O `.vscode/tasks.json` não está no `.gitignore`, então ele vai aparecer como arquivo novo no git. Se não quiser commitá-lo, é só ignorá-lo.