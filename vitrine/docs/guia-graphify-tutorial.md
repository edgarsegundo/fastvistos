# Graphify — Tutorial enxuto (modo 100% local, sem tokens)

> ⚠️ **Nota importante — não use o `/graphify .` que o instalador sugere no final**
>
> Depois de rodar `graphify install`, a ferramenta imprime algo como:
> ```
> Done. Open your AI coding assistant and type:
>   /graphify .
> ```
> Esse `/graphify .` é o **comando de skill**, rodado dentro do chat do assistente (Claude Code, Cursor etc.) e usa o modelo da sua sessão de IA.
>
> A flag `--code-only` é documentada como uma **flag do comando `extract`, não do skill**. Ou seja: rodar `/graphify .` dentro do assistente **não garante** que sua documentação `.md` será pulada — ele pode acionar extração semântica sobre os markdowns usando o modelo do assistente, gastando tokens da sua sessão.
>
> Para ter certeza de **zero tokens**, sempre use o comando de terminal puro:
> ```bash
> graphify extract . --code-only
> ```
> Esse sim é garantido, pela documentação, como 100% local (AST via tree-sitter), sem nenhuma chamada de LLM — independentemente de quantas vezes ou com que frequência você rodar.

## 1. Instalar
```bash
uv tool install graphifyy
```
Se o comando `graphify` não for encontrado depois: `uv tool update-shell` e abra um novo terminal.

## 2. Registrar o skill no seu assistente — escopado ao projeto
```bash
graphify claude install --project
```
⚠️ **Não rode `graphify install` sem `--project`** — isso registra o skill globalmente em `~/.claude/`, fora do repositório, e escreve só um trigger manual (`/graphify`) no `~/.claude/CLAUDE.md`, sem o hook automático que sugere o grafo antes de ler arquivos.

Com `--project`, o comando escreve no `CLAUDE.md` do próprio repo (com as regras completas: usar `graphify query`/`path`/`explain` antes de ler arquivos, rodar `graphify update .` depois de editar código) e instala o hook `PreToolUse` em `.claude/settings.json`, que é o que faz o Claude de fato usar o grafo automaticamente, sem você precisar digitar `/graphify` toda vez.

Depois de instalado, **não rode `graphify uninstall`** a menos que você realmente queira remover a integração — ele desfaz tudo isso (skill, seção do CLAUDE.md, hook).

## 3. Gerar o grafo — só código, sem LLM
```bash
graphify extract . --code-only
```
- Ignora `.md`, PDFs, imagens.
- Usa só tree-sitter/AST local. Nenhuma chamada de API é feita.

## 4. Ignorar arquivos irrelevantes (opcional)
Crie `.graphifyignore` na raiz do projeto (mesma sintaxe do `.gitignore`):
```
node_modules/
dist/
```

## 5. Consultar o grafo
```bash
graphify query "o que conecta X a Y?"
graphify path "ModuleA" "ModuleB"
graphify explain "NomeDaClasse"
```
Ou dentro do Claude Code: `/graphify .` já deixa o agente preferir essas consultas em vez de ler arquivos crus.

## 6. Manter atualizado sem esforço manual (ainda sem tokens)
```bash
graphify hook install
```
Isso cria hooks de `post-commit` e `post-checkout` que reconstroem o grafo automaticamente a cada commit — usando só AST, sem chamada de LLM.

## 7. Evitar poluir o cache de prompt do Claude Code
Adicione ao `.claudeignore`:
```
graph.json
graphify-out/
```

## 8. Atualização incremental manual (se preferir não usar hook)
```bash
graphify extract . --code-only --update
```

---

### Isso fica rodando em memória?
Os comandos deste tutorial (`extract --code-only`, `query`, `path`, `explain`, `hook install`) são **pontuais**: sobem, processam, escrevem o resultado em disco e encerram. Não ficam residentes em RAM.

Só ficam ativos em memória se você usar, à parte:
- `graphify ./raw --watch` — observa o filesystem continuamente
- `graphify ./raw --mcp` ou `python -m graphify.serve ...` — sobe um servidor MCP (stdio/HTTP) para consultas repetidas

Nenhum desses dois faz parte do fluxo recomendado acima.

### Se quiser incluir a documentação em markdown depois
Isso **vai** gastar tokens (chamada de LLM para extração semântica). Rode sem a flag `--code-only`, de preferência dentro da sessão do Claude Code (`/graphify ./docs`), que usa os créditos da sua própria sessão em vez de uma API key separada.