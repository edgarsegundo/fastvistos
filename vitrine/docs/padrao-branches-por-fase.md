# Padrão de branches por fase (SEO/GEO/AEO)

Como estruturar branches, commits e scripts pra trabalhar fase por fase
no roadmap de SEO/GEO/AEO — e reaproveitar esse padrão em qualquer
trabalho futuro dividido em fases. Complementa
[como-documentar-para-claude-code.md](como-documentar-para-claude-code.md).

Índice:
- [Princípio](#princípio)
- [Estrutura de branches](#estrutura-de-branches)
- [Passo a passo manual](#passo-a-passo-manual)
- [Scripts de automação](#scripts-de-automação)
- [Convenção de commit](#convenção-de-commit)
- [Comando `/commit`: comentário separado do trabalho](#comando-commit-comentário-separado-do-trabalho)
- [Outras sugestões](#outras-sugestões)
- [Checklist rápido](#checklist-rápido)

---

## Princípio

`main` é o legado, intocado, rodando em produção. `seo` é o tronco
da nova versão (roda numa pasta separada na VPS) — não vai virar merge
de `main`, é uma linha própria. Cada fase do roadmap vira um branch
curto que nasce de `seo` e volta pra ele, nunca direto pra `main`.

```
main (legado, intocado)
  └─ seo (tronco da nova versão, roda na VPS)
       ├─ seo-fase-0-robots-txt
       ├─ seo-fase-1-jsonld-schemas
       ├─ seo-fase-2-llms-txt
       └─ ...
```

Motivo de isolar cada fase num branch próprio, mesmo trabalhando
sozinho: histórico de commit isolado e taggeado é contexto barato pro
Claude Code ler sozinho (`git log`, `git show`) sem gastar tokens da
sessão atual — mais barato que reexplicar decisão já tomada toda vez
que uma sessão nova precisa entender "por que isso está assim".

## Estrutura de branches

- **`seo`**: branch de integração. É dele que cada fase nasce, e é
  pra ele que cada fase volta.
- **`seo-fase-N-slug`**: um por fase, vida curta (só dura enquanto
  a fase está em progresso). Nome com número da fase + slug curto do
  assunto, ex: `seo-fase-1-jsonld-schemas`.
- **Deploy na VPS**: sempre a partir de `seo`, nunca de um branch
  de fase específico ainda não mergeado — senão a VPS roda o meio de
  uma fase ainda não revisada.

## Passo a passo manual

**Início da fase:**
```bash
git checkout seo
git pull --ff-only  # se tiver remoto
git checkout -b seo-fase-1-jsonld-schemas
```

Cole só o prompt daquela fase específica pro Claude Code (nunca o
roadmap inteiro), trabalhe em plan mode, revise o diff, aprove.

**Fim da fase**, depois de revisado e aprovado:
```bash
git checkout seo
git merge --no-ff seo-fase-1-jsonld-schemas
git tag -a seo-fase-1-done -m "Fase 1 completa: JSON-LD tipado"
git branch -d seo-fase-1-jsonld-schemas
```

O `--no-ff` é o detalhe que importa: força um commit de merge mesmo
quando daria fast-forward, então `git log --graph` mostra visualmente
onde cada fase começou e terminou, em vez de virar uma linha reta
indistinguível do resto.

A tag (`seo-fase-N-done`) dá um ponto de restauração nomeado — útil se
algo quebrar semanas depois e você precisar isolar "funcionava até
aqui", sem depender de lembrar o hash do commit certo.

## Scripts de automação

Repetir esses passos manualmente 6+ vezes (uma por fase) é onde erro de
digitação em nome de branch/tag entra. Dois scripts pequenos resolvem,
sem precisar de nada sofisticado:

`scripts/fase-start.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Uso: scripts/fase-start.sh <numero> <slug-curto>"
  echo "Exemplo: scripts/fase-start.sh 1 jsonld-schemas"
  exit 1
fi

NUM="$1"
SLUG="$2"
BRANCH="seo-fase-${NUM}-${SLUG}"

git checkout seo
git pull --ff-only origin seo 2>/dev/null || true
git checkout -b "$BRANCH"

echo "Branch criado: $BRANCH"
echo "Trabalhe com o Claude Code agora (plan mode). Ao terminar, rode:"
echo "  scripts/fase-finish.sh $NUM $SLUG"
```

`scripts/fase-finish.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Uso: scripts/fase-finish.sh <numero> <slug-curto>"
  exit 1
fi

NUM="$1"
SLUG="$2"
BRANCH="seo-fase-${NUM}-${SLUG}"
TAG="seo-fase-${NUM}-done"

git checkout seo
git merge --no-ff "$BRANCH" -m "merge: Fase ${NUM} (${SLUG}) concluída"
git tag -a "$TAG" -m "Fase ${NUM} completa: ${SLUG}"
git branch -d "$BRANCH"

echo "Fase ${NUM} mergeada em seo e taggeada como ${TAG}."
echo "Não esqueça:"
echo "  git push origin seo --tags   (se tiver remoto)"
echo "  deploy na VPS a partir de seo"
```

```bash
chmod +x scripts/fase-start.sh scripts/fase-finish.sh
```

Uso:
```bash
scripts/fase-start.sh 1 jsonld-schemas
# ... trabalho com Claude Code ...
scripts/fase-finish.sh 1 jsonld-schemas
```

Propositalmente simples — sem detectar branch atual sujo, sem
confirmação interativa. Se algo sair errado, os comandos git por trás
são os mesmos do passo a passo manual, então dá pra terminar na mão sem
ficar preso ao script.

### Testar em produção antes da fase terminar (`--checkpoint`)

Às vezes vale testar um commit intermediário em produção antes da fase
estar 100% completa — o fluxo básico só previa merge final. Pra isso
sem quebrar o princípio de nunca commitar solto direto em `seo`,
`fase-finish.sh` aceita um 3º argumento opcional `--checkpoint`:

```bash
scripts/fase-finish.sh 1 jsonld-schemas --checkpoint
```

Isso faz merge `--no-ff` do branch de fase em `seo` (pronto pra
deploy na VPS), mas **sem tag e sem apagar o branch** — o `git
checkout` volta pro branch de fase logo em seguida, e o trabalho da
fase continua normalmente. Pode ser chamado quantas vezes forem
necessárias. Só quando a fase estiver de fato concluída, roda o
comando final (sem `--checkpoint`), que aí sim cria a tag
`seo-fase-N-done` e apaga o branch.

## Convenção de commit

Um commit por passo lógico dentro da fase, não um commit gigante no
final. Formato [Conventional Commits](https://www.conventionalcommits.org/)
(`feat`, `fix`, `test`, `docs`, `refactor`), sempre com escopo `(seo)`
pra ficar grep-ável (`git log --oneline --grep seo`):

```
feat(seo): add FaqPageData, PersonData, ProductData, ArticleData schemas

Introduces dataclasses in core/seo_schemas.py to replace free JSON
in type_specific_data. Part of Fase 1 (JSON-LD tipado).
```

```
feat(seo): validate type_specific_data against page_type in resolve_seo()

Falls back gracefully when saved data predates the schema (soft
migration, no data loss for existing pages).
```

O corpo do commit deve explicar o **porquê**, não repetir o diff — é
isso que uma sessão futura do Claude Code lê pra entender uma decisão
sem precisar que você reexplique.

## Comando `/commit`: comentário separado do trabalho

Ideia melhor que uma *sessão* dedicada a escrever comentário: um
**comando customizado** do Claude Code, chamado no fim da mesma sessão
que já fez o trabalho — não uma sessão nova.

Motivo de não usar sessão separada: a sessão que fez a mudança já tem
todo o contexto (por que essa dataclass, por que esse fallback) sem
gastar tokens reconstruindo isso a partir do diff puro. Uma sessão nova
teria que inferir o "porquê" só olhando código — mais lento, mais caro,
mais chance de errar a intenção.

Crie `.claude/commands/commit.md`:
```markdown
Olhe o diff staged (`git diff --cached`). Escreva uma mensagem de
commit seguindo Conventional Commits com escopo `(seo)`, no formato:

feat(seo): <resumo curto no imperativo>

<corpo explicando o porquê da mudança, não o que já é óbvio pelo diff>
<referência à fase do roadmap, se aplicável>

Não faça o commit — só mostre a mensagem proposta pra eu revisar.
```

Uso: depois de `git add`, dentro da sessão que já fez o trabalho, rode
`/commit`. Ele já tem o contexto todo, então não precisa "adivinhar" —
só formatar de acordo com a convenção.

## Outras sugestões

- **Arquivo de status das fases**, `docs/seo/status-fases.md`, tabela
  simples (fase, branch, tag, data do merge) — mais rápido de ler numa
  sessão nova do que rodar `git log --graph` e interpretar. Opcional:
  só vale se você sentir que consultar isso manualmente toda sessão
  está custando tempo; senão as tags já dão conta.
- **Push da tag junto do branch**: `git push origin seo --tags`
  depois de cada `fase-finish.sh`, se `seo` também vive num
  remoto — sem isso a tag só existe local e se perde se a máquina
  falhar.
- **Não proteger `seo` contra commit direto** por enquanto — você
  trabalha sozinho, então a disciplina de sempre passar por um branch
  de fase é sua, não precisa de trava técnica de branch protection do
  GitHub ainda. Vale reconsiderar só se algum dia outra pessoa entrar
  no projeto.
- **Squash não** — merge `--no-ff` preserva os commits individuais de
  cada passo da fase, o que é justamente o que ajuda o Claude Code a
  entender a evolução passo a passo depois. Squash colapsaria isso
  numa única mensagem, perdendo o histórico granular.

## Checklist rápido

- [ ] Nova fase: `scripts/fase-start.sh <numero> <slug>`
- [ ] Trabalhar em plan mode, colar só o prompt daquela fase
- [ ] Um commit por passo lógico, `feat(seo): ...`, corpo explicando o
      porquê
- [ ] `/commit` no fim de cada passo pra gerar a mensagem (mesma
      sessão, não sessão nova)
- [ ] Fim da fase, já revisado e aprovado:
      `scripts/fase-finish.sh <numero> <slug>`
- [ ] Push do branch + tags, se houver remoto
- [ ] Deploy na VPS sempre a partir de `seo`, nunca de um branch
      de fase isolado
