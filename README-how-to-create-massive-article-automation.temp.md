# Sequence of Prompts

## PROMPT 1

Analise a lista de termos de busca abaixo e identifique temas principais que permitam agrupar essas consultas em categorias lógicas.
Não inclua as consultas na resposta — apresente apenas os temas, de forma clara e resumida.

**Requerimentos**:
- Saída deve ter no mínimo 30 temas
- Não repetir temas alterando só uma palavra, por exemplo: Visto para Psicólogos, Visto para Engenheiros, Visto para Veterinários, etc.

**Exemplo de entrada:**

```
160 visto americano  
214b visto negado  
221g visto americano  
a embaixada americana está emitindo visto
```

**Exemplo de saída esperada:**

```json
[
	{
		"theme": "Formulário DS-160",
		"description": "Inclui preenchimento, acesso, confirmação, pagamento e dúvidas sobre o formulário principal de solicitação de visto"
	},
	...
]
```

---

```
160 visto americano
214b visto negado
221g visto americano
a embaixada americana esta emitindo visto
a entrevista do visto americano é em ingles
a entrevista no consulado americano é em português
a entrevista para o visto americano é em ingles
acessar ds 160
acessar formulario ds 160
acessar formulario ds 160 preenchido
acessoria de visto americano
acessoria visto americano
agencia de turismo visto americano
agencia de visto americano
agência de visto americano
agencia imigração estados unidos
agencia para tirar visto americano
agência para tirar visto americano
agencia para visto americano
agencia que ajuda a tirar visto
agencia visto americano
agência visto americano
agenda casv
agenda consulado americano
agenda consulado americano sp
agenda de entrevista para visto americano
agenda de visto americano
agenda de visto americano sp
agenda do consulado americano
agenda para entrevista visto americano
agenda para visto americano
agenda para visto americano 2022
agenda visto americano 2022
agenda visto americano 2023
agenda visto americano brasilia
agenda visto americano porto alegre
agenda visto americano sp
agendamento americano
agendamento casv
agendamento casv 2022
agendamento casv datas
agendamento casv e consulado
agendamento casv e consulado mesmo dia
agendamento casv porto alegre
agendamento casv sao paulo
agendamento casv são paulo
agendamento casv sp
agendamento casv visto
agendamento casv visto americano
agendamento consulado americano
agendamento consulado americano em sao paulo
agendamento consulado americano porto alegre
agendamento consulado americano sao paulo
agendamento consulado americano são paulo
agendamento consulado americano sp
agendamento consulado americano visto
agendamento consulado brasileiro em nova york
agendamento consulado estados unidos
agendamento consulado sao paulo
agendamento consular e casv
agendamento consular visto americano
agendamento da entrevista do visto americano
agendamento de entrevista consulado americano
agendamento de entrevista consulado americano sp
agendamento de entrevista de visto
agendamento de entrevista de visto americano
agendamento de entrevista no consulado americano
agendamento de entrevista para passaporte
agendamento de entrevista para visto americano
agendamento de entrevista para visto americano em brasilia
agendamento de entrevista visto
agendamento de entrevista visto americano
agendamento de passaporte americano
agendamento de renovação de visto americano
agendamento de visto
agendamento de visto americano
agendamento de visto americano 2022
agendamento de visto americano 2023
agendamento de visto americano brasilia
agendamento de visto americano casv
agendamento de visto americano datas
agendamento de visto americano em brasilia
agendamento de visto americano em brasília
agendamento de visto americano em porto alegre
agendamento de visto americano em sao paulo
agendamento de visto americano em são paulo
agendamento de visto americano em sp
agendamento de visto americano porto alegre
agendamento de visto americano sao paulo
agendamento de visto americano site
agendamento de visto americano sp
agendamento de visto consulado americano
agendamento de visto consulado americano sp
agendamento de visto em porto alegre
agendamento de visto em sao paulo
agendamento de visto em sp
agendamento de visto estados unidos
agendamento de visto na embaixada americana em brasilia
agendamento de visto no consulado americano
agendamento de visto para estados unidos
agendamento de visto para os estados unidos
agendamento de vistos americanos
agendamento do casv
agendamento do consulado americano
agendamento do visto
agendamento do visto americano
agendamento do visto americano 2022
agendamento do visto americano em brasilia
agendamento do visto americano em sp
agendamento do visto americano sp
agendamento do visto mexicano
agendamento ds 160
agendamento ds160
agendamento e pagamento visto americano
agendamento embaixada americana
agendamento emergencial visto americano
agendamento entrevista consulado
agendamento entrevista consulado americano
agendamento entrevista consulado americano sao paulo
agendamento entrevista para visto americano
agendamento entrevista passaporte
agendamento entrevista visto
agendamento entrevista visto americano
agendamento entrevista visto americano 2022
agendamento entrevista visto americano brasilia
agendamento entrevista visto americano em sao paulo
agendamento entrevista visto americano porto alegre
agendamento entrevista visto americano sao paulo
agendamento entrevista visto americano sp
agendamento entrevista visto estados unidos
agendamento entrevista visto mexicano
agendamento familiar visto americano
agendamento no casv
agendamento no casv o que levar
agendamento no casv sp
agendamento no consulado americano
agendamento online visto americano
agendamento para entrevista de visto americano
agendamento para entrevista no consulado americano
agendamento para o visto
agendamento para o visto americano
agendamento para passaporte americano
agendamento para renovacao de visto americano
agendamento para renovação de visto americano
agendamento para renovação de visto americano sp
agendamento para renovação do visto americano
agendamento para renovar visto americano
agendamento para retirada de visto americano
agendamento para tirar o visto
agendamento para tirar o visto americano
agendamento para tirar visto
agendamento para tirar visto americano em sp
agendamento para visto
agendamento para visto americano
agendamento para visto americano 2022
agendamento para visto americano 2023
agendamento para visto americano em brasilia
agendamento para visto americano em sao paulo
agendamento para visto americano sp
agendamento para visto estados unidos
agendamento para visto mexicano
agendamento passaporte americano
agendamento renovação de visto americano
agendamento renovação passaporte americano
agendamento renovacao visto
agendamento renovação visto americano
agendamento renovação visto americano datas disponíveis 2021
agendamento renovação visto americano datas disponíveis 2022
agendamento renovação visto americano sp
agendamento retirada passaporte casv
agendamento retirada passaporte visto americano
agendamento retirada visto
agendamento retirada visto americano
agendamento visto
agendamento visto 2022
agendamento visto 2023
agendamento visto americano
agendamento visto americano 2022
agendamento visto americano 2023
agendamento visto americano brasil
agendamento visto americano brasilia
agendamento visto americano brasília
agendamento visto americano casv
agendamento visto americano consulado
agendamento visto americano data
agendamento visto americano datas disponiveis
agendamento visto americano datas disponíveis
agendamento visto americano datas disponíveis 2020
agendamento visto americano datas disponíveis 2021
agendamento visto americano datas disponíveis 2022
agendamento visto americano datas disponíveis 2022 porto alegre
agendamento visto americano datas disponíveis 2022 sp
agendamento visto americano datas disponíveis 2023
agendamento visto americano em brasilia
agendamento visto americano em sao paulo
agendamento visto americano em são paulo
agendamento visto americano em sp
agendamento visto americano familia
agendamento visto americano formulario ds 160
agendamento visto americano login
agendamento visto americano passo a passo
agendamento visto americano porto alegre
agendamento visto americano porto alegre 2022
agendamento visto americano prazo
agendamento visto americano renovação
agendamento visto americano sao paulo
agendamento visto americano são paulo
agendamento visto americano site
agendamento visto americano site oficial
agendamento visto americano sp
agendamento visto americano sp site oficial
agendamento visto americano turismo
agendamento visto americano turista
agendamento visto americano urgente
agendamento visto casv
agendamento visto consulado
agendamento visto consulado americano
agendamento visto consulado americano em sao paulo
agendamento visto consulado americano sp
agendamento visto consulado mexicano
agendamento visto embaixada americana
agendamento visto embaixada americana brasilia
agendamento visto estados unidos
agendamento visto estados unidos brasilia
agendamento visto estados unidos rio de janeiro
agendamento visto eua porto alegre
agendamento visto j1
agendamento visto para estados unidos
agendamento visto porto alegre
agendamento visto sao paulo
agendamento visto são paulo
agendamento visto sp
agendamento visto turismo americano datas disponíveis 2021
agendamento visto usa sp
agendamento vistos
agendar casv
agendar casv e consulado em cidades diferentes
agendar casv e consulado no mesmo dia
agendar casv sao paulo
agendar casv sp
agendar casv visto americano
agendar consulado americano
agendar data para visto americano
agendar data visto americano
agendar ds 160
agendar ds160
agendar entrevista casv
agendar entrevista consulado
agendar entrevista consulado americano
agendar entrevista consulado americano sao paulo
agendar entrevista consulado americano sp
agendar entrevista consulado mexicano
agendar entrevista de passaporte
agendar entrevista de visto
agendar entrevista de visto americano
agendar entrevista do visto
agendar entrevista do visto americano
agendar entrevista embaixada americana
agendar entrevista no casv
agendar entrevista no consulado
agendar entrevista no consulado americano
agendar entrevista no consulado americano sp
agendar entrevista para o visto americano
agendar entrevista para passaporte
agendar entrevista para retirar documentos
agendar entrevista para tirar passaporte
agendar entrevista para visto
agendar entrevista visto
agendar entrevista visto americano
agendar entrevista visto americano brasilia
agendar entrevista visto americano casv
agendar entrevista visto americano familia
agendar entrevista visto americano site oficial
agendar entrevista visto americano sp
agendar entrevista visto mexicano
agendar entrevista visto porto alegre
agendar o visto
agendar o visto americano
agendar o visto americano sp
agendar para tirar o visto americano
agendar para tirar visto americano
agendar para visto americano
agendar passaporte americano
agendar renovacao de visto
agendar renovação de visto
agendar renovacao de visto americano
agendar renovação de visto americano
agendar renovacao de visto americano em sao paulo
agendar renovação do visto americano
agendar renovação visto americano
agendar retirada de passaporte casv
agendar retirada de passaporte no casv
agendar retirada de passaporte visto americano
agendar retirada de visto
agendar retirada de visto americano
agendar retirada do visto
agendar retirada do visto americano
agendar retirada visto americano
agendar solicitação de visto americano
agendar tirar visto americano
agendar visita consulado americano
agendar visita visto americano
agendar visto
agendar visto americano
agendar visto americano 2022
agendar visto americano 2023
agendar visto americano belo horizonte
agendar visto americano brasilia
agendar visto americano casv
agendar visto americano consulado sp
agendar visto americano em porto alegre
agendar visto americano em sao paulo
agendar visto americano em sp
agendar visto americano porto alegre
agendar visto americano sao paulo
agendar visto americano turista
agendar visto casv
agendar visto consulado
agendar visto consulado americano
agendar visto consulado mexicano
agendar visto de estudante americano
agendar visto de passaporte
agendar visto em porto alegre
agendar visto em sao paulo
agendar visto em sp
agendar visto embaixada americana
agendar visto estados unidos
agendar visto j1
agendar visto no consulado americano
agendar visto para estados unidos
agendar visto para os estados unidos
agendar visto passaporte
agendar visto porto alegre
agendar visto sao paulo
agendar visto são paulo
agendar visto sem passaporte
agendar vistos
ajuda
ajuda para preencher ds 160
ajuda para preencher o formulario ds 160
ajuda para tirar o visto americano
ajuda para tirar visto americano
ajuda preenchimento ds 160
ajuda visto americano
america
américa visto
america visto acessoria
america visto assessoria
america vistos
américa vistos
america vistos assessoria
america vistos shopping
american visa assessoria em vistos
american vistos
americano consulado
americano pode entrar no brasil
americano precisa de visto para entrar no brasil 2021
americano precisa de visto para o brasil
americano visto brasil
americano visto para entrar no brasil
americanos visto brasil
americanos visto para o brasil

aplicação de visto americano
aplicação visto americano
aplicar para o visto americano
aplicar para visto americano
aplicar visto americano

apos preencher ds 160 como pagar
após preencher ds 160 como pagar
apos preencher ds 160 o que fazer
apos preencher formulario ds 160 o que fazer
apos preencher o ds 160
após preencher o ds 160 o que devo fazer
apos preencher o ds 160 o que fazer
após preencher o formulário ds 160
aposentado consegue visto americano
application id visto americano
argentino precisa de visto para entrar nos estados unidos
assessoria de visto
assessoria de visto americano
assessoria para tirar visto
assessoria para tirar visto americano
assessoria para visto
assessoria para visto americano
assessoria visto
assessoria visto americano
assessoria visto americano turista
atendimento consulado americano
atendimento visto americano
atualizar ds160
atualizar visto americano
auxilio visto americano
b1 b2 visto
b1 b2 visto americano
b1 e b2 visto
b1 visto
b2 visto
bebê precisa de visto americano
boleto consulado americano
boleto do visto americano
boleto ds 160
boleto ds160
boleto para visto americano
boleto visto americano
brasil estados unidos visto
brasil visto americano
brasil visto estados unidos
brasil visto eua
brasileiro com passaporte europeu pode entrar nos estados unidos
brasileiro precisa de visto para conexao nos estados unidos
brasileiro precisa de visto para entrar nos estados unidos
brasileiro precisa de visto para estados unidos
brasileiro precisa de visto para o estados unidos
brasileiro precisa de visto para os estados unidos
brasileiro visto estados unidos
brasileiros precisam de visto para entrar nos estados unidos
brasileiros precisam de visto para estados unidos
brasileiros precisam de visto para os estados unidos
brasilia consulado americano
buscar visto americano
cadastro para visto americano
cadastro visto americano
canadense precisa de visto para entrar nos estados unidos
canadense precisa de visto para os estados unidos
casv
casv agendamento
casv agendamento 2022
casv agendamento de visto
casv agendamento retirada passaporte
casv agendamento sao paulo
casv agendamento sp
casv agendamento telefone
casv agendamento visto
casv agendamento visto americano
casv agendar
casv americano
casv belo horizonte
casv brasil
casv brasília está funcionando
casv consulado
casv consulado americano
casv de sao paulo
casv documentos
casv documentos necessários
casv documentos para levar
casv ds 160
casv e consulado
casv e consulado no mesmo dia
casv e entrevista no mesmo dia
casv em porto alegre
casv em sao paulo
casv em são paulo
casv o que é
casv o que levar
casv ou consulado primeiro
casv pagamento de taxa
casv passaporte
casv porto alegre
casv porto alegre agendamento
casv reagendar
casv renovacao de visto
casv renovação de visto
casv sao paulo
casv são paulo
casv são paulo agendamento
casv são paulo sp
casv são paulo vila mariana
casv site
casv site oficial
casv sp agendamento
casv visa
casv visto
casv visto agendamento
casv visto americano
casv visto americano agendamento
casv visto americano brasilia
casv visto americano sao paulo
casv visto sao paulo
categoria de visto americano
categoria de vistos americanos
categoria visto americano
categoria visto americano turista
categorias de visto americano
categorias visto americano
ceac visto
ceac visto agendamento
ceac visto americano
celestino visto americano
centro de visto japones
centro de visto japonês
chacara santo antonio consulado americano
chileno precisa de visto para entrar nos estados unidos
cidadania italiana entrar nos estados unidos
cidadania italiana estados unidos
cidadania italiana nos estados unidos
cidadania italiana pode entrar nos estados unidos
cidadania italiana pode morar nos estados unidos
cidadania italiana precisa de visto americano
cidadania italiana visto americano
cidadão italiano nos estados unidos
cidadão italiano pode morar nos estados unidos
cidadão italiano pode trabalhar nos estados unidos
cidadão italiano precisa de visto americano
cidadão italiano precisa de visto para entrar nos estados unidos
cidadão italiano precisa de visto para os estados unidos
cidades para tirar visto americano no brasil
cidades visto americano brasil
com passaporte italiano posso morar nos estados unidos
com passaporte italiano preciso de visto americano
com quantos anos pode tirar o visto americano
com visto canadense posso entrar nos estados unidos
como agendar e pagar visto americano
como conseguir o visto de turista
como conseguir o visto de turista para os estados unidos
como conseguir um visto de turista para os estados unidos
como conseguir visto americano de turista
como conseguir visto americano para turismo
como conseguir visto americano turismo
como conseguir visto de turista
como conseguir visto de turista para os estados unidos
como criar conta para pagar taxa de visto americano
como efetuar o pagamento da taxa do visto americano
como emitir a taxa de visto americano
como emitir a taxa do visto americano
como emitir a taxa mrv para visto americano
como emitir boleto do visto americano
como emitir boleto para pagamento do visto americano
como emitir boleto para visto americano
como emitir boleto visto americano
como emitir o boleto do visto americano
como emitir o boleto para pagamento do visto americano
como emitir o boleto para pagar o visto americano
como emitir taxa de visto americano
como emitir taxa visto americano
como faço para pagar a taxa de visto americano
como faço para pagar a taxa do visto americano
como faço para tirar visto americano turista
como fazer o pagamento da taxa do visto americano
como fazer o pagamento do visto americano
como fazer para pagar a taxa do visto americano
como gerar a taxa do visto americano
como gerar boleto da taxa do visto americano
como gerar boleto do visto americano
como gerar boleto mrv visto americano
como gerar boleto para pagamento de taxa de visto americano
como gerar boleto para pagamento de visto americano
como gerar boleto para pagar visto americano
como gerar boleto para visto americano
como gerar boleto taxa visto americano
como gerar boleto visto americano
como gerar guia para pagamento de visto americano
como gerar o boleto da taxa do visto americano
como gerar o boleto de pagamento do visto americano
como gerar o boleto do visto americano
como gerar o boleto para pagamento do visto americano
como gerar o boleto para pagar a taxa mrv
como gerar o boleto para pagar o visto americano
como gerar taxa visto americano
como imprimir a taxa de pagamento do visto americano
como imprimir a taxa de visto americano
como imprimir a taxa do visto americano
como imprimir o boleto da taxa de visto americano
como imprimir o boleto do visto americano
como imprimir o boleto para pagamento do visto americano
como imprimir taxa de visto americano
como pagar a ds 160
como pagar a guia do visto americano
como pagar a taxa consular visto americano
como pagar a taxa de renovação de visto americano
como pagar a taxa de renovação do visto americano
como pagar a taxa de solicitação de visto americano
como pagar a taxa de visto
como pagar a taxa de visto americano
como pagar a taxa de visto americano 2021
como pagar a taxa de visto americano 2022
como pagar a taxa do consulado americano
como pagar a taxa do ds 160
como pagar a taxa do formulario ds 160
como pagar a taxa do visto
como pagar a taxa do visto americano
como pagar a taxa do visto americano 2020
como pagar a taxa do visto americano 2021
como pagar a taxa do visto americano 2022
como pagar a taxa do visto americano ds 160
como pagar a taxa do visto americano e agendar entrevista
como pagar a taxa do visto americano passo a passo
como pagar a taxa do visto ds 160
como pagar a taxa ds 160
como pagar a taxa mrv
como pagar a taxa mrv do visto americano
como pagar a taxa mrv para visto americano
como pagar a taxa para o visto americano
como pagar a taxa para tirar o visto americano
como pagar a taxa para visto americano
como pagar a taxa visto americano
como pagar ds 160
como pagar mrv visto americano
como pagar o boleto do visto americano
como pagar o ds 160
como pagar o ds160
como pagar o formulario ds 160
como pagar o mrv visto americano
como pagar o visto americano
como pagar o visto americano 2022
como pagar o visto ds 160
como pagar taxa de renovação de visto americano
como pagar taxa de visto
como pagar taxa de visto americano
como pagar taxa do visto americano
como pagar taxa do visto americano 2022
como pagar taxa ds 160
como pagar taxa mrv
como pagar taxa mrv visto americano
como pagar taxa para visto americano
como pagar taxa renovação visto americano
como pagar taxa visto
como pagar taxa visto americano
como pagar taxa visto americano 2021
como pagar taxa visto americano 2022
como pagar visto americano 2022
como preencher o ds 160 turista
como preencher o formulário ds 160 turista
como solicitar o visto americano para turismo
como solicitar visto americano turista
como solicitar visto de turista para os estados unidos
como tirar o visto americano de turista
como tirar o visto americano de turista 2022
como tirar o visto americano para turismo
como tirar o visto americano turista
como tirar o visto de turista
como tirar o visto de turista americano
como tirar o visto de turista para os estados unidos
como tirar o visto para os estados unidos de turista
como tirar o visto turista americano
como tirar um visto de turista
como tirar visto americano b1 b2
como tirar visto americano de turismo
como tirar visto americano para turismo
como tirar visto americano turista
como tirar visto americano turista passo a passo
como tirar visto b1
como tirar visto b1 b2
como tirar visto de turismo para os estados unidos
como tirar visto de turista
como tirar visto de turista americano
como tirar visto de turista para estados unidos
como tirar visto turismo americano
como tirar visto turista americano
como tirar visto turista estados unidos
comprovante agendamento visto americano
comprovante de agendamento visto americano
confirmação agendamento casv
confirmação agendamento visto americano
confirmação da ds 160
confirmação de agendamento casv
confirmação de agendamento visto americano
confirmação de formulário ds 160
confirmação de preenchimento da ds 160
confirmação do agendamento casv
confirmação do ds 160
confirmação do formulário ds 160
confirmação ds 160
confirmação formulario ds 160
confirmação formulário ds 160
conseguir o visto americano
conseguir visto americano
consul americana
cônsul americano
consul dos estados unidos
consulado agendamento visto americano
consulado agendar visto
consulado amer
consulado americana
consulado americana no brasil
consulado americano
consulado americano 2022
consulado americano agendamento
consulado americano agendamento de entrevista
consulado americano agendamento de visto
consulado americano agendamento entrevista
consulado americano agendamento sp
consulado americano agendamento visto
consulado americano agendamento visto sp
consulado americano agendar
consulado americano agendar entrevista
consulado americano agendar visto
consulado americano belo horizonte
consulado americano belo horizonte está funcionando
consulado americano boa vista
consulado americano br
consulado americano brasil agendamento visto
consulado americano brasil sao paulo
consulado americano brasil visto
consulado americano brasileiro
consulado americano brasilia
consulado americano brasília
consulado americano brasília agendamento
consulado americano brasilia visto
consulado americano brasília visto
consulado americano cancela entrevistas
consulado americano cancela entrevistas 2022
consulado americano casv
consulado americano chacara santo antonio
consulado americano chácara santo antônio
consulado americano contato
consulado americano datas
consulado americano datas disponiveis
consulado americano de belo horizonte
consulado americano de brasilia
consulado americano de porto alegre
consulado americano de sao paulo
consulado americano de são paulo
consulado americano df
consulado americano do brasil
consulado americano documentos
consulado americano documentos para visto
consulado americano ds160
consulado americano duvidas
consulado americano em
consulado americano em belo horizonte
consulado americano em brasil
consulado americano em brasilia
consulado americano em brasília
consulado americano em brasilia visto
consulado americano em minas gerais
consulado americano em poa
consulado americano em porto alegre
consulado americano em porto alegre agendamento
consulado americano em porto alegre já está funcionando
consulado americano em recife está funcionando
consulado americano em ribeirao preto
consulado americano em santa catarina
consulado americano em sao paulo
consulado americano em são paulo
consulado americano em sao paulo agendamento
consulado americano em sao paulo sp
consulado americano em sao paulo visto
consulado americano em sao paulo vistos
consulado americano endereços
consulado americano entrevista visto
consulado americano espirito santo
consulado americano esta
consulado americano esta fechado
consulado americano esta funcionando
consulado americano está funcionando
consulado americano estados unidos
consulado americano eua
consulado americano fale conosco
consulado americano fechado
consulado americano formulario
consulado americano formulario ds 160
consulado americano green card
consulado americano henri dunant
consulado americano humaita
consulado americano humaitá
consulado americano informações
consulado americano jobs
consulado americano lapa
consulado americano locais
consulado americano mais proximo
consulado americano mais próximo
consulado americano marcar entrevista
consulado americano marcar visto
consulado americano minas gerais
consulado americano na vila mariana
consulado americano natal
consulado americano no brasil
consulado americano no brasil agendamento
consulado americano no brasil cidades
consulado americano no brasil está funcionando
consulado americano no brasil locais
consulado americano no brasil para visto
consulado americano no brasil rio de janeiro
consulado americano no brasil sao paulo
consulado americano no brasil site
consulado americano no brasil visto
consulado americano no espírito santo
consulado americano no humaita
consulado americano no nordeste
consulado americano nordeste
consulado americano nos estados unidos
consulado americano o que é
consulado americano o que levar
consulado americano oficial
consulado americano onde fica
consulado americano onde tem
consulado americano para pasaporte
consulado americano para sacar pasaporte
consulado americano para tirar visto
consulado americano para visto
consulado americano passaporte
consulado americano pe
consulado americano pedido de visto
consulado americano poa
consulado americano porto alegre
consulado americano porto alegre agendamento
consulado americano porto alegre renovação de visto
consulado americano porto alegre visto
consulado americano preencher ds 160
consulado americano reagendar entrevista
consulado americano renovacao de visto
consulado americano renovação de visto
consulado americano renovação visto
consulado americano renovar visto
consulado americano retirada de passaporte
consulado americano ribeirao preto
consulado americano rio de janeiro brasil
consulado americano rj visto
consulado americano santo amaro
consulado americano sao gualter
consulado americano sao paulo
consulado americano são paulo
consulado americano sao paulo agendamento
consulado americano são paulo agendamento
consulado americano sao paulo casv
consulado americano sao paulo renovar visto
consulado americano são paulo sp
consulado americano são paulo vila mariana
consulado americano sao paulo visto
consulado americano são paulo visto
consulado americano sao paulo vistos
consulado americano site
consulado americano site oficial
consulado americano site oficial visto
consulado americano site visto
consulado americano solicitação de visto
consulado americano solicitar visto
consulado americano sp
consulado americano sp agendamento
consulado americano sp agendamento visto
consulado americano taxas
consulado americano tem acesso a receita federal
consulado americano teste covid
consulado americano tirar visto
consulado americano usa
consulado americano vacinas
consulado americano valor do visto
consulado americano vila maria
consulado americano vila mariana
consulado americano vila mariana são paulo
consulado americano visto
consulado americano visto agendamento
consulado americano visto americano
consulado americano visto brasil
consulado americano visto brasilia
consulado americano visto de estudante
consulado americano visto de turista
consulado americano visto ds 160
consulado americano visto estudante
consulado americano visto eua
consulado americano visto f1
consulado americano visto formulario ds 160
consulado americano visto j1
consulado americano visto porto alegre
consulado americano visto renovação
consulado americano visto sao paulo
consulado americano visto são paulo
consulado americano visto turista
consulado americano whitaker
consulado brasileiro estados unidos
consulado brasileiro no estados unidos
consulado brasileiro nos estados unidos
consulado chacara santo antonio
consulado de estados unidos em sao paulo
consulado de porto alegre americano
consulado de sao paulo americano
consulado do estados unidos
consulado do eua no brasil
consulado dos estados unidos brasilia
consulado dos estados unidos da america
consulado dos estados unidos da américa
consulado dos estados unidos em sao paulo
consulado dos estados unidos em são paulo
consulado dos estados unidos em sp
consulado dos estados unidos sao paulo
consulado dos estados unidos são paulo
consulado dos estados unidos visto
consulado dos eua brasil
consulado dos eua em sao paulo
consulado dos eua em são paulo
consulado dos eua no brasil
consulado dos eua sao paulo
consulado ds 160
consulado embaixada americana
consulado entrevista
consulado estados unidos brasilia
consulado estados unidos em porto alegre
consulado estados unidos em sao paulo
consulado estados unidos em são paulo
consulado estados unidos porto
consulado estados unidos porto alegre
consulado estados unidos porto alegre visto
consulado estados unidos sao paulo
consulado estados unidos são paulo
consulado estados unidos sao paulo agendamento
consulado estados unidos sao paulo visto
consulado estados unidos visto
consulado estadunidense
consulado eua brasil
consulado eua brasil visto
consulado eua em porto alegre
consulado eua em sao paulo
consulado eua em sp
consulado eua porto alegre
consulado eua porto alegre visto
consulado eua sao paulo
consulado eua são paulo
consulado eua sao paulo visto
consulado geral americano
consulado geral americano em sao paulo
consulado geral do estados unidos
consulado geral dos estados unidos da américa são paulo sp
consulado geral dos estados unidos em sao paulo
consulado geral dos estados unidos em são paulo
consulado geral dos eua em são paulo
consulado geral dos eua são paulo
consulado geral estados unidos
consulado mexicano de estados unidos
consulado mexicano estados unidos
consulado norte americano
consulado norte americano em são paulo
consulado norte americano no brasil
consulado norte americano porto alegre
consulado norte americano visto
consulado para pasaporte americano
consulado para sacar pasaporte americano
consulado para tirar visto americano
consulado para visto americano
consulado pasaporte americano
consulado porto alegre americano
consulado porto alegre estados unidos
consulado porto alegre visto
consulado recife estados unidos
consulado rio de janeiro estados unidos
consulado sao paulo americano
consulado sao paulo estados unidos
consulado usa brasil
consulado usa em porto alegre
consulado usa em sao paulo
consulado usa porto alegre
consulado usa sao paulo
consulado visto
consulado visto americano
consulado visto americano sao paulo
consulado visto estados unidos
consulados brasileiros nos estados unidos
consulados dos estados unidos
consular americano
consulta de agendamento de visto americano
consultar agendamento casv
consultar agendamento consulado americano
consultar agendamento de visto
consultar agendamento de visto americano
consultar agendamento entrevista visto americano
consultar agendamento visto
consultar agendamento visto americano
consultar data agendamento visto americano
consultar ds 160
consultar ds160
consultoria de visto americano
consultoria para tirar visto americano
consultoria para visto americano
consultoria visto
consultoria visto americano
contato casv
contato casv sao paulo
contato consulado americano
contato do consulado americano
contato embaixada americana
continuar preenchendo formulario ds 160
continuar preenchendo visto americano
continuar preenchimento ds 160
costa rica visto
custo de visto americano
custo de visto para os estados unidos
custo do passaporte americano
custo do visto americano
custo do visto americano 2022
custo do visto para os estados unidos
custo para emissão de visto americano
custo para renovar visto americano
custo para tirar o visto americano
custo para tirar passaporte e visto americano
custo para tirar visto americano
custo para visto americano
custo passaporte americano
custo passaporte e visto americano
custo renovação visto americano
custo renovar visto americano
custo tirar visto americano
custo visto
custo visto americano
custo visto americano 2021
custo visto americano 2022
custo visto americano 2023
custo visto americano turismo
custo visto estados unidos
custo visto turista americano
d160 visto americano
dar entrada no visto americano
dar entrada visto americano
data agendamento visto
data agendamento visto americano
data agendamento visto americano 2022
data agendamento visto americano sao paulo
data consulado americano
data de agendamento de visto americano
data de agendamento para visto americano
data de agendamento visto americano
data de entrevista visto americano
data disponivel para agendamento visto americano
data disponivel para agendamento visto americano 2022
data entrevista consulado americano
data entrevista visto americano
data para agendamento de visto
data para agendamento visto americano
data para agendar visto americano
data para entrevista do visto americano
data para entrevista do visto americano 2022
data para entrevista visto americano
data para tirar visto americano
data renovação visto americano
data visto americano sao paulo
datas agendamento visto americano 2022
datas consulado americano
datas consulado americano 2022
datas de agendamento visto americano
datas de agendamento visto americano 2022
datas de entrevista para visto americano
datas de entrevista para visto americano 2022
datas de visto americano
datas disponiveis agendamento visto americano
datas disponiveis consulado americano
datas disponiveis entrevista consulado americano
datas disponíveis entrevista consulado americano
datas disponiveis para agendamento de visto americano
datas disponíveis para agendamento de visto americano
datas disponíveis para agendamento de visto americano 2022
datas disponiveis para agendamento visto americano
datas disponiveis para agendar visto americano
datas disponiveis para entrevista consulado americano
datas disponíveis para entrevista do visto americano
datas disponiveis para tirar visto americano
datas disponíveis para tirar visto americano 2022
datas disponiveis para visto americano
datas disponíveis para visto americano
datas disponiveis para visto americano 2022
datas disponiveis visto americano
datas entrevista consulado americano
datas entrevista visto americano 2022
datas para agendamento de visto
datas para agendamento de visto americano
datas para agendamento de visto americano 2022
datas para agendamento do visto americano
datas para agendar visto americano
datas para entrevista do visto americano 2022
datas para entrevista no consulado americano
datas para entrevista no consulado americano 2022
datas para marcar visto americano
datas para renovação de visto americano
datas para tirar o visto americano
datas para tirar visto americano
datas para tirar visto americano 2022
datas para visto americano
datas para visto americano 2022
datas visto americano
datas visto americano 2022
datas visto americano sp
datas vistos americanos
de 160 visto
de portugal para estados unidos precisa de visto
de visto
demora para agendar visto americano
departamento de estado americano visto
departamento de vistos dos estados unidos
depois de preencher ds 160 o que fazer
depois de preencher o ds 160 o que fazer
depois de preencher o ds160
depois de preencher o formulario ds 160
depois de preencher o formulario ds 160 o que fazer
depois de preencher o formulario ds160 o que fazer
depois do ds 160 o que fazer
despachante consulado americano
despachante de visto
despachante de visto americano
despachante de visto americano em sao paulo
despachante para renovação de visto americano
despachante para renovar visto americano
despachante para tirar visto americano
despachante para visto
despachante para visto americano
despachante para visto americano em sao paulo
despachante para visto americano em são paulo
despachante renovação visto americano
despachante visto
despachante visto americano
despachante visto americano alphaville
despachante visto americano belo horizonte
despachante visto americano porto alegre
despachante visto americano preço
despachante visto americano sao paulo
despachante visto estados unidos
dicas agendamento visto americano
dicas ds 160
dicas para agendar visto americano
dicas para preencher ds 160
dicas para preencher ds160
dicas para preencher formulario ds 160
dicas para preencher o formulario ds 160
dicas para preenchimento do formulario ds 160
dicas preencher ds 160
dicas preencher formulario ds 160
dicas preenchimento ds 160
dicas preenchimento visto americano
documentação casv
documentação entrevista visto americano
documentação para tirar o visto
documentação para tirar visto
documentação para visto
documentação para visto americano turista
documentação visto
documentação visto americano
documentação visto americano turismo
documento americano
documento ds 160 para visto
documento para o visto
documento para tirar o visto
documento para tirar visto americano
documento para visto
documento para visto americano
documento visto
documentos americanos
documentos casv visto americano
documentos consulado americano
documentos ds 160
documentos entrevista consulado
documentos entrevista consulado americano
documentos entrevista passaporte
documentos entrevista visto
documentos exigidos para visto americano
documentos levar casv
documentos levar entrevista visto
documentos levar entrevista visto americano
documentos levar visto americano
documentos necessario para o visto americano
documentos necessario para tirar o visto
documentos necessario para tirar o visto americano
documentos necessarios casv
documentos necessarios para ds 160
documentos necessarios para entrevista de passaporte
documentos necessarios para entrevista de visto americano
documentos necessários para entrevista de visto americano
documentos necessarios para entrevista do visto
documentos necessarios para entrevista do visto americano
documentos necessários para entrevista do visto americano
documentos necessarios para entrevista no consulado americano
documentos necessarios para entrevista passaporte
documentos necessarios para entrevista visto americano
documentos necessários para entrevista visto americano
documentos necessários para ir para os estados unidos
documentos necessarios para levar no casv
documentos necessários para morar nos estados unidos
documentos necessarios para o casv
documentos necessarios para o visto
documentos necessários para o visto
documentos necessarios para o visto americano
documentos necessários para o visto americano
documentos necessários para pedido de visto para estados unidos
documentos necessários para preencher o ds 160
documentos necessarios para preencher o formulario ds 160
documentos necessarios para renovacao de visto
documentos necessarios para renovacao de visto americano
documentos necessários para renovação de visto americano
documentos necessários para renovação do visto americano
documentos necessarios para renovar o visto americano
documentos necessarios para renovar visto
documentos necessarios para renovar visto americano
documentos necessários para renovar visto americano
documentos necessarios para solicitar visto americano
documentos necessarios para tirar elegibilidade
documentos necessarios para tirar o visto
documentos necessários para tirar o visto
documentos necessarios para tirar o visto americano
documentos necessários para tirar o visto americano
documentos necessários para tirar o visto americano de turista
documentos necessarios para tirar o visto japones
documentos necessarios para tirar visto
documentos necessários para tirar visto
documentos necessarios para tirar visto americano
documentos necessários para tirar visto americano
documentos necessarios para tirar visto americano de turismo
documentos necessários para tirar visto japonês
documentos necessários para tirar visto mexicano
documentos necessários para tirar visto para os estados unidos
documentos necessarios para visto
documentos necessários para visto
documentos necessarios para visto americano
documentos necessários para visto americano
documentos necessários para visto americano de turista
documentos necessarios para visto americano turismo
documentos necessários para visto canadense turismo
documentos necessarios para visto de estudante americano
documentos necessarios para visto de turista estados unidos
documentos necessários para visto de turista estados unidos
documentos necessarios passaporte portugues
documentos necessarios visto
documentos necessarios visto americano
documentos necessários visto americano
documentos para a entrevista do visto
documentos para a entrevista do visto americano
documentos para agendar visto americano
documentos para apresentar na entrevista do visto americano
documentos para apresentar no consulado americano
documentos para casv
documentos para conseguir visto americano
documentos para consulado americano
documentos para ds 160
documentos para emissão de visto americano
documentos para entrada nos estados unidos
documentos para entrevista consulado
documentos para entrevista consulado americano
documentos para entrevista de passaporte
documentos para entrevista de visto
documentos para entrevista de visto americano
documentos para entrevista do visto
documentos para entrevista do visto americano
documentos para entrevista no consulado
documentos para entrevista no consulado americano
documentos para entrevista passaporte
documentos para entrevista visto
documentos para entrevista visto americano
documentos para fazer o visto americano
documentos para fazer visto americano
documentos para levar ao casv
documentos para levar ao consulado americano
documentos para levar casv
documentos para levar entrevista visto
documentos para levar entrevista visto americano
documentos para levar na entrevista consulado americano
documentos para levar na entrevista de visto
documentos para levar na entrevista de visto americano
documentos para levar na entrevista do consulado americano
documentos para levar na entrevista do visto
documentos para levar na entrevista visto americano
documentos para levar no casv
documentos para levar no casv 2022
documentos para levar no consulado americano
documentos para levar no dia da entrevista do visto
documentos para levar no dia da entrevista do visto americano
documentos para levar no dia do visto
documentos para levar no visto
documentos para levar no visto americano
documentos para levar visto americano
documentos para morar nos estados unidos
documentos para o casv
documentos para o consulado americano
documentos para o visto americano
documentos para passaporte americano
documentos para pedir visto americano
documentos para preencher ds 160
documentos para preencher ds160
documentos para preencher o ds 160
documentos para renovacao de visto
documentos para renovacao de visto americano
documentos para renovação de visto americano
documentos para renovacao de visto japones
documentos para renovação do visto
documentos para renovacao do visto americano
documentos para renovação do visto americano
documentos para renovar o visto
documentos para renovar o visto americano
documentos para renovar visto americano
documentos para retirada de visto americano
documentos para solicitação de visto americano
documentos para solicitar visto americano
documentos para tirar o visto americano
documentos para tirar o visto americano de turista
documentos para tirar o visto japones
documentos para tirar o visto mexicano
documentos para tirar o visto para os estados unidos
documentos para tirar passaporte americano
documentos para tirar visto americano
documentos para tirar visto americano 2022
documentos para tirar visto americano turista
documentos para tirar visto australiano
documentos para tirar visto de estudante americano
documentos para tirar visto japones
documentos para tirar visto japones sansei
documentos para tirar visto mexicano
documentos para tirar visto para os estados unidos
documentos para trabalhar nos estados unidos
documentos para visto americano
documentos para visto americano 2020
documentos para visto americano 2022
documentos para visto americano b1 b2
documentos para visto americano entrevista
documentos para visto americano turismo
documentos para visto brasileiro
documentos para visto canada
documentos para visto canadense turismo
documentos para visto de estudante
documentos para visto de turista americano
documentos para visto estados unidos
documentos para visto italiano
documentos para visto japones
documentos para visto mexicano
documentos renovação visto americano
documentos renovar visto americano
documentos tirar visto
documentos tirar visto americano
documentos visto americano
documentos visto americano entrevista
documentos visto canada
documentos visto estados unidos
documentos visto estudante canada
dr 160 visto
ds 160 agendamento
ds 160 como pagar
ds 160 como preencher
ds 160 confirmação
ds 160 consulado
ds 160 consulado americano brasil
ds 160 consultar
ds 160 dicas
ds 160 documentos necessários
ds 160 embaixada americana
ds 160 estudante
ds 160 exemplo
ds 160 familia
ds 160 formulário
ds 160 formulario preencher
ds 160 formulario visto americano
ds 160 now vistos
ds 160 pagar
ds 160 para familia
ds 160 para menor
ds 160 passo a passo
ds 160 perguntas
ds 160 preço
ds 160 preencher
ds 160 preenchido
ds 160 preenchimento
ds 160 quanto custa
ds 160 redes sociais
ds 160 renovação
ds 160 traduzida
ds 160 turismo
ds 160 turista
ds 160 valor
ds 160 valor 2021
ds 160 valor 2022
ds 160 visto
ds 160 visto americano
ds 160 visto americano formulario
ds 160 visto americano formulario passo a passo
ds 160 visto americano site oficial
ds 160 visto preencher
ds 160 visto turista
ds 60 visto
ds visto
ds visto americano
ds160 como preencher
ds160 consulado
ds160 consulado americano
ds160 formulario
ds160 formulário
ds160 o que é
ds160 oficial
ds160 passo a passo
ds160 traduzido
ds160 valor
ds160 valor hoje
ds160 visto
duração visto americano turista
duvidas consulado americano
duvidas ds 160
duvidas formulario ds 160
duvidas sobre o visto americano
duvidas sobre visto americano
duvidas visto americano
eb 5 visto
eb2 visto americano
eb3 visto americano
embaixada america visto
embaixada americana agendamento
embaixada americana agendamento visto
embaixada americana agendar visto
embaixada americana brasil visto
embaixada americana brasilia agendamento visto
embaixada americana brasilia visto
embaixada americana ds 160
embaixada americana em belo horizonte
embaixada americana em brasilia agendamento de visto
embaixada americana em brasilia visto
embaixada americana em porto alegre
embaixada americana em santa catarina
embaixada americana em sao paulo
embaixada americana em são paulo
embaixada americana em sp
embaixada americana esta
embaixada americana estados unidos
embaixada americana eua
embaixada americana formulario ds 160
embaixada americana no brasil onde fica
embaixada americana no brasil visto
embaixada americana nos estados unidos
embaixada americana nos eua
embaixada americana passaporte
embaixada americana poa
embaixada americana porto alegre
embaixada americana porto alegre visto
embaixada americana renovação de visto
embaixada americana renovação visto
embaixada americana sao paulo
embaixada americana são paulo
embaixada americana sao paulo visto
embaixada americana site
embaixada americana site oficial
embaixada americana sp agendamento visto
embaixada americana tirar visto
embaixada americana visa
embaixada americana visto
embaixada americana visto americano
embaixada americana visto brasilia
embaixada americana visto sao paulo
embaixada americana visto turista
embaixada americana vistos
embaixada americano
embaixada brasileira no estados unidos
embaixada consulado americano
embaixada dos estado unidos
embaixada dos estados unidos brasília
embaixada dos estados unidos da américa american presence post
embaixada dos estados unidos em belo horizonte
embaixada dos estados unidos em brasilia visto
embaixada dos estados unidos em sao paulo
embaixada dos estados unidos em são paulo
embaixada dos estados unidos em sp
embaixada dos estados unidos porto alegre
embaixada dos estados unidos renovação de visto
embaixada dos estados unidos sao paulo
embaixada dos estados unidos são paulo
embaixada dos estados unidos site
embaixada dos estados unidos visto
embaixada dos eua em belo horizonte
embaixada dos eua em sao paulo
embaixada dos eua no brasil visto
embaixada dos eua sao paulo
embaixada e consulado americano
embaixada estados unidos em sao paulo
embaixada estados unidos porto alegre
embaixada estados unidos recife
embaixada estados unidos sao paulo
embaixada estados unidos são paulo
embaixada estados unidos visto
embaixada eua belo horizonte
embaixada eua brasilia visto
embaixada eua em sao paulo
embaixada eua porto alegre
embaixada nova zelândia visto
embaixada ou consulado americano
embaixada usa porto alegre
embaixada usa sao paulo
embaixada visto
embaixada visto americano
embassy visto americano
emissão boleto visto americano
emissao de visto
emissão de visto americano
emissão de visto americano 2022
emissão de visto americano em porto alegre
emissão de visto americano suspenso
emissão de visto americano turismo
emissao de visto estados unidos
emissão de visto para os estados unidos
emissão de vistos americanos
emissão do visto americano
emissao visto
emissão visto americano
emissao visto mexicano
emitir boleto ds 160
emitir boleto visto americano
emitir visto
emitir visto americano
empresa de visto americano
empresa especializada em visto americano
empresa para tirar visto americano
empresa para visto americano
empresa que ajuda a tirar visto
empresa que tirar visto americano
empresa tirar visto americano
empresa visto americano
empresas que ajudam a tirar visto americano
empresas que auxiliam no visto americano
empresas que tiram visto americano
entrada de turista nos estados unidos
entrada no visto americano
entrada visto americano
entrar nos estados unidos com passaporte europeu
entrar nos estados unidos com passaporte italiano
entrar nos estados unidos com passaporte portugues
entrevista casv
entrevista casv o que levar
entrevista consulado
entrevista consulado americano
entrevista consulado americano 2021
entrevista consulado americano 2022
entrevista consulado americano brasil
entrevista consulado americano brasilia
entrevista consulado americano documentos
entrevista consulado americano o que levar
entrevista consulado americano porto alegre
entrevista consulado americano sao paulo
entrevista consulado americano visto
entrevista consulado americano visto estudante
entrevista de acompanhamento visto americano
entrevista de emergencia consulado americano
entrevista de visto
entrevista de visto americano
entrevista de visto americano 2022
entrevista de visto americano é em ingles
entrevista do consulado americano
entrevista do visto
entrevista do visto americano
entrevista do visto americano 2022
entrevista do visto americano é em ingles
entrevista embaixada americana
entrevista embaixada americana visto
entrevista na embaixada americana
entrevista no casv
entrevista no consulado
entrevista no consulado americano
entrevista no consulado americano 2022
entrevista no consulado americano é em ingles
entrevista no consulado americano em sao paulo
entrevista para o visto
entrevista para o visto americano
entrevista para renovação de visto americano
entrevista para tirar o visto
entrevista para tirar o visto americano
entrevista para tirar visto
entrevista para tirar visto americano
entrevista para visto
entrevista para visto americano
entrevista para visto americano 2021
entrevista para visto americano 2022
entrevista para visto americano é em portugues
entrevista para visto americano em brasilia
entrevista para visto americano em porto alegre
entrevista para visto americano em sao paulo
entrevista para visto de estudante americano
entrevista passaporte documentos
entrevista renovação visto americano
entrevista visto
entrevista visto americano
entrevista visto americano 2021
entrevista visto americano 2022
entrevista visto americano 2023
entrevista visto americano agendamento
entrevista visto americano brasilia
entrevista visto americano datas
entrevista visto americano documentos
entrevista visto americano é em ingles
entrevista visto americano ingles ou portugues
entrevista visto americano o que levar
entrevista visto americano porto alegre
entrevista visto americano sao paulo
entrevista visto americano são paulo
entrevista visto estados unidos
entrevista visto estudante
entrevista visto j1
entrevista visto o que levar
entrevista visto porto alegre
entrevistas consulado americano 2022
entrevistas de visto americano
entrevistas no consulado americano 2022
entrevistas visto americano 2022
espanhol precisa de visto para os estados unidos
especialista em visto americano
esta dificil tirar o visto americano
esta embaixada americana
esta italiano estados unidos
esta mais facil tirar o visto americano
esta visto americano
esta visto americano para europeus
esta visto americano site oficial
esta visto estados unidos
estados para tirar visto americano
estados que tiram visto americano
estados unidos embaixada
estados unidos passaporte
estados unidos precisa de visto
estados unidos precisa de visto para entrar no brasil
estados unidos visto
estados unidos visto brasil
estados unidos visto de trabalho
estados unidos visto de turista
estados unidos visto turista
etapas para tirar visto americano
etapas visto americano
eua precisa de visto para entrar no brasil
eua visto brasil
europeu precisa de visto para entrar nos estados unidos
europeu precisa de visto para estados unidos
europeu precisa de visto para os estados unidos
exemplo ds 160
exemplo formulario ds 160
exigencias para tirar visto americano
f1 visto americano
fazer o visto americano
fazer o visto americano em porto alegre
fazer visto americano
fazer visto americano em porto alegre
fazer visto americano porto alegre
ficha ds160
fila agendamento visto americano
fila consulado americano
fila do visto
fila espera visto americano
fila no consulado americano
fila para o visto americano
fila para tirar o visto americano
fila para tirar visto americano
fila visto
fila visto americano porto alegre
fila visto americano sao paulo
formas de conseguir visto americano
formulario 160 para visto americano
formulario 160 visto
formulario 160 visto americano
formulário 160 visto americano
formulario 160 visto estados unidos
formulario americano
formulario americano ds 160
formulario b2 visto americano
formulario consulado americano
formulário d160
formulário d160 para visto americano
formulario d60 visto americano
formulario de entrada nos estados unidos
formulário de entrada nos estados unidos
formulario de imigração estados unidos
formulario de renovação de visto americano
formulario de solicitacao de visto americano
formulario de solicitação de visto americano
formulário de solicitação de visto ds 160
formulário de solicitação de visto não imigrante ds 160
formulário de solicitação ds 160
formulario de visto
formulário de visto
formulario de visto americano
formulário de visto americano
formulario de visto americano ds 160
formulario de visto americano ds 160 em portugues
formulario de visto americano em portugues
formulário de visto ds 160
formulario de visto ds160
formulario de visto para os estados unidos
formulario do consulado americano
formulario do visto
formulário do visto
formulario do visto americano
formulário do visto americano
formulario do visto americano em portugues
formulário ds 160
formulário ds 160 2022
formulario ds 160 como preencher
formulário ds 160 consulado americano
formulario ds 160 embaixada americana
formulario ds 160 familia
formulário ds 160 finalizado
formulário ds 160 imprimir
formulario ds 160 modelo
formulario ds 160 o que é
formulario ds 160 para familia
formulario ds 160 para menor
formulario ds 160 para preencher
formulario ds 160 para renovar visto
formulario ds 160 para visto americano
formulario ds 160 passo a passo
formulário ds 160 passo a passo
formulário ds 160 pdf
formulario ds 160 preencher
formulario ds 160 preenchido
formulário ds 160 preenchido
formulario ds 160 preenchimento
formulario ds 160 renovação visto americano
formulario ds 160 site
formulario ds 160 site oficial
formulário ds 160 site oficial
formulario ds 160 traduzido
formulario ds 160 valor
formulario ds 160 visto
formulario ds 160 visto americano
formulário ds 160 visto americano
formulario ds 160 visto americano em portugues
formulario ds 160 visto americano pdf
formulario ds 160 visto americano site oficial
formulário ds 160 visto americano site oficial
formulario ds 60 visto americano
formulario ds160 como preencher
formulario ds160 passo a passo
formulario ds160 preencher
formulario ds160 visto
formulario ds160 visto americano
formulário ds160 visto americano
formulario embaixada americana
formulário entrada estados unidos
formulário esta estados unidos
formulario imigração estados unidos
formulário online ds 160
formulário online para solicitação de visto ds 160
formulario online visto americano
formulario para agendamento de visto americano
formulario para emissão de visto americano
formulario para entrada nos estados unidos
formulario para entrar nos estados unidos
formulario para o visto
formulario para o visto americano
formulário para o visto americano
formulario para o visto americano em portugues
formulario para passaporte americano
formulario para pedido de visto americano
formulario para preencher visto americano
formulario para renovacao de visto
formulario para renovacao de visto americano
formulario para renovação de visto americano
formulário para renovação de visto americano
formulario para renovação do visto americano
formulario para renovar visto americano
formulario para requerer visto americano
formulario para solicitação de visto americano
formulario para solicitar visto americano
formulário para tirar o visto
formulario para tirar o visto americano
formulário para tirar o visto americano
formulario para tirar visto americano
formulário para tirar visto americano
formulario para tirar visto americano em portugues
formulario para visto
formulário para visto
formulario para visto americano
formulário para visto americano
formulario para visto americano ds 160
formulário para visto americano ds 160
formulário para visto americano ds 160 em português
formulário para visto americano ds160
formulario para visto americano em portugues
formulario para visto americano turista
formulario para visto de turista americano
formulario passaporte americano
formulario renovação de visto americano
formulario renovação visto americano
formulario solicitação de visto americano
formulario solicitação visto americano
formulario visto
formulário visto
formulario visto americano
formulário visto americano
formulario visto americano 2021
formulario visto americano 2022
formulário visto americano 2022
formulario visto americano b1 b2
formulario visto americano como preencher
formulário visto americano ds 160
formulario visto americano em portugues
formulário visto americano turismo
formulario visto americano turista
formulário visto americano turista
formulario visto ds 160
formulario visto ds160
formulario visto estados unidos
formulário visto estados unidos
formulario visto turista americano
formulários ds 160
formularios para visto americano
foto ds 160 visto americano
foto formulario ds 160 visto americano
foto para ds160
foto para o ds 160
foto para renovação de visto americano
foto para renovar visto americano
foto renovação visto americano
fotos de visto americano
fotos para visto americano
g1 visto americano
gerar boleto ds 160
green card americano
green card americano como conseguir
green card americano o que é
green card americano valor
green card brasileiro
green card de investidor
green card estados unidos como conseguir
green card investidor
green card nos estados unidos
green card para pais
green card visto americano
grupo whatsapp visto americano
humaita consulado americano
i 94 visto americano
i20 visto americano
idoso precisa de visto americano
idoso visto americano
impressão ds 160
impressao formulario ds 160
imprimir boleto ds 160
imprimir confirmação ds 160
imprimir ds 160 preenchido
imprimir ds 160 visto americano
imprimir formulário ds 160
informações consulado americano
informações de visto americano
informações sobre visto americano
informações visto americano
italiano precisa de visto americano
italiano precisa de visto para entrar nos estados unidos
italiano precisa de visto para estados unidos
italiano precisa de visto para os estados unidos
j1 visto americano
k1 visto
l1 visto
link agendamento visto americano
link para agendar visto americano
link para preencher ds 160
link visto americano
lista de documentos para entrevista consulado americano
lista de documentos para o visto americano
lista de documentos para tirar o visto americano
lista de documentos para tirar visto americano
lista de documentos para visto
lista de documentos para visto americano
lista de documentos visto americano
lista de vistos americanos
lista documentos visto americano
locais de entrevista para visto americano
locais de visto americano no brasil
locais onde tirar visto americano
locais para entrevista visto americano
locais para tirar o visto americano
locais para tirar visto americano
locais para tirar visto americano no brasil
locais para visto americano
locais que tiram visto americano
locais visto americano
locais visto americano brasil
local entrevista visto americano
local para tirar visto americano
local visto americano
login agendamento visto americano
lugares para tirar o visto americano
lugares para tirar visto americano
lugares para tirar visto americano no brasil
lugares que tira visto americano no brasil
marcação de entrevista para visto americano
marcação de entrevista visto americano
marcação de visto americano
marcação do visto americano
marcação entrevista visto americano
marcação visto americano
marcar a entrevista do visto americano
marcar agendamento visto americano
marcar casv
marcar como visto anterior
marcar consulado americano
marcar data visto americano
marcar entrevista consulado
marcar entrevista consulado americano
marcar entrevista de visto
marcar entrevista de visto americano
marcar entrevista do visto
marcar entrevista do visto americano
marcar entrevista embaixada americana
marcar entrevista no consulado
marcar entrevista no consulado americano
marcar entrevista para passaporte
marcar entrevista para tirar passaporte
marcar entrevista para visto
marcar entrevista para visto americano
marcar entrevista visto
marcar entrevista visto americano
marcar entrevista visto americano brasilia
marcar entrevista visto americano sao paulo
marcar o visto americano
marcar para tirar o visto americano
marcar para tirar visto americano
marcar renovação de visto americano
marcar visto
marcar visto americano
marcar visto americano brasilia
marcar visto americano porto alegre
marcar visto americano sp
marcar visto consulado americano
marcar visto estados unidos
marcar visto para estados unidos
marcar visto para os estados unidos
melhor cidade para tirar visto americano
melhor consulado para tirar visto americano
melhor despachante visto americano
melhor empresa para tirar visto americano
melhor lugar para tirar visto americano
melhores destinos renovar visto americano
melhores destinos visto americano
meu visto americano esta no passaporte vencido
meu visto americano foi negado o que fazer
meu visto americano vai vencer o que fazer
meu visto americano venceu
meu visto americano venceu como renovar
meu visto americano venceu na pandemia
meu visto de turista venceu e agora
meu visto venceu como renovar
meu visto venceu e agora
meu visto venceu o que faço
mexicano precisa de visto para entrar nos estados unidos
mexicano precisa de visto para os estados unidos
mexicanos precisam de visto para entrar nos estados unidos
modelo formulario ds 160
modelo formulário ds 160
modelo formulario ds160
morar no estados unidos legalmente
morar nos estados unidos com visto de turista
morar nos estados unidos legalmente
mrv taxa visto
mrv visto americano
mundo dos vistos agendamento
mundo dos vistos ds 160
nao consigo agendar entrevista visto americano
nao consigo agendar visto americano
não consigo agendar visto americano
netvistos reclame aqui
nova iorque precisa de visto
nova york precisa de visto
novo consulado americano
now vistos agendamento
now vistos ds 160
nublu visto americano
o consulado americano
o consulado americano consulta antecedentes criminais
o consulado americano esta emitindo vistos
o consulado americano esta funcionando
o consulado americano tem acesso a antecedentes criminais
o consulado americano tem acesso a receita federal
o formulário ds 160
o visto americano
obtenção de visto americano
obter visto americano
oq levar no casv
oq precisa para tirar o visto
oq precisa para tirar o visto americano
oq precisa para tirar visto americano
paga para tirar visto americano
pagamento agendamento visto americano
pagamento e agendamento visto americano
pagar a taxa de visto americano
pagar agendamento visto americano
pagar ds 160
pagar ds 160 com cartao de credito
pagar ds160
pagar e agendar visto americano
pagar o ds 160
pagar taxa de visto americano
pagar visto ds 160
pagina agendamento visto americano
pagina de agendamento visto americano
página de confirmação de agendamento no casv
página de confirmação do agendamento no casv
para agendar visto americano
para entrar nos estados unidos precisa de visto
para ir para nova york precisa de visto
para ir para os estados unidos precisa de visto
para ir pro estados unidos precisa de visto
para morar nos estados unidos precisa de visto
para renovar o visto americano
para renovar o visto americano precisa de entrevista
para renovar visto americano
para renovar visto americano precisa de entrevista
para tirar o visto
para tirar o visto americano
para tirar o visto americano o que precisa
para tirar visto americano
para tirar visto americano o que precisa
para tirar visto precisa de passaporte
para viajar para os estados unidos precisa de visto
passaporte alemão precisa de visto americano
passaporte americano
passaporte americano agendamento
passaporte americano como tirar
passaporte americano documentos
passaporte americano no brasil
passaporte americano para bebê
passaporte americano porto alegre
passaporte americano renovacao
passaporte americano renovação
passaporte americano renovar
passaporte americano valor
passaporte americano valor 2021
passaporte americano valor 2022
passaporte americano vencido
passaporte b1 b2
passaporte brasil eua
passaporte brasileira
passaporte brasileiro nos estados unidos
passaporte chileno visto americano
passaporte com visto americano
passaporte consulado americano
passaporte custo
passaporte de emergencia estados unidos
passaporte do brasil para estados unidos
passaporte do estados unidos
passaporte dos estados unidos
passaporte ds 160
passaporte e visto americano
passaporte e visto americano valor
passaporte e visto como tirar
passaporte e visto estados unidos
passaporte e visto para os estados unidos
passaporte espanhol estados unidos
passaporte espanhol precisa de visto americano
passaporte espanhol precisa de visto para os estados unidos
passaporte estados unidos
passaporte estados unidos preço
passaporte estados unidos valor
passaporte europeu estados unidos
passaporte europeu pode entrar nos estados unidos
passaporte europeu precisa de visto para entrar nos estados unidos
passaporte europeu precisa de visto para estados unidos
passaporte europeu precisa de visto para os estados unidos
passaporte italiano estados unidos
passaporte italiano nos estados unidos
passaporte italiano para entrar nos estados unidos
passaporte italiano pode entrar nos estados unidos
passaporte italiano precisa de visto americano
passaporte italiano precisa de visto para entrar nos estados unidos
passaporte italiano precisa de visto para estados unidos
passaporte italiano precisa de visto para os estados unidos
passaporte italiano visto americano
passaporte italiano visto estados unidos
passaporte japonês precisa de visto americano
passaporte para estados unidos
passaporte para estados unidos preço
passaporte para estados unidos valor
passaporte para ir aos estados unidos
passaporte para ir para os estados unidos
passaporte para o estados unidos
passaporte para os estados unidos
passaporte para os estados unidos valor
passaporte para viajar para estados unidos
passaporte para viajar para os estados unidos
passaporte portugues entrar nos estados unidos
passaporte portugues estados unidos
passaporte portugues nos estados unidos
passaporte portugues para entrar nos estados unidos
passaporte portugues pode entrar nos estados unidos
passaporte português precisa de visto americano
passaporte portugues precisa de visto para entrar nos estados unidos
passaporte português precisa de visto para os estados unidos
passaporte portugues visto americano
passaporte portugues visto estados unidos
passaporte pro estados unidos
passaporte sanitário estados unidos
passaporte valido para estados unidos
passaporte vencido com visto americano
passaporte vencido com visto americano valido
passaporte vencido com visto válido
passaporte vencido e visto americano valido
passaporte vencido e visto válido
passaporte vencido visto americano
passaporte vencido visto valido
passaporte visto americano
passaporte visto estados unidos
passo a passo agendamento visto americano
passo a passo agendar entrevista visto americano
passo a passo como tirar o visto americano
passo a passo como tirar visto americano
passo a passo de como tirar o visto americano
passo a passo de como tirar visto americano
passo a passo do visto americano
passo a passo ds 160
passo a passo ds160
passo a passo formulario ds 160
passo a passo formulario visto americano
passo a passo green card por casamento
passo a passo para agendar visto americano
passo a passo para conseguir o visto americano
passo a passo para fazer o visto americano
passo a passo para ir para os estados unidos
passo a passo para o visto americano
passo a passo para preencher ds 160
passo a passo para preencher formulario ds 160
passo a passo para preencher o ds 160
passo a passo para preencher o formulario ds 160
passo a passo para preenchimento do formulario ds 160
passo a passo para renovação de visto americano
passo a passo para renovação do visto americano
passo a passo para renovar o visto americano
passo a passo para renovar visto americano
passo a passo para renovar visto americano 2022
passo a passo para solicitar o visto americano
passo a passo para solicitar visto americano
passo a passo para tirar o visto americano
passo a passo para tirar o visto americano 2022
passo a passo para tirar passaporte e visto americano
passo a passo para tirar um visto americano
passo a passo para tirar visto americano
passo a passo para tirar visto americano 2022
passo a passo para tirar visto de estudante americano
passo a passo para tirar visto de turista americano
passo a passo para tirar visto para os estados unidos
passo a passo para visto americano
passo a passo preencher ds 160
passo a passo preencher ds160
passo a passo preencher formulario ds 160
passo a passo preencher visto americano
passo a passo preenchimento ds 160
passo a passo preenchimento formulario ds 160
passo a passo renovação visto americano
passo a passo renovar visto americano
passo a passo solicitar visto americano
passo a passo tirar visto americano
passo a passo visto
passo a passo visto americano
passo a passo visto americano 2022
passo a passo visto americano 2023
passo a passo visto americano ds 160
passo a passo visto americano turismo
passo a passo visto americano turista
passo a passo visto estados unidos
passo a passo visto f1
passo a passo visto turista americano
passos para renovar visto americano
passos para tirar o visto americano
passos para tirar visto americano
passos para visto americano
passos visto americano
pedido de urgencia visto americano
pedido de visto
pedido de visto americano
pedido de visto americano passo a passo
pedido de visto estados unidos
pedido de visto online
pedido de visto para estados unidos
pedido de visto para os estados unidos
pedido visto americano
pedido visto estados unidos
pedir visto americano
pedir visto estados unidos
pedir visto para estados unidos
pedir visto para os estados unidos
pegar visto americano
perguntas da ds 160
perguntas do ds 160
perguntas do formulario ds 160
perguntas do formulario ds160
perguntas do visto americano ds 160
perguntas ds 160
perguntas entrevista visto americano
perguntas feitas para tirar o visto americano
perguntas formulario ds 160
perguntas formulario visto americano
perguntas frequentes para tirar o visto americano
permissao de trabalho estados unidos
pf visto americano
policia federal passaporte visto americano
policia federal renovacao de visto para estrangeiros
policia federal visto americano
polícia federal visto americano
portal consular estados unidos
porto alegre consulado americano
porto alegre visto americano
porto rico precisa de visto americano
portugal precisa de visto para entrar nos estados unidos
portugal precisa de visto para estados unidos
portugues pode entrar nos estados unidos
português precisa de visto para entrar nos estados unidos
posso agendar casv e entrevista no mesmo dia
posso agendar casv em outro estado
posso agendar visto em outro estado
posso entrar no brasil com passaporte americano
posso entrar nos estados unidos com passaporte a vencer
posso entrar nos estados unidos com visto a vencer
posso entrar nos estados unidos com visto canadense
posso marcar casv e consulado no mesmo dia
posso morar nos estados unidos com visto de turista
posso preencher outro formulario ds 160
posso reagendar entrevista visto americano
posso renovar meu visto americano antes de vencer
posso renovar meu visto americano em outro pais
posso renovar meu visto americano nos estados unidos
posso renovar meu visto antes de vencer
posso renovar o visto americano antes de vencer
posso renovar o visto americano antes do vencimento
posso renovar o visto antes de vencer
posso renovar visto americano antes de vencer
posso tirar visto americano em outro pais
posso trabalhar nos estados unidos com visto de turista
prazo agendamento visto americano
prazo de agendamento de visto americano
prazo entrevista visto americano
prazo entrevista visto americano 2022
prazo para agendamento de visto americano
prazo para agendamento visto americano
prazo para agendar entrevista visto americano após pagamento
prazo para agendar visto americano
prazo para renovação de visto americano
prazo para renovação do visto americano
prazo para renovação visto americano
prazo para renovar o visto americano
prazo para renovar visto americano
prazo renovacao visto americano
prazo renovação visto americano
prazo renovação visto americano 2022
prazo renovar visto americano
preciso de visto para estados unidos
preciso levar foto para renovar visto americano
preciso renovar meu visto americano
preço da ds 160
preço da taxa do visto americano
preço de passaporte para estados unidos
preço de um visto americano
preço de visto
preço de visto americano
preço de visto para os estados unidos
preço do ds 160
preço do passaporte para estados unidos
preço do passaporte para os estados unidos
preço do visto americano
preço do visto americano 2022
preço do visto americano turista
preço do visto de turista americano
preço do visto para estados unidos
preço do visto para os estados unidos
preço ds 160
preço entrevista visto americano
preço para renovar visto americano
preço para tirar o visto
preço para tirar o visto americano
preço para tirar o visto para os estados unidos
preço para tirar passaporte e visto americano
preço para tirar visto americano
preço para tirar visto americano 2022
preço para visto americano
preço passaporte americano
preço passaporte e visto americano
preço passaporte estados unidos
preço passaporte para estados unidos
preço renovação visto americano
preço renovar visto americano
preço taxa visto americano
preço tirar visto americano
preco visto americano
preço visto americano
preço visto americano 2022
preço visto americano turismo
preco visto estados unidos
preencha o formulário ds 160
preenchendo a ds 160
preenchendo ds 160
preenchendo ds 160 passo a passo
preenchendo ds160
preenchendo formulario ds 160
preenchendo o ds 160
preenchendo o formulario ds 160
preenchendo visto americano
preencher a ds 160
preencher d160
preencher d160 visto americano
preencher ds
preencher ds 160
preencher ds 160 au pair
preencher ds 160 passo a passo
preencher ds 160 site
preencher ds 160 site oficial
preencher ds 160 visto
preencher ds 160 visto americano
preencher ds160 passo a passo
preencher ficha ds 160 visto americano
preencher formulario de visto americano
preencher formulário de visto americano ds 160
preencher formulario do visto americano
preencher formulario ds 160
preencher formulário ds 160 online
preencher formulario ds 160 passo a passo
preencher formulario ds 160 site oficial
preencher formulario ds 160 visto americano
preencher formulario ds160
preencher formulario para tirar visto americano
preencher formulário para visto americano
preencher formulario visto americano
preencher o ds 160
preencher o ds 160 passo a passo
preencher o ds160
preencher o formulário de visto ds 160
preencher o formulario ds 160
preencher o formulário ds 160
preencher o formulário ds 160 https ceac state gov genniv
preencher o formulario ds160
preencher o visto americano
preencher pedido de visto americano
preencher solicitação de visto americano
preencher visto
preencher visto americano
preencher visto americano ds 160
preencher visto americano em portugues
preencher visto americano passo a passo
preencher visto ds 160
preenchimento da ds 160
preenchimento da ds 160 passo a passo
preenchimento de ds 160
preenchimento de formulario para visto americano
preenchimento de visto americano
preenchimento do ds 160
preenchimento do ds160
preenchimento do formulário ds 160
preenchimento do formulario ds 160 para visto americano
preenchimento do visto americano
preenchimento do visto americano ds 160
preenchimento ds 160
preenchimento ds 160 estudante
preenchimento ds 160 site
preenchimento ds 160 visto americano
preenchimento formulário ds 160
preenchimento formulario ds 160 passo a passo
preenchimento formulario ds160
preenchimento formulário visto americano
preenchimento visto americano
preenchimento visto americano ds 160
preenchimento visto ds 160
primeiro casv ou consulado
primeiro visto americano
procedimento para renovação de visto americano
procedimento para renovar visto americano
procedimento para tirar o visto americano
procedimento para tirar passaporte e visto
procedimento para tirar visto americano
procedimento para visto americano
procedimento renovação visto americano
procedimento visto americano
processo de renovação de visto americano
processo de visto americano
processo do visto americano
processo para tirar o visto americano
processo para tirar visto americano
processo para visto americano
processo renovação visto americano
processo visto americano
proximas datas para visto americano
proximas datas visto americano
qual a taxa do visto americano
qual a taxa para tirar o visto americano
qual a taxa para tirar visto americano
qual a taxa para visto americano
qual é o valor da taxa do visto americano
qual é o valor para tirar o visto americano
qual o custo para tirar o visto americano
qual o custo para tirar visto americano
qual o preço para tirar o visto americano
qual o valor da ds 160
qual o valor da taxa de visto americano
qual o valor da taxa do visto americano
qual o valor da taxa ds 160
qual o valor da taxa para o visto americano
qual o valor da taxa para tirar o visto americano
qual o valor da taxa para tirar visto americano
qual o valor da taxa para visto americano
qual o valor do ds 160
qual o valor para tirar o passaporte americano
qual o valor para tirar o visto
qual o valor para tirar o visto americano
qual o valor para tirar o visto americano 2021
qual o valor para tirar o visto americano 2022
qual o valor para tirar passaporte e visto americano
qual o valor para tirar um visto americano
qual o valor para tirar visto americano
qual o valor para tirar visto americano 2022
qual o valor para tirar visto para os estados unidos
qual valor da taxa de visto americano
qual valor da taxa do visto americano
qual valor da taxa para tirar o visto americano
qual valor da taxa para tirar visto americano
qual valor da taxa para visto americano
qual valor para renovar o visto americano
qual valor para tirar o visto
qual valor para tirar o visto americano
qual valor para tirar o visto americano 2021
qual valor para tirar o visto americano 2022
qual valor para tirar visto americano
qual valor para tirar visto americano 2021
qual valor para tirar visto americano 2022
quanto custa o passaporte para os estados unidos
quanto custa para tirar o passaporte americano
quanto custa para tirar o passaporte e visto americano
quanto custa para tirar o passaporte para os estados unidos
quanto custa para tirar passaporte americano
quanto custa para tirar passaporte e visto americano
quanto custa para tirar um passaporte para os estados unidos
quanto custa para tirar visto e passaporte
quanto custa tirar passaporte americano
quanto custa tirar passaporte e visto americano
quanto custa tirar um passaporte para os estados unidos
quanto gasto para tirar passaporte e visto americano
quero agendar meu visto americano
quero renovar meu visto americano
quero tirar meu visto americano
quero tirar o visto americano
questionario do visto americano
questionario ds 160
questionário ds 160
questionario para tirar visto americano
questionario para visto americano
questionario visto americano
questionario visto americano ds 160
reagendar casv
reagendar entrevista casv
reagendar entrevista consulado
reagendar entrevista visto
reagendar visto
reagendar visto americano casv
reagendar visto americano sp
receita federal visto americano
relação de documentos para visto americano
renovação automática visto americano
renovacao de passaporte americano
renovação de passaporte americano
renovação de passaporte americano no brasil
renovação de passaporte americano para menor
renovação de passaporte com visto americano válido
renovação de passaporte e visto americano
renovacao de visto
renovação de visto
renovacao de visto americano
renovação de visto americano
renovação de visto americano 2021
renovação de visto americano 2022
renovação de visto americano 2022 passo a passo
renovação de visto americano 2023
renovação de visto americano agendamento
renovação de visto americano antes do vencimento
renovação de visto americano b1 b2
renovação de visto americano belo horizonte
renovação de visto americano brasilia
renovação de visto americano como fazer
renovação de visto americano consulado
renovação de visto americano ds 160
renovacao de visto americano em belo horizonte
renovação de visto americano em belo horizonte
renovação de visto americano em porto alegre
renovacao de visto americano em sao paulo
renovação de visto americano em sao paulo
renovação de visto americano na pandemia
renovação de visto americano não vencido
renovação de visto americano negado
renovacao de visto americano online
renovação de visto americano online
renovação de visto americano pandemia
renovação de visto americano para brasileiros
renovação de visto americano para idosos
renovação de visto americano para menor
renovação de visto americano passo a passo
renovacao de visto americano porto alegre
renovação de visto americano porto alegre
renovação de visto americano prazo
renovação de visto americano precisa de entrevista
renovação de visto americano precisa de foto
renovação de visto americano precisa levar foto
renovação de visto americano quanto tempo
renovacao de visto americano sao paulo
renovacao de visto americano sem entrevista
renovação de visto americano sem entrevista
renovação de visto americano site oficial
renovação de visto americano taxa
renovação de visto americano valor
renovação de visto americano vencido
renovação de visto australiano
renovação de visto b1 b2
renovação de visto consulado americano
renovação de visto de turista
renovação de visto de turista americano
renovação de visto dos estados unidos
renovação de visto embaixada americana
renovacao de visto estados unidos
renovação de visto estados unidos
renovacao de visto japones
renovação de visto norte americano
renovação de visto para estados unidos
renovacao de visto para os estados unidos
renovação de visto para os estados unidos
renovacao de visto precisa de entrevista
renovação de visto precisa de entrevista
renovacao de visto sem entrevista
renovação de vistos americanos
renovação do passaporte americano
renovacao do visto
renovação do visto
renovação do visto americano
renovação do visto americano 2021
renovação do visto americano 2022
renovação do visto americano antes do vencimento
renovação do visto americano como fazer
renovação do visto americano em porto alegre
renovação do visto americano passo a passo
renovação do visto americano valor
renovação do visto americano vencido
renovação do visto para os estados unidos
renovacao passaporte americano
renovação simplificada visto americano
renovacao visto
renovacao visto americano
renovação visto americano
renovação visto americano 2021
renovação visto americano 2021 site oficial
renovacao visto americano 2022
renovação visto americano 2023
renovação visto americano 48 meses
renovacao visto americano agendamento
renovação visto americano agendamento
renovação visto americano antes vencimento
renovação visto americano casv
renovação visto americano consulado
renovacao visto americano documentos
renovação visto americano documentos
renovação visto americano documentos necessários
renovação visto americano ds 160
renovação visto americano entrevista
renovação visto americano formulario
renovação visto americano formulario ds 160
renovação visto americano foto
renovação visto americano menor idade
renovação visto americano não vencido
renovação visto americano negado
renovação visto americano online
renovacao visto americano pandemia
renovação visto americano pandemia
renovação visto americano passo a passo
renovacao visto americano porto alegre
renovação visto americano porto alegre
renovação visto americano prazo
renovação visto americano precisa de entrevista
renovação visto americano precisa entrevista
renovação visto americano preço
renovação visto americano quanto tempo
renovação visto americano sao paulo
renovacao visto americano sem entrevista
renovação visto americano site
renovação visto americano site oficial
renovação visto americano turismo
renovação visto americano valor
renovação visto b1 b2
renovação visto b1 b2 americano
renovação visto b2
renovação visto consulado americano
renovação visto estados unidos
renovação visto eua belo horizonte
renovacao visto japones
renovação visto para estados unidos
renovação visto porto alegre
renovação visto turismo americano
renovando o visto americano
renovar de visto americano
renovar de visto americano 2022
renovar do visto americano
renovar o visto
renovar o visto americano
renovar o visto americano 2022
renovar o visto americano antes de expirar
renovar o visto para os estados unidos
renovar passaporte americano
renovar passaporte americano no brasil
renovar passaporte americano valor
renovar passaporte americano vencido
renovar passaporte e visto americano
renovar passaporte nos estados unidos
renovar passaporte português nos estados unidos
renovar passaporte visto americano valido
renovar visto
renovar visto americano
renovar visto americano 2021
renovar visto americano 2022
renovar visto americano 2022 passo a passo
renovar visto americano 2023
renovar visto americano antes de expirar
renovar visto americano antes de vencer
renovar visto americano antes do vencimento
renovar visto americano b1 b2
renovar visto americano belo horizonte
renovar visto americano brasilia
renovar visto americano casv
renovar visto americano consulado
renovar visto americano despachante
renovar visto americano documentos
renovar visto americano ds160
renovar visto americano é mais facil
renovar visto americano em belo horizonte
renovar visto americano em outro pais
renovar visto americano em porto alegre
renovar visto americano em sao paulo
renovar visto americano estando nos eua
renovar visto americano familiar
renovar visto americano fora do brasil
renovar visto americano formulario ds 160
renovar visto americano melhores destinos
renovar visto americano na pandemia
renovar visto americano nao precisa de entrevista
renovar visto americano no brasil
renovar visto americano nos eua
renovar visto americano online
renovar visto americano pandemia
renovar visto americano passo a passo
renovar visto americano porto alegre
renovar visto americano prazo
renovar visto americano precisa de entrevista
renovar visto americano sao paulo
renovar visto americano sem entrevista
renovar visto americano site oficial
renovar visto americano turista
renovar visto americano valor
renovar visto americano vencido
renovar visto antes de vencer
renovar visto australiano
renovar visto b1 b2
renovar visto belo horizonte
renovar visto consulado americano
renovar visto de turismo americano
renovar visto de turista
renovar visto estados unidos
renovar visto estados unidos 2022
renovar visto estudante estados unidos
renovar visto j1
renovar visto nos estados unidos
renovar visto para estados unidos
renovar visto para os estados unidos
renovar visto passaporte
renovar visto porto alegre
renovar visto precisa de entrevista
renovar visto sem entrevista
renovar visto vencido
requerer visto americano
requerimento de visto americano
requisitos para conseguir visto americano
requisitos para o visto americano
requisitos para tirar o visto americano
requisitos para tirar visto americano
requisitos para tirar visto mexicano
requisitos para visto americano
requisitos para visto americano turista
requisitos visto americano
retirar passaporte consulado americano
revalidação visto americano
revalidar visto americano
sao paulo consulado americano
sef visto de trabalho
servico de agendamento de visto americano
serviço de visto americano
sistema de agendamento consulado americano
sistema de agendamento do consulado americano
sistema de agendamento visto americano
site agendamento casv
site agendamento consulado americano
site agendamento de visto americano
site agendamento entrevista visto americano
site agendamento visto americano
site agendar entrevista visto americano
site agendar visto americano
site casv agendamento
site casv visto americano
site consulado americano
site consulado americano brasil
site consulado americano ds 160
site consulado americano em sao paulo
site consulado americano formulario ds 160
site consulado americano no brasil
site consulado americano porto alegre
site consulado americano renovação de visto
site consulado americano sao paulo
site consulado americano visto
site consulado estados unidos
site consulado visto americano
site da embaixada americana
site da embaixada americana ds 160
site da embaixada americana para tirar visto
site da embaixada dos estados unidos
site da imigração americana
site de agendamento de entrevista visto americano
site de agendamento de visto americano
site de agendamento do visto americano
site de agendamento para visto americano
site de agendamento visto americano
site de imigração americana
site de visto americano
site do agendamento do visto americano
site do casv
site do consulado americano
site do consulado americano em são paulo
site do consulado americano no brasil
site do consulado americano no rio de janeiro
site do consulado americano para agendamento de visto
site do consulado americano visto
site do consulado dos estados unidos
site do sistema de agendamento do consulado americano
site do visto americano
site ds 160 visto americano
site embaixada americana
site embaixada americana visto
site embaixada dos estados unidos
site embaixada estados unidos
site entrevista visto americano
site formulario ds 160
site formulario visto americano
site marcar entrevista visto americano
site marcar visto americano
site oficial agendamento visto americano
site oficial consulado americano
site oficial consulado americano no brasil
site oficial consulado americano visto
site oficial da embaixada americana
site oficial da embaixada dos estados unidos
site oficial de agendamento de visto americano
site oficial do consulado americano
site oficial do consulado americano em sao paulo
site oficial do consulado americano no brasil
site oficial do departamento de vistos dos estados unidos
site oficial do sistema de agendamento visto americano
site oficial do visto americano
site oficial ds 160
site oficial embaixada americana
site oficial formulario ds 160
site oficial para agendamento de visto americano
site oficial para renovação de visto americano
site oficial para renovar visto americano
site oficial para tirar visto americano
site oficial para visto americano
site oficial renovação visto americano
site oficial visto americano
site para agendamento de visto americano
site para agendamento do visto
site para agendamento do visto americano
site para agendamento visto americano
site para agendar entrevista no consulado americano
site para agendar entrevista visto americano
site para agendar o visto americano
site para agendar visto americano
site para agendar visto americano sp
site para marcar entrevista no consulado americano
site para marcar entrevista visto americano
site para marcar o visto americano
site para marcar visto americano
site para pagar ds 160
site para preencher a ds 160
site para preencher ds 160
site para preencher ds160
site para preencher formulario ds 160
site para preencher o ds 160
site para preencher o ds160
site para preencher o formulario ds 160
site para preencher visto americano
site para renovação de visto americano
site para renovação do visto americano
site para renovar o visto americano
site para renovar visto americano
site para solicitar visto americano
site para tirar o visto americano
site para tirar visto americano
site para visto americano
site para visto americano ds 160
site preencher ds 160
site preenchimento ds 160
site renovação visto americano
site renovar visto americano
site tirar visto americano
site visto americano
site visto americano agendamento
site visto americano ds 160
solicitação de renovação de visto americano
solicitacao de visto americano
solicitação de visto americano
solicitação de visto americano ds 160
solicitação de visto americano para menor
solicitação de visto americano passo a passo
solicitação de visto americano turista
solicitação de visto de não imigrante online ds 160
solicitação de visto ds 160
solicitação do visto americano
solicitação visto americano ds 160
solicitando visto americano ds 160
solicitar emergencia visto americano
solicitar o visto americano
solicitar o visto americano passo a passo
solicitar renovação de visto americano
solicitar renovação visto americano
solicitar urgencia visto americano
solicitar visto americano
solicitar visto americano para menor
solicitar visto americano passo a passo
solicitar visto americano porto alegre
solicitar visto americano turismo
solicitar visto de turista americano
solicitar visto estados unidos
solicitar visto para estados unidos
solicitar visto turista americano
taxa consulado americano
taxa consulado americano visto
taxa consulado visto americano
taxa consular americana
taxa consular para visto americano
taxa consular visto americano
taxa consular visto americano hoje
taxa consular visto americano valor
taxa de consulado americano
taxa de entrevista visto americano
taxa de renovação de visto americano
taxa de renovação do visto americano
taxa de renovação visto americano
taxa de urgencia visto americano
taxa de visto americano
taxa de visto americano como pagar
taxa de visto americano turista
taxa de visto americano valor
taxa de visto mrv
taxa do consulado americano
taxa do consulado americano 2022
taxa do consulado para visto americano
taxa do visto americano
taxa do visto americano como pagar
taxa do visto americano valor
taxa ds 160 valor
taxa embaixada americana
taxa entrevista visto americano
taxa mrv como pagar
taxa mrv consulado
taxa mrv consulado americano
taxa mrv do consulado
taxa para entrevista de visto americano
taxa para renovação de visto americano
taxa para renovar visto americano
taxa para tirar o visto americano
taxa para tirar visto americano
taxa para visto americano
taxa para visto americano turista
taxa passaporte americano
taxa renovacao visto
taxa renovação visto americano
taxa renovação visto americano 2022
taxa visto americano
taxa visto americano b1 b2
taxa visto americano como pagar
taxa visto americano turismo
taxa visto americano valor
taxa visto b1 b2
taxa visto consulado americano
taxa visto de turista americano
taxa visto mrv
taxa visto turismo americano
taxas do visto americano
taxas para tirar visto americano
tempo para renovação de visto americano
tempo para renovar visto americano
tempo renovação visto americano
tempo visto americano turismo
tentar visto americano
ter visto canadense facilita visto americano
tipo de passaporte ds 160
tipo de passaporte visto americano
tipo de visto
tipo de visto americano
tipo de visto americano b1 b2
tipo de visto americano para turismo
tipo de visto americano turismo
tipo de visto b1 b2
tipo de visto b2
tipo de visto brasileiro
tipo de visto de turismo americano
tipo de visto para os estados unidos
tipo de visto turismo americano
tipo de vistos americano
tipo de vistos para os estados unidos
tipo visto americano
tipo visto americano turismo
tipos de passaporte americano
tipos de visto americano
tipos de visto americano b1 b2
tipos de visto americano e tempo de permanência
tipos de visto americano e valores
tipos de visto americano é valores
tipos de visto americano eb3
tipos de visto americano para morar
tipos de visto americano para trabalho
tipos de visto americano permanente
tipos de visto canada
tipos de visto de trabalho americano
tipos de visto estados unidos
tipos de visto japones
tipos de visto para estados unidos
tipos de visto para morar nos estados unidos
tipos de visto para os estados unidos
tipos de vistos americanos 2022
tipos de vistos americanos para brasileiros
tipos de vistos brasileiros
tipos visto americano
tipos visto estados unidos
tirar o visto
tirar o visto americano
tirar o visto americano 2022
tirar o visto americano em brasilia
tirar o visto americano passo a passo
tirar o visto americano valor
tirar o visto em sao paulo
tirar o visto para os estados unidos
tirar passaporte americano
tirar passaporte americano no brasil
tirar passaporte americano nos eua
tirar passaporte brasileiro nos estados unidos
tirar passaporte e visto americano
tirar passaporte estados unidos
tirar passaporte para estados unidos
tirar passaporte para os estados unidos
tirar visto
tirar visto americano
tirar visto americano 2021
tirar visto americano 2022
tirar visto americano 2022 valor
tirar visto americano 2023
tirar visto americano brasil
tirar visto americano brasilia
tirar visto americano consulado
tirar visto americano de turista
tirar visto americano documentos
tirar visto americano em brasilia
tirar visto americano em outro pais
tirar visto americano em porto alegre
tirar visto americano em sao paulo
tirar visto americano em são paulo
tirar visto americano fora do brasil
tirar visto americano formulario ds 160
tirar visto americano no brasil
tirar visto americano no japão
tirar visto americano online
tirar visto americano pandemia
tirar visto americano passo a passo
tirar visto americano porto alegre
tirar visto americano preço
tirar visto americano quanto custa
tirar visto americano rapido
tirar visto americano sao paulo
tirar visto americano turismo
tirar visto americano valor
tirar visto consulado americano
tirar visto de trabalho americano
tirar visto de transito americano
tirar visto de turista americano
tirar visto e passaporte
tirar visto e passaporte americano
tirar visto em porto alegre
tirar visto em sao paulo
tirar visto em são paulo
tirar visto estados unidos
tirar visto estados unidos turista
tirar visto para estados unidos
tirar visto para os estados unidos
tirar visto passo a passo
tirar visto sao paulo
tirar visto são paulo
tirar visto valor
tire seu visto
todos os tipos de visto americano
todos os vistos americanos
todos tipos de visto americano
trabalhar no consulado americano
trabalhar nos estados unidos com passaporte europeu
trabalhar nos estados unidos com visto de turista
trabalhar nos estados unidos legalmente
trabalho temporario estados unidos
trabalho temporário nos estados unidos
tradução do formulario ds 160
tradução ds 160
tradução formulario ds 160
tudo sobre o visto americano
tudo sobre visto americano
turista brasileiro nos estados unidos
turista nos estados unidos
urgencia visto americano
uruguai precisa de visto para os estados unidos
usembassy vistos
valor atual do visto americano
valor da ds 160
valor da ds 160 hoje
valor da ds160
valor da entrevista no consulado
valor da entrevista no consulado americano
valor da renovação do visto americano
valor da taxa consular para visto americano
valor da taxa de solicitação de visto americano
valor da taxa de visto
valor da taxa de visto americano
valor da taxa de visto para os estados unidos
valor da taxa do consulado americano
valor da taxa do consulado para visto americano
valor da taxa do visto
valor da taxa do visto americano
valor da taxa do visto americano 2021
valor da taxa do visto americano hoje
valor da taxa mrv visto americano
valor da taxa para o visto americano
valor da taxa para renovação de visto americano
valor da taxa para renovar visto americano
valor da taxa para tirar o visto americano
valor da taxa para tirar visto americano
valor da taxa para visto americano
valor da taxa visto americano
valor da taxa visto americano 2022
valor de passaporte americano
valor de passaporte e visto americano
valor de passaporte para estados unidos
valor de um passaporte para os estados unidos
valor de um visto americano
valor de um visto para os estados unidos
valor de visto americano
valor de visto americano 2022
valor de visto para estados unidos
valor despachante visto americano
valor do ds 160
valor do ds 160 hoje
valor do ds160
valor do formulario ds 160
valor do green card americano
valor do passaporte americano
valor do passaporte americano 2022
valor do passaporte e visto americano
valor do passaporte para estados unidos
valor do passaporte para o estados unidos
valor do passaporte para os estados unidos
valor do visto americano
valor do visto americano 2020
valor do visto americano 2021
valor do visto americano 2021 em reais
valor do visto americano 2021 turismo
valor do visto americano 2022
valor do visto americano 2022 em reais
valor do visto americano 2022 turismo
valor do visto americano 2023
valor do visto americano b1 b2
valor do visto americano de turista
valor do visto americano em reais
valor do visto americano hoje
valor do visto americano no brasil
valor do visto americano para trabalho
valor do visto americano para turista
valor do visto americano turismo
valor do visto americano turismo 2022
valor do visto brasileiro para americanos
valor do visto de estudante americano
valor do visto de estudante americano 2022
valor do visto de trabalho americano
valor do visto de turismo americano
valor do visto de turista
valor do visto de turista americano
valor do visto de turista para estados unidos
valor do visto estados unidos
valor do visto j1
valor do visto j1 2022
valor do visto para estados unidos
valor do visto para o estados unidos
valor do visto para os estados unidos
valor do visto para os estados unidos 2022
valor do visto pros estados unidos
valor do visto turismo americano
valor do visto turista americano 2021
valor do visto turista americano 2022
valor entrevista consulado americano
valor entrevista visto americano
valor formulario ds 160
valor para fazer o visto americano
valor para fazer visto americano
valor para o visto americano
valor para renovar o visto americano
valor para renovar visto americano
valor para renovar visto americano 2022
valor para solicitar visto americano
valor para tentar o visto americano
valor para tirar o passaporte americano
valor para tirar o visto
valor para tirar o visto americano
valor para tirar o visto americano 2021
valor para tirar o visto americano 2022
valor para tirar o visto americano hoje
valor para tirar o visto para os estados unidos
valor para tirar passaporte americano
valor para tirar passaporte e visto americano
valor para tirar passaporte para estados unidos
valor para tirar um visto americano
valor para tirar visto americano
valor para tirar visto americano 2021
valor para tirar visto americano 2022
valor para tirar visto americano turista
valor para tirar visto de turista americano
valor para tirar visto para os estados unidos
valor para visto americano
valor para visto americano 2022
valor passaporte americano
valor passaporte americano 2022
valor passaporte e visto americano
valor passaporte estados unidos
valor passaporte para estados unidos
valor renovação de visto americano
valor renovação visto americano
valor renovação visto americano 2022
valor renovar visto americano
valor renovar visto americano 2021
valor renovar visto americano 2022
valor taxa consulado americano
valor taxa consular visto americano
valor taxa de visto americano
valor taxa do visto americano
valor taxa mrv visto americano
valor taxa para visto americano
valor taxa renovação visto americano
valor taxa visto
valor taxa visto americano
valor taxa visto americano 2021
valor tirar visto americano
valor tirar visto americano 2022
valor visto americano
valor visto americano 2021
valor visto americano 2022
valor visto americano 2022 turismo
valor visto americano 2023
valor visto americano em reais
valor visto americano estudante
valor visto americano hoje
valor visto americano porto alegre
valor visto americano turismo
valor visto americano turista
valor visto americano turista 2022
valor visto b1 b2
valor visto estados unidos
valor visto j1
valor visto j1 2022
valor visto para estados unidos
valor visto turismo americano
valor visto turista
valores dos vistos americanos
viajar com visto americano para vencer
viajar para estados unidos precisa de visto
viajar para os estados unidos documentos necessários
viajar para os estados unidos precisa de visto
vila mariana consulado americano
visa embaixada americana
visa estados unidos brasil
visa eua brasil
visa passaporte
visa visto americano
visario state gov
vista estados unidos
visto agendamento
visto agendamento americano
visto agendamento casv
visto agendamento sp
visto agendar
visto agendar entrevista
visto ame
visto amer
visto americana
visto americano
visto americano 10 anos
visto americano 160
visto americano 2021
visto americano 2022
visto americano 2022 agendamento
visto americano 2022 passo a passo
visto americano 2022 porto alegre
visto americano 2022 turismo
visto americano 2022 valor
visto americano 2023
visto americano 2023 agendamento
visto americano 6 meses
visto americano 6 meses para vencer
visto americano 65 anos
visto americano a trabalho
visto americano a vencer
visto americano agencia
visto americano agenda
visto americano agendamento
visto americano agendamento 2021
visto americano agendamento 2022
visto americano agendamento 2023
visto americano agendamento brasilia
visto americano agendamento casv
visto americano agendamento consulado
visto americano agendamento datas
visto americano agendamento de entrevista
visto americano agendamento entrevista
visto americano agendamento familia
visto americano agendamento porto alegre
visto americano agendamento prazo
visto americano agendamento sao paulo
visto americano agendamento site
visto americano agendamento site oficial
visto americano agendamento sp
visto americano agendar
visto americano agendar sp
visto americano ajuda
visto americano após preenchimento ds 160
visto americano aprovado
visto americano aprovado 2022
visto americano assessoria
visto americano atraso
visto americano au pair
visto americano b1
visto americano b1 b2
visto americano b1 b2 o que significa
visto americano b1 b2 valor
visto americano b1 e b2
visto americano b1 ou b2
visto americano b2
visto americano b2 valor
visto americano belém
visto americano belo horizonte
visto americano brasilia
visto americano brasília
visto americano brasilia agendamento
visto americano brasília agendamento
visto americano brasilia valor
visto americano business
visto americano c1
visto americano c1 d
visto americano cadastro
visto americano cancelado
visto americano cancelado o que fazer
visto americano cancelado por 5 anos
visto americano casal
visto americano casv
visto americano casv o que levar
visto americano ceac
visto americano cidadão italiano
visto americano cidades brasil
visto americano com passaporte italiano
visto americano com passaporte vencido
visto americano com urgencia
visto americano como agendar
visto americano como conseguir
visto americano como fazer
visto americano como funciona
visto americano como pagar
visto americano como pagar a taxa
visto americano como preencher
visto americano como preencher o formulario
visto americano como renovar
visto americano como solicitar
visto americano como tirar
visto americano como tirar 2022
visto americano como tirar passo a passo
visto americano consulado
visto americano consulado americano
visto americano consulado brasilia
visto americano consulado porto alegre
visto americano consulado sao paulo
visto americano consultar agendamento
visto americano consultoria
visto americano contato
visto americano contato nos eua
visto americano criancas
visto americano custo
visto americano d160
visto americano data agendamento
visto americano data entrevista
visto americano datas
visto americano datas 2022
visto americano datas disponiveis
visto americano datas disponíveis 2022
visto americano datas disponiveis agendamento
visto americano de emergencia
visto americano de estudante
visto americano de investidor
visto americano de não imigrante ds 160
visto americano de trabalho
visto americano de transito
visto americano de trânsito
visto americano de transito preço
visto americano de turista
visto americano de turista quanto tempo
visto americano de urgencia
visto americano demorando
visto americano despachante
visto americano documentação necessária
visto americano documentos
visto americano documentos ds 160
visto americano documentos entrevista
visto americano documentos necessarios
visto americano documentos necessários
visto americano documentos necessários entrevista
visto americano ds
visto americano ds 160
visto americano ds 160 agendamento
visto americano ds 160 ceac
visto americano ds 160 familia
visto americano ds 160 passo a passo
visto americano ds 160 preencher
visto americano ds 160 site
visto americano ds 160 site oficial
visto americano e 2
visto americano é dificil
visto americano e passaporte
visto americano e2
visto americano eb1
visto americano eb1 e eb2
visto americano eb2
visto americano eb2 niw
visto americano eb3
visto americano eb5
visto americano em 2022
visto americano em belo horizonte
visto americano em brasilia
visto americano em brasília
visto americano em brasilia agendamento
visto americano em familia
visto americano em ingles
visto americano em passaporte vencido
visto americano em poa
visto americano em porto alegre
visto americano em portugues
visto americano em sao paulo
visto americano em são paulo
visto americano embaixada
visto americano embaixada americana
visto americano embaixada brasilia
visto americano embaixada eua
visto americano embassy
visto americano emergencia
visto americano emergencial
visto americano empresa
visto americano entrevista
visto americano entrevista 2022
visto americano entrevista agendamento
visto americano esta
visto americano esta demorando
visto americano estudante passo a passo
visto americano eua
visto americano express
visto americano f
visto americano f1
visto americano facilitado
visto americano familia
visto americano familiar
visto americano familiar 2022
visto americano familiar passo a passo
visto americano formulario
visto americano formulario 160
visto americano formulario ds160
visto americano formulario passo a passo
visto americano g1
visto americano green card
visto americano h1b
visto americano h2a
visto americano h2b
visto americano habilidades especiais
visto americano hoje
visto americano idade
visto americano idosos
visto americano imigrante
visto americano infantil
visto americano info
visto americano intercambio
visto americano investidor
visto americano italiano
visto americano j
visto americano j1
visto americano j1 valor
visto americano l1
visto americano locais brasil
visto americano mais rapido
visto americano marcar
visto americano marcar data
visto americano marcar entrevista
visto americano melhores destinos
visto americano menor
visto americano menor de 18 anos
visto americano menor de 2 anos
visto americano menor de 3 anos
visto americano menor de 5 anos
visto americano menor idade
visto americano moradia
visto americano mrv
visto americano não imigrante
visto americano negado
visto americano negado 214b
visto americano negado como recorrer
visto americano negado o que fazer
visto americano negado por falta de vínculos
visto americano no brasil
visto americano no brasil onde tirar
visto americano no japão
visto americano no passaporte
visto americano no passaporte vencido
visto americano o
visto americano o que é
visto americano o que levar
visto americano o que levar na entrevista
visto americano o que precisa
visto americano onde agendar
visto americano onde fazer
visto americano onde tirar
visto americano onde tirar no brasil
visto americano online
visto americano ou seu dinheiro de volta
visto americano p1 p2 p3 p4
visto americano para advogados
visto americano para aposentados brasileiros
visto americano para artistas
visto americano para atletas
visto americano para baba
visto americano para bebê
visto americano para bebê 2021
visto americano para bebê 2022
visto americano para bebes
visto americano para brasileiro
visto americano para brasileiros 2022
visto americano para cidadão italiano
visto americano para crianças
visto americano para cuidador de idosos
visto americano para disney
visto americano para estrangeiros residentes no brasil
visto americano para estudante
visto americano para europeus
visto americano para familia
visto americano para filhos
visto americano para idosos
visto americano para idosos 2022
visto americano para idosos acima de 80 anos
visto americano para investidor
visto americano para investidor brasileiro
visto americano para italianos
visto americano para maiores de 60 anos
visto americano para maiores de 65 anos
visto americano para menor
visto americano para menor com pais separados
visto americano para menor de 18 anos
visto americano para menor de 5 anos
visto americano para menor desacompanhado
visto americano para militares brasileiros
visto americano para morar
visto americano para passaporte italiano
visto americano para passaporte portugues
visto americano para passeio
visto americano para portugues
visto americano para portugueses
visto americano para que serve
visto americano para trabalho
visto americano para trabalho temporário
visto americano para transito
visto americano para turismo
visto americano para turista 2022
visto americano para turista brasileiro
visto americano para turistas brasileiros
visto americano para vencer
visto americano para viagem
visto americano parcelado
visto americano passaporte
visto americano passaporte brasileiro
visto americano passaporte com menos de 6 meses
visto americano passaporte europeu
visto americano passaporte italiano
visto americano passaporte portugues
visto americano passaporte vencido
visto americano passo a passo
visto americano passo a passo 2022
visto americano passo a passo ds 160
visto americano passos
visto americano permanente
visto americano poa
visto americano policia federal
visto americano porto alegre
visto americano porto alegre 2021
visto americano porto alegre agendamento
visto americano porto alegre documentos
visto americano porto alegre valor
visto americano prazo agendamento
visto americano prazo para agendamento
visto americano prazos
visto americano preço
visto americano preço 2022
visto americano preencher
visto americano preencher ds 160
visto americano preencher formulario
visto americano preencher formulario ds 160
visto americano prestes a vencer
visto americano procedimento
visto americano quais documentos levar
visto americano quando renovar
visto americano quanto custa
visto americano questionario
visto americano r
visto americano r b1 b2
visto americano rapido
visto americano reagendar
visto americano reagendar entrevista
visto americano recem nascido
visto americano recusado
visto americano renovação
visto americano renovação 2021
visto americano renovação 2022
visto americano renovação agendamento
visto americano renovação passo a passo
visto americano renovação prazo
visto americano renovação sem entrevista
visto americano renovação site oficial
visto americano renovação valor
visto americano renovar
visto americano renovar antes do vencimento
visto americano reprovado
visto americano requisitos
visto americano ribeirão preto
visto americano rj
visto americano santa catarina
visto americano sao paulo
visto americano são paulo
visto americano sao paulo agendamento
visto americano são paulo agendamento
visto americano schultz
visto americano site
visto americano site agendamento
visto americano site consulado
visto americano site ds160
visto americano site embaixada
visto americano site oficial
visto americano site oficial ds 160
visto americano solicitar
visto americano sp agendamento
visto americano taxa
visto americano taxa consular
visto americano tipo
visto americano tipo b1 b2
visto americano tipo e
visto americano tipo o
visto americano tipo r
visto americano tipo r b1 b2
visto americano tirar
visto americano trabalho
visto americano trabalho temporario
visto americano transito
visto americano turismo
visto americano turismo 2022
visto americano turismo b1 ou b2
visto americano turismo passo a passo
visto americano turismo preço
visto americano turismo quanto tempo
visto americano turismo tempo
visto americano turismo tipo
visto americano turismo valor
visto americano turista
visto americano turista 2022
visto americano turista agendamento
visto americano turista b2
visto americano turista como tirar
visto americano turista passo a passo
visto americano turista preço
visto americano turista valor
visto americano urgente
visto americano usa
visto americano valido e passaporte vencido
visto americano valor
visto americano valor 2020
visto americano valor 2021
visto americano valor 2022
visto americano valor 2022 em reais
visto americano valor 2023
visto americano valor da taxa
visto americano valor em reais
visto americano valor hoje
visto americano valor renovação
visto americano valor taxa
visto americano valor turista
visto americano venancio 2000
visto americano vencendo
visto americano vencendo posso viajar
visto americano vencido como renovar
visto americano vencido na pandemia
visto americano vencido o que fazer
visto americano vencido renovação
visto americano viagem
visto americano vila mariana
visto americano visa
visto americano visitante
visto americo
visto b1
visto b1 b2
visto b1 b2 americano
visto b1 b2 estados unidos
visto b1 b2 o que é
visto b1 b2 pode trabalhar
visto b1 b2 preço
visto b1 b2 valor
visto b1 e b2
visto b1 e b2 estados unidos
visto b1 estados unidos
visto b1 o que é
visto b1 ou b2
visto b1 pode trabalhar
visto b1 trabalhador domestico
visto b1 valor
visto b12
visto b2
visto b2 americano
visto b2 estados unidos
visto b2 o que é
visto b2 para os estados unidos
visto b2 valor
visto b3 estados unidos
visto brasil estados unidos
visto brasil eua
visto brasil para americanos
visto brasil portugal
visto brasileiro para americanos
visto c
visto c1 estados unidos
visto canada para quem tem visto americano
visto canadense pode entrar nos estados unidos
visto casv
visto como tirar
visto consulado
visto consulado americano
visto consulado americano agendamento
visto consulado americano em sao paulo
visto consulado americano porto alegre
visto consulado americano sao paulo
visto consulado americano são paulo
visto consulado estados unidos
visto consulado porto alegre
visto de
visto de americano para o brasil
visto de angola para o brasil
visto de atleta
visto de au pair estados unidos
visto de cortesia
visto de emergencia
visto de emergencia estados unidos
visto de entrada
visto de entrada nos estados unidos
visto de estudante americano
visto de estudante canada
visto de estudante estados unidos
visto de estudante estados unidos pode trabalhar
visto de estudante estados unidos valor
visto de estudante f1
visto de estudante negado
visto de estudante negado perde o de turista
visto de estudante nos estados unidos
visto de estudante nova zelandia
visto de estudante para estados unidos
visto de estudante para os estados unidos
visto de estudo
visto de estudo canada
visto de habilidades especiais estados unidos
visto de habilidades extraordinárias
visto de imigrante estados unidos
visto de imigrante para os estados unidos
visto de investidor
visto de investidor americano
visto de investidor brasil
visto de investidor estados unidos
visto de não imigrante estados unidos
visto de noiva
visto de noiva americano
visto de noiva estados unidos
visto de noivado
visto de noivado americano
visto de noivo brasil
visto de partner
visto de passaporte para os estados unidos
visto de permanência nos estados unidos
visto de residencia
visto de residencia canada
visto de residencia estados unidos
visto de residencia permanente canada
visto de reunião familiar
visto de schengen
visto de trabalho americano
visto de trabalho estados unidos
visto de trabalho eua preço
visto de trabalho eua valor
visto de trabalho nos estados unidos
visto de trabalho para estados unidos
visto de trabalho para os estados unidos
visto de trabalho temporario nos estados unidos
visto de trânsito
visto de transito americano
visto de transito canada
visto de transito estados unidos
visto de trânsito estados unidos
visto de transito para estados unidos
visto de transito para os estados unidos
visto de turismo canada
visto de turismo eua quanto tempo
visto de turismo para estados unidos
visto de turista
visto de turista americano
visto de turista americano valor
visto de turista b1 b2
visto de turista canadense
visto de turista estados unidos
visto de turista para os estados unidos
visto de turista para os estados unidos dura quanto tempo
visto de urgencia estados unidos
visto de urgência para os estados unidos
visto de viagem
visto de visitante
visto de visitante estados unidos
visto do brasil para eua
visto do brasil para os estados unidos
visto do estados unidos
visto dos estados unidos
visto dos eua para o brasil
visto ds
visto ds 160
visto ds 160 formulario
visto ds 160 o que é
visto ds 160 passo a passo
visto ds 160 valor
visto ds 2019
visto ds160
visto e 2 americano
visto e b2
visto e passaporte americano
visto e passaporte para os estados unidos
visto e1 estados unidos
visto e2
visto e2 americano
visto e2 brasil
visto e2 estados unidos
visto e2 green card
visto e3 estados unidos
visto eb
visto eb 2 estados unidos
visto eb 5 estados unidos
visto eb1 estados unidos
visto eb2
visto eb2 americano
visto eb2 consulado americano
visto eb2 estados unidos
visto eb2 niw para advogados
visto eb2 niw quanto custa
visto eb2nw
visto eb3 do brasil
visto eb3 estados unidos
visto eb3 quanto custa
visto eb5 estados unidos
visto eb5 valor
visto eletronico estados unidos
visto em passaporte vencido
visto embaixada americana
visto embaixada estados unidos
visto emergencial estados unidos
visto entrada estados unidos
visto esta
visto esta estados unidos
visto estado unidos
visto estados unidos
visto estados unidos 2022
visto estados unidos agendamento
visto estados unidos agendar
visto estados unidos b1 b2
visto estados unidos belo horizonte
visto estados unidos brasil
visto estados unidos brasilia
visto estados unidos como tirar
visto estados unidos consulado
visto estados unidos documentos necessários
visto estados unidos ds 160
visto estados unidos embaixada
visto estados unidos entrevista
visto estados unidos esta
visto estados unidos estudante
visto estados unidos formulario
visto estados unidos formulario ds 160
visto estados unidos para brasileiros
visto estados unidos para italianos
visto estados unidos para portugueses
visto estados unidos passaporte europeu
visto estados unidos passaporte vencido
visto estados unidos passo a passo
visto estados unidos porto alegre
visto estados unidos preço
visto estados unidos recife
visto estados unidos renovação
visto estados unidos rio de janeiro
visto estados unidos sao paulo
visto estados unidos trabalho
visto estados unidos turismo
visto estados unidos valor
visto estadunidense
visto estudante americano
visto estudante estados unidos
visto estudante f1
visto eua belo horizonte
visto eua brasil
visto eua cidadania italiana
visto eua consulado
visto eua em porto alegre
visto eua formulário
visto eua no brasil
visto eua passaporte
visto eua passaporte europeu
visto eua porto alegre
visto eua rj
visto eua urgente
visto eus
visto f1
visto f1 consulado americano
visto f1 estados unidos
visto f1 para green card
visto f1 pode trabalhar
visto f1 preço
visto f2 estados unidos
visto facil
visto familia estados unidos
visto familiar estados unidos
visto ferias trabalho canada
visto formulario ds 160
visto green card
visto h2
visto h2b como conseguir
visto h2b estados unidos
visto hb1
visto i20 pode trabalhar
visto investidor americano
visto investidor estados unidos
visto italiano estados unidos
visto italiano estudante
visto italiano para brasileiros
visto j
visto j 1 americano
visto j 1 estados unidos
visto j estados unidos
visto j1 americano
visto j1 consulado americano
visto j1 estados unidos
visto j1 passo a passo
visto j1 pode trabalhar
visto j1 preço
visto j1 trabalho
visto k1 estados unidos
visto l americano
visto l1 estados unidos
visto l1 passo a passo
visto l1b
visto m1
visto na embaixada americana
visto não imigrante estados unidos
visto negado
visto negado 214b
visto negado 214b o que fazer
visto negado 221g
visto negado estados unidos
visto negado fica registrado
visto niw
visto no consulado americano
visto no passaporte para os estados unidos
visto nomade digital estados unidos
visto nômade digital estados unidos
visto norte americano agendamento
visto nos estados unidos
visto nova iorque
visto o1
visto o1 estados unidos
visto onde tirar
visto para
visto para americano entrar no brasil
visto para americanos entrarem no brasil
visto para americanos no brasil
visto para baba estados unidos
visto para brasileiros estados unidos
visto para entrar no estados unidos
visto para entrar nos estados unidos
visto para estados unidos
visto para estados unidos 2022
visto para estados unidos agendamento
visto para estados unidos como tirar
visto para estados unidos porto alegre
visto para estados unidos preço
visto para estados unidos turista
visto para estados unidos valor
visto para estudante
visto para estudante nos estados unidos
visto para ir aos estados unidos
visto para ir para os estados unidos
visto para menor
visto para menor de 18
visto para menor de 5 anos
visto para morar no estados unidos
visto para morar nos estados unidos
visto para nova iorque
visto para nova york preço
visto para o brasil para americanos
visto para o estados unidos 2022
visto para o estados unidos valor
visto para os estados unidos
visto para os estados unidos 2022
visto para os estados unidos agendamento
visto para os estados unidos como tirar
visto para os estados unidos em porto alegre
visto para os estados unidos no rio de janeiro
visto para os estados unidos onde tirar
visto para os estados unidos passo a passo
visto para os estados unidos porto alegre
visto para os estados unidos preço
visto para os estados unidos quanto custa
visto para os estados unidos turismo
visto para os estados unidos turista
visto para os estados unidos valor
visto para os eua em porto alegre
visto para passaporte americano
visto para passeio nos estados unidos
visto para republica dominicana
visto para são tomé e príncipe
visto para trabalhar nos estados unidos
visto para trabalho estados unidos
visto para trabalho nos estados unidos
visto para turismo estados unidos
visto para turismo nos estados unidos
visto para turista estados unidos
visto para viagem aos estados unidos
visto para viajar para os estados unidos
visto para visitar estados unidos
visto para visitar parentes nos estados unidos
visto para yonsei maior de idade
visto passaporte americano
visto passaporte estados unidos
visto passaporte valor
visto permanente brasil
visto permanente estados unidos
visto portugal brasil
visto pro estados unidos valor
visto pros estados unidos
visto r b1 b2
visto religioso estados unidos
visto religioso para os estados unidos
visto renovacao
visto renovação americano
visto residencia estados unidos
visto temporario estados unidos
visto tipo b1 b2
visto tipo b2
visto trabalho americano
visto trabalho brasil
visto trabalho estados unidos
visto transito americano
visto transito estados unidos
visto turismo americano
visto turismo americano valor
visto turismo angola
visto turismo b1 b2
visto turismo eua quanto tempo
visto turismo para estados unidos
visto turismo para os estados unidos
visto turista estados unidos
visto turista estados unidos quanto tempo
visto turista estados unidos tempo
visto turista para os estados unidos
visto u
visto u americano
visto u estados unidos
visto usa brasil
visto usa porto alegre
visto usa sao paulo
visto valor americano
visto vencido
visto vencido americano
visto vencido como renovar
visto vencido estados unidos
visto vencido o que fazer
visto viagem estados unidos
vistoeua
vistos américa assessoria consular
vistos americanos 2022
vistos americanos agendamento
vistos americanos para brasileiros
vistos americanos tipos
vistos eb
vistos estados unidos tipos
vistos negados estados unidos
vistos para estados unidos 2022
www consuladoamericano
```

**Saída**:

```json
[
	{
		"theme": "Formulário DS-160",
		"description": "Preenchimento, acesso, confirmação e dúvidas sobre o formulário principal de solicitação de visto"
	},
	{
		"theme": "Agendamento de Entrevista",
		"description": "Marcação de data e local para entrevista no consulado, incluindo disponibilidade de datas"
	},
	{
		"theme": "Centros de Atendimento (CASV)",
		"description": "Informações sobre agendamento, documentos necessários e procedimentos nos CASV"
	},
	{
		"theme": "Pagamento de Taxas",
		"description": "Processo de pagamento da taxa do visto, emissão de boleto e valores atualizados"
	},
	{
		"theme": "Documentação Necessária",
		"description": "Lista de documentos exigidos para entrevista e diferentes categorias de visto"
	},
	{
		"theme": "Renovação de Visto",
		"description": "Processos para renovar visto, prazos, necessidade de entrevista e documentação"
	},
	{
		"theme": "Tipos de Visto",
		"description": "Diferentes categorias de visto (B1/B2, F1, J1, H1B, etc.) e suas especificações"
	},
	{
		"theme": "Recusas e Problemas",
		"description": "Motivos para negação de visto (214b, 221g) e procedimentos para recorrer"
	},
	{
		"theme": "Entrevista Consular",
		"description": "Preparação, procedimentos, idioma da entrevista e documentos para levar"
	},
	{
		"theme": "Assessoria e Despachantes",
		"description": "Serviços profissionais de auxílio no processo de obtenção de visto"
	},
	{
		"theme": "Locais de Atendimento",
		"description": "Consulados e embaixadas americanas no Brasil e seus endereços"
	},
	{
		"theme": "Valores e Custos",
		"description": "Custos totais do processo de visto, incluindo taxas consulares e serviços"
	},
	{
		"theme": "Passaporte e Visto",
		"description": "Relação entre passaporte e visto, validade e situações especiais"
	},
	{
		"theme": "Elegibilidade e Requisitos",
		"description": "Condições necessárias para obtenção do visto para diferentes perfis"
	},
	{
		"theme": "Situações Especiais",
		"description": "Procedimentos para menores de idade, idosos, emergências e casos específicos"
	},
	{
		"theme": "Prazos e Tempos de Espera",
		"description": "Duração do processo, tempo para agendamento e processamento do visto"
	},
	{
		"theme": "Confirmações e Comprovantes",
		"description": "Documentos de confirmação de agendamento, formulários e pagamentos"
	},
	{
		"theme": "Reagendamento e Cancelamentos",
		"description": "Procedimentos para alterar ou cancelar agendamentos já marcados"
	},
	{
		"theme": "Visto de Turista B1/B2",
		"description": "Especificações, requisitos e procedimentos para visto de turismo e negócios"
	},
	{
		"theme": "Visto de Estudante",
		"description": "Requisitos e procedimentos para visto de estudante (F1, J1) e documentação acadêmica"
	},
	{
		"theme": "Visto de Trabalho",
		"description": "Categorias de visto de trabalho, requisitos e processos específicos"
	},
	{
		"theme": "Green Card e Vistos Permanentes",
		"description": "Processos para obtenção de residência permanente nos EUA"
	},
	{
		"theme": "Visto de Investidor",
		"description": "Requisitos e procedimentos para vistos baseados em investimento (E2, EB-5)"
	},
	{
		"theme": "Visto de Trânsito",
		"description": "Procedimentos para visto de trânsito pelos Estados Unidos"
	},
	{
		"theme": "Emergências e Urgências",
		"description": "Processos para solicitação de visto em situações de emergência comprovada"
	},
	{
		"theme": "Nacionalidades e Isenções",
		"description": "Regras para diferentes nacionalidades e situações de isenção de visto"
	},
	{
		"theme": "Procedimentos Pós-Entrevista",
		"description": "Processos após a entrevista, retirada de passaporte e situações administrativas"
	},
	{
		"theme": "Problemas Técnicos Online",
		"description": "Dificuldades com sistemas, acesso a contas e problemas no preenchimento online"
	},
	{
		"theme": "Fotos e Biometria",
		"description": "Requisitos para fotos oficiais e procedimentos de coleta biométrica"
	},
	{
		"theme": "Visto para Familiares",
		"description": "Processos para visto familiar, documentação e requisitos específicos"
	},
	{
		"theme": "Antecedentes e Histórico",
		"description": "Declaração de antecedentes criminais, histórico de viagens e informações pessoais"
	},
	{
		"theme": "Vínculos com o País de Origem",
		"description": "Comprovação de vínculos fortes com o país de origem para evitar imigração ilegal"
	},
	{
		"theme": "Viagens Anteriores aos EUA",
		"description": "Impacto de viagens anteriores e histórico de compliance com vistos americanos"
	},
	{
		"theme": "Situação Financeira",
		"description": "Comprovação de recursos financeiros para custear a viagem e estadia"
	},
	{
		"theme": "Seguro Saúde e Viagem",
		"description": "Requisitos e recomendações sobre seguros para viajantes internacionais"
	},
	{
		"theme": "Vacinas e Requisitos de Saúde",
		"description": "Exigências de vacinação e condições de saúde para entrada nos EUA"
	},
	{
		"theme": "Visto para Artistas e Atletas",
		"description": "Procedimentos específicos para vistos de artistas, atletas e profissionais do entretenimento"
	},
	{
		"theme": "Visto Religioso",
		"description": "Requisitos e procedimentos para vistos de trabalhadores religiosos"
	},
	{
		"theme": "Visto de Noivado (K-1)",
		"description": "Processos para visto de noivado e união com cidadãos americanos"
	},
	{
		"theme": "Extensão e Mudança de Status",
		"description": "Procedimentos para extensão de estadia ou mudança de categoria de visto dentro dos EUA"
	}
]
```









## 🧠 **Prompt para Classificação de Temas de Queries**

Você é um assistente especialista em categorização semântica e análise de intenção de busca.

Sua tarefa é analisar um JSON de entrada contendo várias queries relacionadas a vistos americanos.  
Cada item possui um campo `"query"` (texto da busca) e um campo `"theme"` com o placeholder `[[REPLACE_WITH_THEME]]`.  

Você também receberá um segundo JSON com uma lista de temas possíveis, cada um contendo:
- `"theme"`: nome do tema
- `"description"`: breve explicação do que o tema cobre.

Sua missão é:
1. Ler **todas as queries** do primeiro JSON.
2. Com base no **significado e contexto da query**, **identificar o tema mais adequado** no segundo JSON.
3. Substituir o valor `[[REPLACE_WITH_THEME]]` pelo nome exato do tema correspondente (campo `"theme"` do segundo JSON).
4. **Manter o restante da estrutura JSON exatamente igual** — inclusive campos como `"avgms"`, `"competition"`, `"cindex"`, etc.
5. Retornar **apenas o JSON final**, sem explicações adicionais.

### Regras de decisão:
- Use a descrição dos temas como guia semântico.  
- Priorize **a intenção da busca** sobre palavras isoladas.
- Se uma query se encaixar em mais de um tema, escolha o mais **específico**.  
- Nunca crie temas novos ou altere nomes de temas existentes.
- O formato de saída deve ser **um JSON válido e idêntico ao original**, apenas com os placeholders substituídos.

### Exemplo simplificado:
#### Entrada:
```json
[
  {"query": "160 visto americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50, "competition": "Baixo", "cindex": 14},
  ...
]
```

#### Lista de temas:

```json
[
	{
		"theme": "Formulário DS-160",
		"description": "Preenchimento, acesso, confirmação e dúvidas sobre o formulário principal de solicitação de visto"
	},
	{
		"theme": "Agendamento de Entrevista",
		"description": "Marcação de data e local para entrevista no consulado, incluindo disponibilidade de datas"
	},
	{
		"theme": "Centros de Atendimento (CASV)",
		"description": "Informações sobre agendamento, documentos necessários e procedimentos nos CASV"
	},
	{
		"theme": "Pagamento de Taxas",
		"description": "Processo de pagamento da taxa do visto, emissão de boleto e valores atualizados"
	},
	{
		"theme": "Documentação Necessária",
		"description": "Lista de documentos exigidos para entrevista e diferentes categorias de visto"
	},
	{
		"theme": "Renovação de Visto",
		"description": "Processos para renovar visto, prazos, necessidade de entrevista e documentação"
	},
	{
		"theme": "Tipos de Visto",
		"description": "Diferentes categorias de visto (B1/B2, F1, J1, H1B, etc.) e suas especificações"
	},
	{
		"theme": "Recusas e Problemas",
		"description": "Motivos para negação de visto (214b, 221g) e procedimentos para recorrer"
	},
	{
		"theme": "Entrevista Consular",
		"description": "Preparação, procedimentos, idioma da entrevista e documentos para levar"
	},
	{
		"theme": "Assessoria e Despachantes",
		"description": "Serviços profissionais de auxílio no processo de obtenção de visto"
	},
	{
		"theme": "Locais de Atendimento",
		"description": "Consulados e embaixadas americanas no Brasil e seus endereços"
	},
	{
		"theme": "Valores e Custos",
		"description": "Custos totais do processo de visto, incluindo taxas consulares e serviços"
	},
	{
		"theme": "Passaporte e Visto",
		"description": "Relação entre passaporte e visto, validade e situações especiais"
	},
	{
		"theme": "Elegibilidade e Requisitos",
		"description": "Condições necessárias para obtenção do visto para diferentes perfis"
	},
	{
		"theme": "Situações Especiais",
		"description": "Procedimentos para menores de idade, idosos, emergências e casos específicos"
	},
	{
		"theme": "Prazos e Tempos de Espera",
		"description": "Duração do processo, tempo para agendamento e processamento do visto"
	},
	{
		"theme": "Confirmações e Comprovantes",
		"description": "Documentos de confirmação de agendamento, formulários e pagamentos"
	},
	{
		"theme": "Reagendamento e Cancelamentos",
		"description": "Procedimentos para alterar ou cancelar agendamentos já marcados"
	},
	{
		"theme": "Visto de Turista B1/B2",
		"description": "Especificações, requisitos e procedimentos para visto de turismo e negócios"
	},
	{
		"theme": "Visto de Estudante",
		"description": "Requisitos e procedimentos para visto de estudante (F1, J1) e documentação acadêmica"
	},
	{
		"theme": "Visto de Trabalho",
		"description": "Categorias de visto de trabalho, requisitos e processos específicos"
	},
	{
		"theme": "Green Card e Vistos Permanentes",
		"description": "Processos para obtenção de residência permanente nos EUA"
	},
	{
		"theme": "Visto de Investidor",
		"description": "Requisitos e procedimentos para vistos baseados em investimento (E2, EB-5)"
	},
	{
		"theme": "Visto de Trânsito",
		"description": "Procedimentos para visto de trânsito pelos Estados Unidos"
	},
	{
		"theme": "Emergências e Urgências",
		"description": "Processos para solicitação de visto em situações de emergência comprovada"
	},
	{
		"theme": "Nacionalidades e Isenções",
		"description": "Regras para diferentes nacionalidades e situações de isenção de visto"
	},
	{
		"theme": "Procedimentos Pós-Entrevista",
		"description": "Processos após a entrevista, retirada de passaporte e situações administrativas"
	},
	{
		"theme": "Problemas Técnicos Online",
		"description": "Dificuldades com sistemas, acesso a contas e problemas no preenchimento online"
	},
	{
		"theme": "Fotos e Biometria",
		"description": "Requisitos para fotos oficiais e procedimentos de coleta biométrica"
	},
	{
		"theme": "Visto para Familiares",
		"description": "Processos para visto familiar, documentação e requisitos específicos"
	},
	{
		"theme": "Antecedentes e Histórico",
		"description": "Declaração de antecedentes criminais, histórico de viagens e informações pessoais"
	},
	{
		"theme": "Vínculos com o País de Origem",
		"description": "Comprovação de vínculos fortes com o país de origem para evitar imigração ilegal"
	},
	{
		"theme": "Viagens Anteriores aos EUA",
		"description": "Impacto de viagens anteriores e histórico de compliance com vistos americanos"
	},
	{
		"theme": "Situação Financeira",
		"description": "Comprovação de recursos financeiros para custear a viagem e estadia"
	},
	{
		"theme": "Seguro Saúde e Viagem",
		"description": "Requisitos e recomendações sobre seguros para viajantes internacionais"
	},
	{
		"theme": "Vacinas e Requisitos de Saúde",
		"description": "Exigências de vacinação e condições de saúde para entrada nos EUA"
	},
	{
		"theme": "Visto para Artistas e Atletas",
		"description": "Procedimentos específicos para vistos de artistas, atletas e profissionais do entretenimento"
	},
	{
		"theme": "Visto Religioso",
		"description": "Requisitos e procedimentos para vistos de trabalhadores religiosos"
	},
	{
		"theme": "Visto de Noivado (K-1)",
		"description": "Processos para visto de noivado e união com cidadãos americanos"
	},
	{
		"theme": "Extensão e Mudança de Status",
		"description": "Procedimentos para extensão de estadia ou mudança de categoria de visto dentro dos EUA"
	}
]
```

#### Saída esperada:

```json
[
  {"query": "160 visto americano", "theme": "Formulário DS-160", "avgms": 50, "competition": "Baixo", "cindex": 14}
]
```

### Agora processe o JSON a seguir:

#### Queries:


```json
[
{"query": "visto americano negado 214b", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano negado como recorrer", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano negado o que fazer", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano negado por falta de vínculos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano no brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano no brasil onde tirar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano no japão", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano no passaporte", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano no passaporte vencido", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano o", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano o que é", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano o que levar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano o que levar na entrevista", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano o que precisa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano onde agendar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano onde fazer", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano onde tirar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto americano onde tirar no brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto americano online", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano ou seu dinheiro de volta", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano p1 p2 p3 p4", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para advogados", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para aposentados brasileiros", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para artistas", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para atletas", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para baba", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para bebê", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para bebê 2021", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 0},
{"query": "visto americano para bebê 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 0},
{"query": "visto americano para bebes", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para brasileiro", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano para brasileiros 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para cidadão italiano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para crianças", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano para cuidador de idosos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para disney", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para estrangeiros residentes no brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para estudante", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano para europeus", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para familia", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para filhos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para idosos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para idosos 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para idosos acima de 80 anos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para investidor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para investidor brasileiro", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para italianos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano para maiores de 60 anos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para maiores de 65 anos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para menor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para menor com pais separados", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para menor de 18 anos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano para menor de 5 anos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano para menor desacompanhado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para militares brasileiros", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano para morar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para passaporte italiano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano para passaporte portugues", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para passeio", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para portugues", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para portugueses", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para que serve", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para trabalho", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano para trabalho temporário", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para transito", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para turismo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para turista 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para turista brasileiro", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para turistas brasileiros", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para vencer", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano para viagem", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano parcelado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano passaporte", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano passaporte brasileiro", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano passaporte com menos de 6 meses", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano passaporte europeu", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano passaporte italiano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano passaporte portugues", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano passaporte vencido", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano passo a passo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano passo a passo 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 0},
{"query": "visto americano passo a passo ds 160", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano passos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano permanente", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano poa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano policia federal", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto americano porto alegre 2021", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano porto alegre agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano porto alegre documentos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano porto alegre valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano prazo agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano prazo para agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano prazos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto americano preço 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 0},
{"query": "visto americano preencher", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano preencher ds 160", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano preencher formulario", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano preencher formulario ds 160", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano prestes a vencer", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano procedimento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano quais documentos levar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano quando renovar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano quanto custa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto americano questionario", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano r", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano r b1 b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano rapido", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano reagendar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano reagendar entrevista", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano recem nascido", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano recusado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano renovação", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50000},
{"query": "visto americano renovação 2021", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano renovação 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 0},
{"query": "visto americano renovação agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano renovação passo a passo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano renovação prazo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano renovação sem entrevista", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano renovação site oficial", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano renovação valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano renovar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano renovar antes do vencimento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano reprovado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano requisitos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano ribeirão preto", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano rj", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano santa catarina", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano sao paulo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano são paulo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano sao paulo agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano são paulo agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano schultz", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano site", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano site agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano site consulado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano site ds160", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano site embaixada", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano site oficial", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano site oficial ds 160", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano solicitar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano sp agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto americano taxa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto americano taxa consular", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano tipo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano tipo b1 b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano tipo e", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano tipo o", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano tipo r", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano tipo r b1 b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano tirar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano trabalho", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano trabalho temporario", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano transito", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turismo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano turismo 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turismo b1 ou b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turismo passo a passo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turismo preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano turismo quanto tempo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turismo tempo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turismo tipo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turismo valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano turista", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano turista 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turista agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turista b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turista como tirar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turista passo a passo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano turista preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano turista valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano urgente", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano usa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano valido e passaporte vencido", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50000},
{"query": "visto americano valor 2020", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano valor 2021", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano valor 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano valor 2022 em reais", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano valor 2023", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano valor da taxa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano valor em reais", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano valor hoje", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano valor renovação", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano valor taxa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano valor turista", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano venancio 2000", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano vencendo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano vencendo posso viajar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano vencido como renovar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano vencido na pandemia", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano vencido o que fazer", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano vencido renovação", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano viagem", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano vila mariana", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto americano visa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americano visitante", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto americo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto b1 b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto b1 b2 americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 b2 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 b2 o que é", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 b2 pode trabalhar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 b2 preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 b2 valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 e b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto b1 e b2 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 o que é", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 ou b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 pode trabalhar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 trabalhador domestico", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b1 valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b12", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto b2 americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b2 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto b2 o que é", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b2 para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b2 valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto b3 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto brasil estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto brasil eua", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto brasil para americanos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto brasil portugal", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto brasileiro para americanos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto c", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto c1 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto canada para quem tem visto americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto canadense pode entrar nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto casv", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto como tirar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto consulado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto consulado americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto consulado americano agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto consulado americano em sao paulo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto consulado americano porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto consulado americano sao paulo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto consulado americano são paulo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto consulado estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto consulado porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de americano para o brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de angola para o brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de atleta", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de au pair estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de cortesia", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de emergencia", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de emergencia estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de entrada", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de entrada nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de estudante americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de estudante canada", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de estudante estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de estudante estados unidos pode trabalhar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de estudante estados unidos valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de estudante f1", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de estudante negado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de estudante negado perde o de turista", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de estudante nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de estudante nova zelandia", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de estudante para estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de estudante para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de estudo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de estudo canada", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de habilidades especiais estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de habilidades extraordinárias", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de imigrante estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de imigrante para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de investidor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de investidor americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de investidor brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de investidor estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de não imigrante estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de noiva", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de noiva americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de noiva estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de noivado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de noivado americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de noivo brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de partner", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de passaporte para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de permanência nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de residencia", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de residencia canada", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de residencia estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de residencia permanente canada", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de reunião familiar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de schengen", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de trabalho americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de trabalho estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de trabalho eua preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de trabalho eua valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de trabalho nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de trabalho para estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de trabalho para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de trabalho temporario nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de trânsito", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de transito americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de transito canada", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de transito estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de trânsito estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de transito para estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de transito para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de turismo canada", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de turismo eua quanto tempo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de turismo para estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de turista", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de turista americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de turista americano valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de turista b1 b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de turista canadense", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de turista estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de turista para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de turista para os estados unidos dura quanto tempo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de urgencia estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de urgência para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de viagem", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto de visitante", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto de visitante estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto do brasil para eua", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto do brasil para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto do estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto dos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto dos eua para o brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto ds", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto ds 160", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto ds 160 formulario", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto ds 160 o que é", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto ds 160 passo a passo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto ds 160 valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto ds 2019", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto ds160", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto e 2 americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto e b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto e passaporte americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto e passaporte para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto e1 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto e2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto e2 americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto e2 brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto e2 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto e2 green card", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto e3 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto eb 2 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb 5 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb1 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto eb2 americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb2 consulado americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb2 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb2 niw para advogados", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb2 niw quanto custa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto eb2nw", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto eb3 do brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb3 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto eb3 quanto custa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb5 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eb5 valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eletronico estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto em passaporte vencido", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto embaixada americana", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto embaixada estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto emergencial estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto entrada estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto esta", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto esta estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estado unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto estados unidos 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto estados unidos agendar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos b1 b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos belo horizonte", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos brasilia", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos como tirar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos consulado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos documentos necessários", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos ds 160", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos embaixada", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos entrevista", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos esta", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos estudante", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto estados unidos formulario", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos formulario ds 160", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos para brasileiros", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos para italianos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos para portugueses", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos passaporte europeu", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos passaporte vencido", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos passo a passo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto estados unidos recife", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos renovação", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos rio de janeiro", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos sao paulo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos trabalho", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto estados unidos turismo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estados unidos valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto estadunidense", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto estudante americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto estudante estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto estudante f1", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eua belo horizonte", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eua brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto eua cidadania italiana", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eua consulado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eua em porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto eua formulário", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto eua no brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto eua passaporte", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eua passaporte europeu", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eua porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto eua rj", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eua urgente", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto eus", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto f1", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto f1 consulado americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto f1 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto f1 para green card", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto f1 pode trabalhar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto f1 preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto f2 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto facil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto familia estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto familiar estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto ferias trabalho canada", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto formulario ds 160", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto green card", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto h2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto h2b como conseguir", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto h2b estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto hb1", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto i20 pode trabalhar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto investidor americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto investidor estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto italiano estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto italiano estudante", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto italiano para brasileiros", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto j", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto j 1 americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto j 1 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto j estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto j1 americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto j1 consulado americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto j1 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto j1 passo a passo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto j1 pode trabalhar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto j1 preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto j1 trabalho", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto k1 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto l americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto l1 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto l1 passo a passo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto l1b", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto m1", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto na embaixada americana", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto não imigrante estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto negado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto negado 214b", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto negado 214b o que fazer", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto negado 221g", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto negado estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto negado fica registrado", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto niw", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto no consulado americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto no passaporte para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto nomade digital estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto nômade digital estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto norte americano agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto nova iorque", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto o1", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto o1 estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto onde tirar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para americano entrar no brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para americanos entrarem no brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para americanos no brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para baba estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para brasileiros estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para entrar no estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para entrar nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para estados unidos 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para estados unidos agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para estados unidos como tirar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para estados unidos porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para estados unidos preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para estados unidos turista", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para estados unidos valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para estudante", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para estudante nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para ir aos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para ir para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para menor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para menor de 18", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para menor de 5 anos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para morar no estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para morar nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para nova iorque", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para nova york preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para o brasil para americanos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para o estados unidos 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 0},
{"query": "visto para o estados unidos valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "visto para os estados unidos 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos como tirar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos em porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos no rio de janeiro", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos onde tirar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos passo a passo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos preço", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para os estados unidos quanto custa", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos turismo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos turista", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para os estados unidos valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para os eua em porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para passaporte americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para passeio nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para republica dominicana", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para são tomé e príncipe", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para trabalhar nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para trabalho estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para trabalho nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto para turismo estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para turismo nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para turista estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para viagem aos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para viajar para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para visitar estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para visitar parentes nos estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto para yonsei maior de idade", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto passaporte americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto passaporte estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto passaporte valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto permanente brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto permanente estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto portugal brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto pro estados unidos valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto pros estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto r b1 b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto religioso estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto religioso para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto renovacao", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto renovação americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto residencia estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto temporario estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto tipo b1 b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto tipo b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto trabalho americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto trabalho brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto trabalho estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto transito americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto transito estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto turismo americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto turismo americano valor", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto turismo angola", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto turismo b1 b2", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto turismo eua quanto tempo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto turismo para estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto turismo para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto turista estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto turista estados unidos quanto tempo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto turista estados unidos tempo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto turista para os estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto u", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "visto u americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto u estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto usa brasil", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto usa porto alegre", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto usa sao paulo", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto valor americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto vencido", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto vencido americano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto vencido como renovar", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto vencido estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto vencido o que fazer", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "visto viagem estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "vistoeua", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 5000},
{"query": "vistos américa assessoria consular", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "vistos americanos 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "vistos americanos agendamento", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50000},
{"query": "vistos americanos para brasileiros", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "vistos americanos tipos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 500},
{"query": "vistos eb", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "vistos estados unidos tipos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "vistos negados estados unidos", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "vistos para estados unidos 2022", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50},
{"query": "www consuladoamericano", "theme": "[[REPLACE_WITH_THEME]]", "avgms": 50}
]
```

Retorne **apenas o JSON atualizado** com os temas substituídos corretamente.

## PROMPT 3 por [[TEMA]]

Você é um especialista em SEO e criação de conteúdo. Recebi uma lista de consultas relacionadas a “Centros de Atendimento (CASV)” e quero criar **1 a 3 artigos** que possam abranger **todas essas consultas**.

Critérios:

1. Cada artigo deve conter:

* `"titulo"`: título claro, descritivo e atraente, com palavras-chave relevantes.
* `"subtitulos"`: lista de H2/H3 que permitam encaixar consultas de forma natural e organizada.
* `"MetaDescription"`: uma meta description curta, atraente e resumida.
2. Não é necessário que todas as consultas apareçam na meta description; elas podem aparecer em qualquer parte do conteúdo (H1, H2, H3 ou corpo).
3. Todas as consultas **devem estar contempladas em algum lugar do artigo**, de forma natural.
4. Evite criar muitos artigos; **máximo 3**.
5. Priorize intenção informativa e prática do usuário, sem perder foco em SEO.
6. Considere tópicos como agendamento, documentos necessários, entrevistas, retirada de passaporte, cidades específicas (São Paulo, Porto Alegre, Brasília, Belo Horizonte) e relação entre CASV e Consulado.

Lista de consultas:
`[INSIRA AQUI A LISTA JSON]`

**Retorne apenas um JSON no seguinte formato**:

```json
[
{
    "titulo": "Título do Artigo 1",
    "subtitulos": [
    "Subtítulo 1",
    "Subtítulo 2",
    "Subtítulo 3"
    ],
    "MetaDescription": "Meta description do artigo 1."
},
{
    "titulo": "Título do Artigo 2",
    "subtitulos": [
    "Subtítulo 1",
    "Subtítulo 2"
    ],
    "MetaDescription": "Meta description do artigo 2."
}
]
```

---

[{"query":"agenda casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv","theme":"Centros de Atendimento (CASV)","avgms":5000},{"query":"agendamento casv 2022","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv datas","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv e consulado","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv e consulado mesmo dia","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv porto alegre","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv sao paulo","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"agendamento casv são paulo","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"agendamento casv sp","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv visto","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv visto americano","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento consular e casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento de visto americano casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento do casv","theme":"Centros de Atendimento (CASV)","avgms":5000},{"query":"agendamento no casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento no casv o que levar","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento no casv sp","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento retirada passaporte casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento visto americano casv","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"agendamento visto casv","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"agendar casv","theme":"Centros de Atendimento (CASV)","avgms":5000},{"query":"agendar casv e consulado em cidades diferentes","theme":"Centros de Atendimento (CASV)","avgms":0},{"query":"agendar casv e consulado no mesmo dia","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendar casv sao paulo","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"agendar casv sp","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendar casv visto americano","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendar entrevista casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendar entrevista no casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendar entrevista visto americano casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendar retirada de passaporte casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendar retirada de passaporte no casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendar visto americano casv","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"agendar visto casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv","theme":"Centros de Atendimento (CASV)","avgms":50000},{"query":"casv agendamento","theme":"Centros de Atendimento (CASV)","avgms":5000},{"query":"casv agendamento 2022","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv agendamento de visto","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"casv agendamento retirada passaporte","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv agendamento sao paulo","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv agendamento sp","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv agendamento telefone","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv agendamento visto","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"casv agendamento visto americano","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv agendar","theme":"Centros de Atendimento (CASV)","avgms":5000},{"query":"casv americano","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv belo horizonte","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"casv brasil","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv brasília está funcionando","theme":"Centros de Atendimento (CASV)","avgms":0},{"query":"casv consulado","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv consulado americano","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv de sao paulo","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv documentos","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv documentos necessários","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv documentos para levar","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv ds 160","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv e consulado","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv e consulado no mesmo dia","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv e entrevista no mesmo dia","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv em porto alegre","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv em sao paulo","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv em são paulo","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv o que é","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"casv o que levar","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"casv ou consulado primeiro","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv pagamento de taxa","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv passaporte","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv porto alegre","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"casv porto alegre agendamento","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv reagendar","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv renovacao de visto","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv renovação de visto","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv sao paulo","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"casv são paulo","theme":"Centros de Atendimento (CASV)","avgms":5000},{"query":"casv são paulo agendamento","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv são paulo sp","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv são paulo vila mariana","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv site","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"casv site oficial","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv sp agendamento","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv visa","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv visto","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"casv visto agendamento","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv visto americano","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"casv visto americano agendamento","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv visto americano brasilia","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv visto americano sao paulo","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"casv visto sao paulo","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"consulado americano casv","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"consulado americano sao paulo casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"consultar agendamento casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"contato casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"contato casv sao paulo","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"documentação casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"documentos casv visto americano","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"documentos levar casv","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"documentos necessarios casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"documentos necessarios para levar no casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"documentos necessarios para o casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"documentos para casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"documentos para levar ao casv","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"documentos para levar casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"documentos para levar no casv","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"documentos para levar no casv 2022","theme":"Centros de Atendimento (CASV)","avgms":0},{"query":"documentos para o casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"entrevista casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"entrevista casv o que levar","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"entrevista no casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"marcar casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"oq levar no casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"posso agendar casv e entrevista no mesmo dia","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"posso agendar casv em outro estado","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"posso marcar casv e consulado no mesmo dia","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"primeiro casv ou consulado","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"site agendamento casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"site casv agendamento","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"site casv visto americano","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"site do casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"visto agendamento casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"visto americano agendamento casv","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"visto americano casv","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"visto americano casv o que levar","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"visto casv","theme":"Centros de Atendimento (CASV)","avgms":50}]

## PROMPT 4 - Consultas faltantes

Você é um especialista em SEO e criação de conteúdo. Tenho uma lista de artigos em JSON, no seguinte formato:

```json
[
  {
    "titulo": "Guia Completo de Agendamento e Atendimento no CASV para Visto Americano",
    "subtitulos": [
      "O que é o CASV e sua relação com o Consulado Americano",
      "Como agendar no CASV: passo a passo",
      "Agendamento no mesmo dia: CASV e Consulado",
      "Agendamentos em diferentes cidades: São Paulo, Porto Alegre, Brasília e Belo Horizonte",
      "Documentos necessários para levar ao CASV",
      "Como funciona a entrevista e o que levar",
      "Retirada de passaporte no CASV",
      "Reagendamento e consultas de agendamento"
    ],
    "MetaDescription": "Tudo sobre CASV: agendamento, documentos, entrevistas e retirada de passaporte em São Paulo, Porto Alegre, Brasília e Belo Horizonte."
  },
  {
    "titulo": "Documentos, Entrevista e Retirada de Passaporte no CASV",
    "subtitulos": [
      "Documentação exigida para o agendamento e entrevista",
      "O que levar no CASV para visto americano",
      "Passo a passo para a entrevista no CASV",
      "Retirada de passaporte: prazos e procedimentos",
      "Pagamentos e taxas no CASV",
      "Dicas para evitar problemas no dia do atendimento"
    ],
    "MetaDescription": "Saiba quais documentos levar, como se preparar para a entrevista e retirar seu passaporte no CASV de forma rápida e organizada."
  },
  {
    "titulo": "CASV: Localizações, Contatos e Agendamento nas Principais Cidades",
    "subtitulos": [
      "CASV em São Paulo: agendamento e endereço",
      "CASV em Porto Alegre: horários e contato",
      "CASV em Brasília e Belo Horizonte: informações importantes",
      "Site oficial do CASV e agendamento online",
      "Telefone e contato para dúvidas",
      "Dicas para agendar em cidades diferentes e mesmo dia com o Consulado"
    ],
    "MetaDescription": "Encontre CASVs em São Paulo, Porto Alegre, Brasília e Belo Horizonte e saiba como agendar online ou por telefone com facilidade."
  }
]
```

Quero que você **adicione as seguintes consultas faltantes** em algum lugar nos artigos — elas podem ser incluídas nos `"subtitulos"` ou dentro da `"MetaDescription"` — mas **não remova nem altere nada que já exista**:

**Consultas faltantes:**

- agenda casv
- agendamento casv
- agendamento casv 2022
- agendamento casv datas
- agendamento casv e consulado
- agendamento casv e consulado mesmo dia
- agendamento casv porto alegre
- agendamento casv sao paulo
- agendamento casv são paulo
- agendamento casv sp
- agendamento casv visto
- agendamento casv visto americano
- agendamento consular e casv
- agendamento de visto americano casv
- agendamento do casv
- agendamento no casv
- agendamento no casv o que levar
- agendamento no casv sp
- agendamento retirada passaporte casv
- agendamento visto americano casv
- agendamento visto casv    

Critérios:

1. Mantenha **todos os títulos, subtítulos e meta descriptions existentes**.
2. Adicione essas consultas, seja como novos subtítulos ou inserindo nas meta descriptions, decisa onde fina melhor .
3. Evite criar novos artigos; apenas ajuste os artigos existentes.
4. **ATENÇÃO**: INCLUIR TODAS AS CONSULTAS CITADAS ACIMA SEM EXCEÇÃO

Retorne apenas o **JSON atualizado**, no mesmo formato que você recebeu, incluindo todas as consultas faltantes.






## Resultado PROMPT 4

```json
[
  {
    "titulo": "Guia Completo de Agendamento e Atendimento no CASV para Visto Americano",
    "subtitulos": [
      "O que é o CASV e sua relação com o Consulado Americano",
      "Como agendar no CASV: passo a passo",
      "Agendamento no mesmo dia: CASV e Consulado",
      "Agendamentos em diferentes cidades: São Paulo, Porto Alegre, Brasília e Belo Horizonte",
      "Documentos necessários para levar ao CASV",
      "Como funciona a entrevista e o que levar",
      "Retirada de passaporte no CASV",
      "Reagendamento e consultas de agendamento",
      "Agenda CASV",
      "Agendamento CASV",
      "Agendamento CASV 2022",
      "Agendamento CASV datas",
      "Agendamento CASV e Consulado mesmo dia",
      "Agendamento CASV Porto Alegre",
      "Agendamento CASV São Paulo",
      "Agendamento CASV SP",
      "Agendamento CASV visto",
      "Agendamento CASV visto americano",
      "Agendamento consular e CASV",
      "Agendamento de visto americano CASV",
      "Agendamento do CASV",
      "Agendamento no CASV",
      "Agendamento no CASV o que levar",
      "Agendamento no CASV SP",
      "Agendamento retirada passaporte CASV",
      "Agendamento visto americano CASV",
      "Agendamento visto CASV"
    ],
    "MetaDescription": "Tudo sobre CASV: agendamento, documentos, entrevistas e retirada de passaporte em São Paulo, Porto Alegre, Brasília e Belo Horizonte. Inclui agenda CASV, agendamento CASV, agendamento CASV 2022, agendamento CASV datas e agendamento CASV e Consulado mesmo dia."
  },
  {
    "titulo": "Documentos, Entrevista e Retirada de Passaporte no CASV",
    "subtitulos": [
      "Documentação exigida para o agendamento e entrevista",
      "O que levar no CASV para visto americano",
      "Passo a passo para a entrevista no CASV",
      "Retirada de passaporte: prazos e procedimentos",
      "Pagamentos e taxas no CASV",
      "Dicas para evitar problemas no dia do atendimento",
      "Agendamento no CASV o que levar",
      "Agendamento retirada passaporte CASV",
      "Agendamento visto americano CASV",
      "Agendamento de visto americano CASV"
    ],
    "MetaDescription": "Saiba quais documentos levar, como se preparar para a entrevista e retirar seu passaporte no CASV de forma rápida e organizada. Inclui agendamento no CASV, agendamento no CASV SP e agendamento CASV visto."
  },
  {
    "titulo": "CASV: Localizações, Contatos e Agendamento nas Principais Cidades",
    "subtitulos": [
      "CASV em São Paulo: agendamento e endereço",
      "CASV em Porto Alegre: horários e contato",
      "CASV em Brasília e Belo Horizonte: informações importantes",
      "Site oficial do CASV e agendamento online",
      "Telefone e contato para dúvidas",
      "Dicas para agendar em cidades diferentes e mesmo dia com o Consulado",
      "Agendamento CASV São Paulo",
      "Agendamento CASV Porto Alegre",
      "Agendamento CASV SP",
      "Agendamento no CASV",
      "Agendamento CASV e Consulado",
      "Agendamento consular e CASV"
    ],
    "MetaDescription": "Encontre CASVs em São Paulo, Porto Alegre, Brasília e Belo Horizonte e saiba como agendar online ou por telefone com facilidade. Inclui agendamento CASV, agendamento CASV visto americano e agendamento CASV visto."
  }
]
```

## PROMPT para criar artigo (versão 1)

Você é um blogueiro profissional, exímio curador e escritor de conteúdo com profundo conhecimento em técnicas de SEO, marketing de conteúdo e engajamento online. Sua missão é transformar os tópicos que eu fornecer em um **artigo completo, impactante e envolvente**, estruturado em **Markdown**, pronto para publicação em blog.

**Regras e diretrizes para produção do artigo:**

1. **Título e subtítulos:** Crie um título chamativo e envolvente, seguido de subtítulos claros (H2 e H3) que organizem o conteúdo de forma lógica.
2. **Introdução:** A introdução deve prender a atenção do leitor imediatamente, contextualizando o tema e destacando a relevância do conteúdo.
3. **SEO:** Inclua palavras-chave de forma natural ao longo do texto, otimize headings, utilize meta-descrições, bullet points, listas numeradas e links internos e externos quando pertinente.
4. **Tom e estilo:** Use um tom profissional, porém próximo e conversacional; varie frases curtas e longas para manter o ritmo; inclua exemplos e dados sempre que possível.
5. **Engajamento:** Insira chamadas à ação estratégicas, perguntas retóricas e convites à interação.
6. **Imagens estratégicas:** Sugira imagens usando a tag `[INSERIR IMAGE: descrição da imagem]` em locais estratégicos que aumentem a beleza do artigo e o engajamento do leitor.
7. **Conclusão:** Conclua reforçando os principais pontos e incentivando o leitor a continuar interagindo, seja compartilhando, comentando ou explorando outros conteúdos do blog.
8. **Markdown:** Utilize Markdown corretamente para títulos, subtítulos, listas, negrito, itálico, links, citações e códigos quando relevante.
9. Sempre que o conteúdo contiver **informações em formato de tabela**, formate-as **no padrão Markdown**, utilizando `|` (pipe) para separar as colunas e `---` para o cabeçalho. O resultado deve seguir **o modelo abaixo**, sem quebras de linha internas, mantendo tudo limpo e alinhado.

	Exemplo mínimo:

	```markdown
	| Cidade | Observações |
	|---------|-------------|
	| São Paulo | Maior fluxo de atendimentos |
	| Recife | Menor volume de agendamentos |
	```
10. Ao longo do artigo, insira 2 a 3 links de referência para outros artigos do nosso blog que sejam relevantes para o tema abordado. Use uma abordagem natural e persuasiva, como em uma recomendação ou chamada para ação, e formate da seguinte forma:
	Exemplo: (Use exatamente esse padrão abaixo porque o nosso framework no backend vai fazer um parse dessa tag RelatedArticle e ajustar tudo)
	```markdown
	<!--<RelatedArticle>
	<id>681ae5985b6e40d...</id>
	<text>✈️ **Pronto para o próximo passo?**
	Confira também nosso artigo sobre [**como preencher o DS-160 corretamente**](<<ARTICLE-URL>>) e evite os erros mais comuns que atrasam a aprovação do visto!</text>
	</RelatedArticle>
	-->
	```
	Infira quais são esses outros artigos do nosso blog
	Garanta que os links se integrem ao contexto do artigo, sem parecer forçado, e variem entre os diferentes tópicos relacionados.

No final, garanta que o artigo seja **coeso, fluido, visualmente agradável** e otimizado tanto para leitores quanto para motores de busca.

**Atenção:** Todos os tópicos necessários para a produção serão fornecidos por mim abaixo. Utilize esses materiais, pois já foram cuidadosamente selecionados, mas sinta-se à vontade para acrescentar informações complementares quando necessário, a fim de tornar o artigo completo e coeso. Estruture o texto com base nesses conteúdos e siga rigorosamente as diretrizes mencionadas acima.

**Tópicos:**

```json
{
	"titulo": "Documentos, Entrevista e Retirada de Passaporte no CASV",
	"subtitulos": [
		"Documentação exigida para o agendamento e entrevista",
		"O que levar no CASV para visto americano",
		"Passo a passo para a entrevista no CASV",
		"Retirada de passaporte: prazos e procedimentos",
		"Pagamentos e taxas no CASV",
		"Dicas para evitar problemas no dia do atendimento"
	],
	"MetaDescription": "Saiba quais documentos levar, como se preparar para a entrevista e retirar seu passaporte no CASV de forma rápida e organizada."
}
```

## PROMPT para criar artigo (versão 2)

Você é um **redator e curador de conteúdo profissional**, especializado em **marketing digital, redação jornalística, copywriting estratégico e SEO avançado**.
Sua missão é transformar os tópicos que eu fornecer em um **artigo completo, envolvente e profissional**, escrito em **Markdown**, pronto para publicação em blog.

---

### 🎯 **Diretrizes obrigatórias**

#### **1. Estrutura editorial**

* Crie um **título forte e informativo**, que desperte interesse e contenha variação natural das palavras-chave.
* Organize o texto com **subtítulos (H2 e H3)** que criem uma leitura fluida e coerente.
* Use **parágrafos curtos**, frases bem ritmadas e intertítulos estratégicos para escaneabilidade.

---

#### **2. Introdução**

* Prenda o leitor já na primeira frase.
* Apresente o tema de forma contextualizada e relevante.
* Mostre por que o assunto é importante e o que o leitor vai aprender.

---

#### **3. Otimização para mecanismos de busca (SEO implícito)**

* **Jamais mencione ou explique técnicas de SEO, palavras-chave ou otimização**.
* Aplique boas práticas **de forma natural e imperceptível**:

  * Use variações semânticas e expressões correlatas.
  * Estruture bem os headings.
  * Use listas, perguntas, e exemplos para enriquecer o texto.
  * Inclua links internos e externos apenas quando forem realmente úteis.
* Evite repetições forçadas e termos genéricos.

---

#### **4. Tom e estilo**

* **Profissional, natural e autoritativo**, como um especialista conversando com o leitor.
* Sem emojis, gírias, informalidades ou expressões artificiais.
* Use voz ativa, linguagem clara e ritmo envolvente.
* Quando cabível, insira exemplos, comparações, dados ou citações de fontes confiáveis.

---

#### **5. Engajamento sutil**

* Estimule o leitor com perguntas retóricas e frases que criem continuidade.
* Inclua chamadas à ação de forma **natural e elegante**, convidando à interação, leitura de outros artigos ou compartilhamento.
* Evite qualquer frase que soe como “clique aqui” ou marketing direto.

---

#### **6. Imagens estratégicas**

* Indique **pontos estratégicos** para imagens com a tag:
  `[INSERIR IMAGEM: descrição da imagem]`
* Priorize imagens relevantes, ilustrativas ou inspiradoras — nada genérico.
* Use no máximo **3 a 4 sugestões por artigo**, distribuídas com propósito visual.

---

#### **7. Conclusão**

* Retome os principais pontos do artigo.
* Reforce o aprendizado e incentive o leitor a continuar explorando o blog.
* Termine com uma frase forte, inspiradora ou de fechamento natural.

---

#### **8. Formatação e acabamento**

* Utilize **Markdown corretamente** (`#`, `##`, `###`, listas, negrito, itálico, citações, etc.).
* O texto deve ser **fluido, coeso, visualmente agradável e escaneável**.
* Não use emojis, ícones, ou explicações técnicas desnecessárias.
* Linguagem 100% natural, como um artigo humano e editorial.

#### **9. Call to action**

Ache o melhor lugar para inserir o `call to action` a seguir. Colocar exatamente o texto a seguir, não remover o alterar nada.

```markdown
[
![fastvistos assessoria de vistos com sede em Campinas](https://fastvistos.com.br/assets/images/blog/fastvistos__fastvistos-assessoria-de-vistos-com-sede-em-campinas.webp)](https://fastvistos.com.br/)
👉 Precisa de ajuda, entre em contato pelo nosso <a href="https://wa.me/551920422785" target="_blank">WhatsApp ↗</a> — estamos à disposição para esclarecer **qualquer questão, sem compromisso**.
```

### **10. Exemplo de estrutura

* Sempre colocar o título principal entre <!--# [[TÍTULO]]-->
* Sempre colocar um subtítulo `Introdução` com um parágrafo introdutório.

### **11. Tabelas

Sempre que o conteúdo contiver **informações em formato de tabela**, formate-as **no padrão Markdown**, utilizando `|` (pipe) para separar as colunas e `---` para o cabeçalho. O resultado deve seguir **o modelo abaixo**, sem quebras de linha internas, mantendo tudo limpo e alinhado.
	
	Exemplo mínimo:

	```markdown
	| Cidade | Observações |
	|---------|-------------|
	| São Paulo | Maior fluxo de atendimentos |
	| Recife | Menor volume de agendamentos |
	```

### **12. Links de referência

Ao longo do artigo, insira 2 a 3 links de referência para outros artigos do nosso blog que sejam relevantes para o tema abordado. Use uma abordagem natural e persuasiva, como em uma recomendação ou chamada para ação, e formate da seguinte forma:
	Exemplo: (Use exatamente esse padrão abaixo porque o nosso framework no backend vai fazer um parse dessa tag RelatedArticle e ajustar tudo)

	```markdown
	<!--<RelatedArticle>
	<id>681ae5985b6e40d...</id>
	<text>✈️ **Pronto para o próximo passo?**
	Confira também nosso artigo sobre [**como preencher o DS-160 corretamente**](<<ARTICLE-URL>>) e evite os erros mais comuns que atrasam a aprovação do visto!</text>
	</RelatedArticle>
	-->
	```

	Infira quais são esses outros artigos do nosso blog
	Garanta que os links se integrem ao contexto do artigo, sem parecer forçado, e variem entre os diferentes tópicos relacionados.

---

### **Tópicos:**

```json
{
	"titulo": "Documentos, Entrevista e Retirada de Passaporte no CASV",
	"subtitulos": [
		"Documentação exigida para o agendamento e entrevista",
		"O que levar no CASV para visto americano",
		"Passo a passo para a entrevista no CASV",
		"Retirada de passaporte: prazos e procedimentos",
		"Pagamentos e taxas no CASV",
		"Dicas para evitar problemas no dia do atendimento"
	],
	"MetaDescription": "Saiba quais documentos levar, como se preparar para a entrevista e retirar seu passaporte no CASV de forma rápida e organizada."
}
```

## Prompt Final

Você receberá dois artigos sobre o mesmo assunto, porém com versões diferentes. Sua missão é analisar, comparar e **criar um novo artigo unificado**, que reúna:

1. Os pontos que os artigos têm em comum.
2. Os pontos que se complementam entre si.
3. As partes que estão melhor escritas ou mais completas.

**Regras para unificação e produção do artigo final:**

* Manter **clareza, coesão e fluidez** ao combinar trechos de diferentes artigos.
* Reescrever onde necessário para que o texto fique **uniforme em estilo e tom**.
* Evitar repetições desnecessárias; use apenas o que agrega valor.
* Priorizar **informações corretas, completas e atualizadas**.
* Organizar o artigo de forma lógica: introdução, desenvolvimento, conclusão (ou subtítulos coerentes).
* Usar uma linguagem **profissional, objetiva e envolvente**.
* Se houver conflito entre informações, **selecionar a versão mais confiável ou explicar brevemente a divergência**.
* Incluir exemplos, dados ou detalhes relevantes de todos os artigos, quando possível, para enriquecer o conteúdo.
* Quebrar parágrafos grandes e volumosos em parágrafos menores para facilitar a leitura. 
* Ache o melhor lugar para inserir o call to action a seguir. Coloque exatamente o texto, sem remover ou alterar nada:
    ```markdown
    [
    ![fastvistos assessoria de vistos com sede em Campinas](https://fastvistos.com.br/assets/images/blog/fastvistos__fastvistos-assessoria-de-vistos-com-sede-em-campinas.webp)](https://fastvistos.com.br/)
    👉 Precisa de ajuda, entre em contato pelo nosso <a href="https://wa.me/551920422785" target="_blank">WhatsApp ↗</a> — estamos à disposição para esclarecer **qualquer questão, sem compromisso**.
    ```
* Sempre que gerar uma tabela em Markdown para artigos, use o formato completo com | para separar colunas e - para o cabeçalho, mantendo todas as colunas alinhadas e o texto organizado. Não use listas simples ou texto separado por quebras de linha; a tabela deve ser legível e pronta para publicação em Markdown.”
* Não esqueça de copiar as sugestões de **imagens estratégicas:** nos artigos. 

**Formato de entrega:**

* Artigo final completo, pronto para publicação.
* Opcional: Ao final, pode adicionar um **resumo ou conclusão reforçando os pontos principais**.

---








## Pedir para adicionar mais coisas no artigo

Quero que você revise e edite o artigo abaixo sobre o CASV (Centro de Atendimento ao Solicitante de Visto).

Seu objetivo é **adicionar subtítulos e seções otimizadas** com os seguintes temas e palavras-chave, integrando-os naturalmente ao texto já existente, **sem remover ou prejudicar os termos originais** do artigo:

* CASV em São Paulo: agendamento e endereço
* CASV em Porto Alegre: horários e contato
* CASV em Brasília e Belo Horizonte: informações importantes
* Site oficial do CASV e agendamento online
* Telefone e contato para dúvidas
* Dicas para agendar em cidades diferentes e mesmo dia com o Consulado

Instruções adicionais:

* Mantenha o **tom e estilo do artigo original**.
* Cada novo subtítulo deve conter **texto explicativo original e informativo**, não apenas a frase-chave.
* Otimize naturalmente o artigo para SEO, **sem repetir excessivamente as palavras-chave**.
* Garanta que a leitura continue fluida e coerente.
* Não altere o conteúdo essencial existente, apenas amplie.

--- 

Aqui está o artigo atual:
[COLOQUE O ARTIGO ATUAL AQUI]




## faq

Este é o meu artigo, pesquise e faça um faq bem completo de perguntas e respostas de duvidas que nao foram abordadas no artigo:


Convert this faq to this json format:
[
    {
        question: '...',
        answer: '...',
    },
]
