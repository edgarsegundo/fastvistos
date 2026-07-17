# Como documentar este projeto (guia vivo)

Notas pessoais sobre como organizar a documentação do `vitrine` (e possivelmente de outros projetos), pra não ficar reinventando toda vez que bater a dúvida "junto tudo num arquivo ou quebro em vários?".

## Os 4 tipos de documentação (framework Diátaxis)

Toda dúvida de organização geralmente vem de misturar tipos diferentes de conteúdo no mesmo lugar. Separe por **tipo de pergunta que o leitor tem**, não por tamanho de arquivo:

| Tipo | Pergunta que responde | Característica | Pasta sugerida |
|---|---|---|---|
| **Tutorial** | "Como faço X, passo a passo, aprendendo?" | Sequencial, numerado, feito pra ser lido em ordem | `tutoriais-dia-a-dia/` |
| **How-to** | "Como resolvo esse problema específico agora?" | Direto ao ponto, não precisa de ordem, cada arquivo é independente | `troubleshooting/` |
| **Referência** | "Qual é o comando/parâmetro/valor exato de X?" | Lookup técnico, organizado por nome (alfabético), não por sequência | (a criar quando precisar) |
| **Explicação/Decisão** | "Por que fizemos assim e não de outro jeito?" | Contexto, trade-offs, raciocínio por trás de uma escolha | `decisoes/` |

Referência: https://diataxis.fr/

## Regra prática: juntar ou quebrar em arquivos?

- **Quebre** quando o leitor normalmente busca aquele assunto sozinho (ex: alguém quer só "como rodar o servidor", sem contexto de outra coisa).
- **Junte/mantenha em sequência** quando os textos só fazem sentido lidos em ordem, um dependendo do anterior (como os tutoriais numerados).
- Se você está em dúvida entre juntar ou quebrar, é sinal de que o conteúdo provavelmente mistura dois tipos da tabela acima — separar por tipo geralmente resolve a dúvida.

## Evite duplicar conteúdo que muda rápido

Comandos exatos, versões de pacote, flags de CLI — essas coisas mudam. Prefira linkar pra documentação oficial da lib/framework em vez de copiar o conteúdo, senão o doc apodrece (fica desatualizado sem ninguém perceber).

## Convenção de nomes usada aqui

- `00-`, `01-`, `02-`... como prefixo quando a ordem de leitura importa (tutoriais).
- `README` no nome quando o arquivo é o índice/ponto de entrada de uma pasta (ex: `01-README-index.md`).
- Sem numeração em pastas tipo `decisoes/` e `troubleshooting/`, pois cada arquivo é independente — o nome do arquivo (não a ordem) é o que ajuda a achar.

## Ideias para evoluir isso no futuro

- Quando `troubleshooting/` crescer, considerar um índice simples listando os problemas cobertos (título = sintoma, não solução — facilita achar via Ctrl+F).
- Quando surgir necessidade de "referência" (ex: lista de env vars, lista de comandos manage.py customizados), criar pasta `referencia/` separada dos tutoriais.
- Revisitar este arquivo de tempos em tempos e adicionar o que aprender de novo sobre organização de docs.
