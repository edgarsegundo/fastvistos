# Padrão de branches por fase (SEO/GEO/AEO)

Como estruturar branches, commits e scripts pra trabalhar fase por fase
no roadmap de SEO/GEO/AEO — e reaproveitar esse padrão em qualquer
trabalho futuro dividido em fases.

Índice:
- [Dia a dia — exemplo rápido](#dia-a-dia--exemplo-rápido)
- [Princípio](#princípio)
- [Estrutura de branches](#estrutura-de-branches)
- [Scripts de automação](#scripts-de-automação)
- [Convenção de commit](#convenção-de-commit)
- [Comando `/commit`](#comando-commit)
- [Checklist rápido](#checklist-rápido)

---

## Dia a dia — exemplo rápido

**Início da fase:**
```bash
scripts/fase-start.sh 1 jsonld-schemas
```
Cria `seo-fase-1-jsonld-schemas`, já pronto pra trabalhar. Abre uma sessão
nova do Claude Code, cola só o prompt da fase (de
[prompts-claude-code-seo-geo-aeo.md](seo/prompts-claude-code-seo-geo-aeo.md)),
trabalha em plan mode.

**Durante a fase (quando quer testar em produção antes de terminar):**
```bash
scripts/fase-finish.sh --checkpoint
```
Mergeia em `seo` sem apagar o branch — você continua na fase, pronto pra
mais commits. Deploy na VPS a partir de `seo` pra validar.

**Fim da fase (quando tudo está pronto):**
```bash
scripts/fase-finish.sh
```
Mergeia em `seo`, cria tag `seo-fase-N-done`, apaga o branch. Pronto pra próxima fase.

**Push quando terminar tudo:**
```bash
git push origin seo --tags
```

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
  a fase está em progresso). Ex: `seo-fase-1-jsonld-schemas`.
- **Deploy na VPS**: sempre a partir de `seo`, nunca de um branch
  de fase específico ainda não mergeado.

## Scripts de automação

Dois scripts pequenos em [`scripts/`](../../scripts/) evitam erro de
digitação em nome de branch/tag:

- **[`fase-start.sh`](../../scripts/fase-start.sh)** — cria branch
  `seo-fase-N-slug` a partir de `seo`. Detecta automaticamente se você
  estiver dentro de um branch de fase.
- **[`fase-finish.sh`](../../scripts/fase-finish.sh)** — mergeia o
  branch de fase em `seo`. Aceita `--checkpoint` pra teste parcial
  (sem tag, branch continua) ou roda final (com tag, apaga branch).
  Detecta número/slug a partir do branch atual se você omitir argumentos.

Ambos usam merge `--no-ff` (força commit de merge mesmo em fast-forward),
então `git log --graph` mostra visualmente onde cada fase começou/terminou.
Tags (`seo-fase-N-done`) são pontos de restauração — útil se algo quebrar
semanas depois.

## Convenção de commit

Um commit por passo lógico, não um gigante no final. [Conventional Commits](https://www.conventionalcommits.org/)
(`feat`, `fix`, `test`, `docs`, `refactor`) com escopo `(seo)` — grep-ável com
`git log --oneline --grep seo`. O **corpo do commit deve explicar o porquê**,
não repetir o diff — sessões futuras leem o commit pra entender uma decisão
sem precisar que você reexplique.

## Comando `/commit`

Slash command customizado em [`.claude/commands/commit.md`](.claude/commands/commit.md).
Depois de `git add`, rode `/commit` — lê o `git diff --cached` e propõe uma
mensagem Conventional Commits `(seo)` **sem commitar sozinho** — só mostra a sugestão.

Por que não sessão separada: a sessão que fez a mudança tem todo o contexto
(por que essa mudança, que problema resolve) sem gastar tokens reconstruindo
tudo a partir do diff. Uma sessão nova teria que adivinhar a intenção só
olhando código — mais lento, mais caro, mais chance de errar.

## Observações

- **Push das tags**: `git push origin seo --tags` depois de cada `fase-finish.sh`
  sem `--checkpoint` — tags só localmente se perdem numa falha de máquina.
- **Sem squash**: merge `--no-ff` preserva commits individuais de cada passo.
  Squash colapsaria o histórico e perderia o granular que o Claude Code lê.

## Checklist de uma fase

1. `scripts/fase-start.sh <numero> <slug>` — cria branch
2. Trabalhar em plan mode (Claude Code), só o prompt da fase
3. Um commit por passo lógico, `/commit` pra gerar mensagem
4. `scripts/fase-finish.sh --checkpoint` (testar em VPS)
5. `scripts/fase-finish.sh` (merge final + tag)
6. `git push origin seo --tags`
7. Deploy na VPS a partir de `seo`
