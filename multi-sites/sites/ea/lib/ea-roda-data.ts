/**
 * Dados da "Roda de recursos" (hero da home).
 * Fonte: docs/Roda de recursos_ onde a tecnologia reduz custo.html
 * Para editar textos, perguntas ou verbos, mexa só aqui.
 */

// Ícones 24×24, traço 1.6, desenhados para ficar nítidos de 24px (cards) a 48px (roda).
export const ICONS: Record<string, string> = {
  ia: '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/>',
  cel: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3M10 5.5h4"/>',
  pai: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7.5 16.5v-4M12 16.5v-9M16.5 16.5v-6"/>',
  iot: '<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 000 8.4M16.2 7.8a6 6 0 010 8.4M4.9 4.9a10 10 0 000 14.2M19.1 4.9a10 10 0 010 14.2"/>',
  aut: '<path d="M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  int: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/><path d="M10.5 6.75H14a3 3 0 013 3v3.75M13.5 17.25H10a3 3 0 01-3-3V10.5"/>',
  cam: '<path d="M3.5 8h3.2l1.6-2.5h7.4L17.3 8h3.2v11.5h-17z"/><circle cx="12" cy="13.5" r="3.6"/>',
  geo: '<path d="M12 21.5s-6.5-5.7-6.5-11a6.5 6.5 0 0113 0c0 5.3-6.5 11-6.5 11z"/><circle cx="12" cy="10.5" r="2.4"/>',
  msg: '<path d="M3.5 5h17v12H10l-4.5 3.5V17h-2z"/><path d="M8 9.5h8M8 12.5h5"/>',
  voz: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11.5a7 7 0 0014 0M12 18.5v3M9 21.5h6"/>',
  doc: '<path d="M6 2.5h8.5L19 7v14.5H6z"/><path d="M14 2.5V7h5M9 12h7M9 15.5h7M9 19h4"/>',
  bd: '<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
};

export type Verbo = [verbo: string, o_que: string, pergunta: string];
export interface Recurso {
  k: string;
  n: string;
  /** cenário curto mostrado no topo do painel */
  c: string;
  /** perguntas para o dono imaginar o problema na própria empresa */
  q: string[];
  /** verbos: o que a tecnologia faz hoje */
  v: Verbo[];
}

export const RECURSOS: Recurso[] = [
  { k: 'ia', n: 'IA',
    c: 'Uma pessoa lê e-mails de fornecedores e digita os pedidos no sistema. A IA lê, preenche e só pede ajuda quando tem dúvida.',
    q: ['Tem documentos, e-mails ou contratos que alguém lê e depois digita no sistema?', 'Tem perguntas de clientes que se repetem o dia todo?', 'Alguma decisão depende sempre da experiência de uma pessoa, como orçar, classificar ou aprovar?', 'Tem informação espalhada em pastas e planilhas que as pessoas perdem tempo procurando?'],
    v: [['Entender', 'Lê e interpreta texto livre: e-mails, contratos, laudos, mensagens.', 'Alguém lê textos longos para depois tomar uma decisão ou preencher algo?'], ['Responder', 'Responde dúvidas de clientes e da equipe com base nos dados da empresa.', 'Que perguntas se repetem o dia todo e têm resposta conhecida?'], ['Classificar', 'Separa, etiqueta e prioriza itens: chamados, pedidos, documentos, clientes.', 'Alguém triaja ou direciona coisas que chegam todo dia?'], ['Prever', 'Antecipa demanda, atraso, falha, cancelamento e inadimplência.', 'O que você só descobre depois que o problema já aconteceu?'], ['Gerar', 'Escreve textos, respostas, relatórios, propostas e resumos.', 'Quem escreve a mesma coisa várias vezes, mudando só alguns dados?'], ['Recomendar', 'Sugere preço, produto, rota, próxima ação ou melhor decisão.', 'Que decisão depende sempre da experiência de uma pessoa específica?']] },
  { k: 'cel', n: 'App no celular',
    c: 'O técnico termina o serviço, coleta a assinatura e lança tudo no celular. O escritório recebe pronto, sem digitar.',
    q: ['Tem equipe fora da empresa que depois passa as informações para o escritório?', 'Alguém anota em papel ou manda mensagem solta e depois outra pessoa digita?', 'Alguma aprovação ou ordem depende de ligação e poderia chegar como notificação com confirmação?', 'Clientes ou fornecedores poderiam fazer pedidos e consultas sozinhos por um app ou link?'],
    v: [['Coletar em campo', 'Registra dados no local, com formulário e assinatura, mesmo sem internet.', 'Alguém anota em papel ou mensagem solta e depois outra pessoa digita?'], ['Aprovar', 'Libera pedidos, descontos e pagamentos direto do celular.', 'Alguma aprovação trava até o responsável chegar ao escritório?'], ['Notificar a equipe', 'Avisa a equipe na hora certa, com confirmação de leitura.', 'Algo importante depende de ligação ou de alguém lembrar de avisar?'], ['Registrar em campo', 'Equipe externa lança serviço, visita ou entrega sem voltar à empresa.', 'Sua equipe de rua só atualiza o sistema no fim do dia?'], ['Acessar de qualquer lugar', 'Consulta e opera o sistema da empresa de onde estiver.', 'O que você precisa consultar ou resolver e hoje só dá no escritório?']] },
  { k: 'pai', n: 'Painéis',
    c: 'O dono abre uma tela de manhã e vê vendas, estoque, atrasos e contas a receber, sem pedir relatório a ninguém.',
    q: ['Que informações você gostaria de ver todo dia em uma tela só?', 'Algum relatório depende de juntar dados de várias planilhas ou sistemas?', 'Que alerta você gostaria de receber sozinho: vencimento, estoque baixo, atraso, meta fora do previsto?'],
    v: [['Consolidar', 'Junta dados de vários sistemas e planilhas em uma tela só.', 'Alguém monta relatório copiando de vários lugares?'], ['Comparar', 'Mostra meta contra realizado, mês contra mês, unidade contra unidade.', 'Que comparação você gostaria de ver e hoje não consegue?'], ['Alertar', 'Avisa sozinho quando algo foge do esperado: atraso, estoque, vencimento.', 'O que você só percebe quando já é tarde?'], ['Projetar', 'Estima o caixa, as vendas e a necessidade de compra para os próximos meses.', 'Que decisão você toma sem enxergar o que vem pela frente?']] },
  { k: 'int', n: 'Integração',
    c: 'O pedido entra no WhatsApp, vira venda no sistema, gera a nota e atualiza o estoque. Ninguém copia dado de um lugar para o outro.',
    q: ['Quais sistemas ou planilhas não conversam entre si e obrigam alguém a copiar dados?', 'Algum número aparece diferente em dois sistemas?', 'Alguém baixa um arquivo de um sistema para subir em outro?'],
    v: [['Conectar', 'Liga sistemas que não conversam entre si, por API ou importação.', 'Quais sistemas obrigam alguém a copiar dado de um para outro?'], ['Sincronizar', 'Mantém estoque, clientes e preços iguais em todos os lugares.', 'Já aconteceu de dois sistemas mostrarem números diferentes?'], ['Importar e exportar', 'Troca arquivos e planilhas com outros sistemas, sem ninguém baixar, ajustar e subir na mão.', 'Alguém baixa um arquivo de um sistema para subir em outro?']] },
  { k: 'aut', n: 'Automação',
    c: 'Toda segunda às 7h o relatório de vendas chega pronto ao dono. Quando um pagamento atrasa, a cobrança sai sozinha.',
    q: ['Tem tarefa que alguém precisa lembrar de fazer todo dia, semana ou mês?', 'Algum processo para quando uma pessoa específica falta?', 'Algum processo passa por várias pessoas e trava quando alguém demora?'],
    v: [['Agendar', 'Roda rotinas sozinho no horário certo: gerar o relatório toda segunda às 7h, enviar as cobranças no dia 5, fazer o backup de madrugada.', 'Que tarefa alguém precisa lembrar de fazer todo dia, semana ou mês?'], ['Disparar ações', 'Um evento aciona o próximo passo: venda gera nota, atraso gera cobrança.', 'O que acontece em cadeia depois de uma venda ou de um pedido?'], ['Encadear etapas', 'Liga várias tarefas em sequência, com pausa para aprovação humana quando precisa.', 'Algum processo passa por várias pessoas e trava quando alguém demora?']] },
  { k: 'cam', n: 'Visão computacional',
    c: 'Uma câmera na linha de produção confere se o produto saiu certo, conta as peças e avisa quando algo foge do padrão.',
    q: ['Alguma conferência é feita a olho, como contar, checar qualidade ou verificar uma regra?', 'Tem custo ligado a perda, desperdício, furto ou acesso indevido?', 'Alguma ocorrência exige registro com foto, como avaria, entrega ou vistoria?', 'O controle de entrada e saída de pessoas ou veículos é feito na mão?'],
    v: [['Ler', 'Lê a imagem, entende o que ela mostra (com OCR para texto, códigos e mostradores) e já age: lê a placa e abre a cancela, lê o QR e dá baixa no estoque, lê o mostrador e avisa se passou do limite.', 'Alguém olha para alguma coisa, entende o que ela mostra e depois faz algo a partir disso?'], ['Identificar', 'Reconhece objetos, produtos, pessoas e placas em uma imagem.', 'Alguém precisa olhar e dizer o que é ou quem é?'], ['Medir e contar', 'Estima dimensão, volume, peso, temperatura e quantidade.', 'Alguém conta, mede ou estima algo na mão ou a olho?'], ['Conferir', 'Aponta defeitos, confere conformidade e compara com o padrão.', 'Alguma conferência ou inspeção é feita a olho?'], ['Acompanhar', 'Detecta movimento, fluxo, eventos e analisa vídeo em tempo real.', 'Alguém precisa ficar de olho em um lugar ou processo o tempo todo?'], ['Registrar', 'Guarda foto com GPS e hora, gera laudo e prova do que foi feito.', 'Já perdeu dinheiro por não ter prova de como algo estava ou foi entregue?'], ['Interpretar', 'Descreve a cena, responde perguntas sobre a imagem, resume e busca no vídeo.', 'Alguém assiste a vídeo ou analisa foto para depois escrever o que viu?']] },
  { k: 'geo', n: 'Localização',
    c: 'O gestor vê todos os veículos no mapa, o sistema monta a melhor rota e confirma que cada visita aconteceu no endereço certo.',
    q: ['Você acompanha veículos, equipes ou entregas por ligação e mensagem?', 'Alguém monta roteiros de visita ou entrega pela experiência?', 'O registro de presença ou serviço em campo depende só da palavra do funcionário?', 'Algum custo ou comissão poderia ser calculado pela distância ou pelo tempo no local?'],
    v: [['Rastrear', 'Mostra onde estão veículos, equipes e entregas em tempo real.', 'Você pergunta por ligação onde cada um está?'], ['Roteirizar', 'Monta a melhor rota e reduz combustível e tempo.', 'Alguém decide as rotas pela experiência?'], ['Delimitar áreas', 'Avisa quando alguém entra ou sai de um local ou região.', 'Existe lugar onde veículo ou equipe não deveria estar, ou deveria ter estado?'], ['Comprovar presença', 'Confirma que a visita ou o serviço ocorreu no endereço certo.', 'O registro de serviço depende só da palavra do funcionário?'], ['Calcular distância', 'Calcula frete, comissão e reembolso pela distância e pelo tempo.', 'Algum valor é calculado manualmente a partir de quilometragem?']] },
  { k: 'iot', n: 'IoT',
    c: 'Um sensor na câmara fria mede a temperatura o tempo todo e avisa o dono quando passa do limite, antes de a mercadoria estragar.',
    q: ['Algum equipamento quebra sem aviso e só se descobre depois?', 'Alguém passa pelo local para ver se está tudo normal: temperatura, nível, funcionamento?', 'Você paga energia, água ou gás sem saber onde está o desperdício?'],
    v: [['Monitorar', 'Sensores, em equipamentos com sistema embarcado, medem temperatura, vibração, consumo e nível o dia todo e mandam para o sistema.', 'Alguém passa para olhar ou anotar medidas de equipamento ou ambiente?'], ['Alertar', 'Avisa quando uma medida sai do normal, antes de virar prejuízo.', 'Algum problema só aparece quando a mercadoria já estragou ou a máquina já parou?'], ['Controlar à distância', 'Liga, desliga e ajusta equipamentos por comando ou por regra: luz, ar-condicionado, bomba.', 'Alguém precisa ir ao local só para ligar, desligar ou ajustar algo?'], ['Medir consumo', 'Mede energia, água e gás por área ou equipamento e mostra onde está o desperdício.', 'Você sabe o que mais gasta energia ou água na empresa?'], ['Prever manutenção', 'Percebe sinais de desgaste e avisa antes de a máquina quebrar.', 'Quanto custa uma hora de máquina parada, e quantas vezes parou sem aviso?']] },
  { k: 'msg', n: 'Comunicação',
    c: 'O cliente confirma consulta, recebe lembrete de pagamento e pede orçamento pelo WhatsApp. O sistema responde e registra tudo.',
    q: ['Quanto tempo sua equipe gasta respondendo, confirmando ou cobrando por WhatsApp e e-mail?', 'Pedidos, orçamentos ou agendamentos chegam por mensagem e alguém passa para o sistema?', 'Clientes esquecem pagamento, consulta ou renovação?'],
    v: [['Atender', 'Responde clientes pelo WhatsApp e passa para humano só o que precisa.', 'Quanto tempo sua equipe gasta respondendo as mesmas perguntas?'], ['Lembrar', 'Envia lembretes de consulta, vencimento, renovação e entrega.', 'Clientes esquecem pagamento, consulta ou prazo?'], ['Cobrar', 'Faz a cobrança automática e acompanha quem pagou.', 'Alguém cobra manualmente e perde o ritmo?'], ['Confirmar', 'Pede e registra confirmação de presença, pedido ou entrega.', 'Há faltas ou cancelamentos de última hora que custam caro?'], ] },
  { k: 'voz', n: 'Voz',
    c: 'O atendimento ou a reunião é gravado, e o sistema transcreve, resume e registra as ações combinadas.',
    q: ['Alguma reunião, ligação ou atendimento precisa ser resumido ou registrado depois?', 'Seus funcionários preferem mandar áudio a digitar?', 'Algum relatório de campo poderia ser ditado em vez de escrito?'],
    v: [['Transcrever', 'Transforma ligações e áudios em texto pesquisável. Exemplo: audita 100% das chamadas e acha palavras de risco, como “cancelar” ou “processo”.', 'Se um cliente diz que recebeu um desconto por telefone, como você comprova o que foi dito?'], ['Comandar', 'Opera o sistema por comando de voz, com as mãos livres.', 'Há trabalho em que a pessoa está com as mãos ocupadas e precisa registrar ou acionar algo?'], ['Registrar por áudio', 'O funcionário fala e o sistema organiza o registro no formato certo.', 'Seus funcionários preferem mandar áudio a digitar?']] },
  { k: 'bd', n: 'Banco de dados',
    c: 'O dono pergunta “quanto o cliente X comprou este ano?” e a resposta vem em segundos, sem abrir planilha nem procurar quem sabe.',
    q: ['Existe informação importante que só uma pessoa sabe onde está?', 'Você tem várias planilhas com o mesmo cadastro de clientes?', 'Já perdeu dado por apagar um arquivo ou trocar de computador?'],
    v: [['Centralizar', 'Tira os dados de planilhas e pastas soltas e junta num lugar só.', 'Existe informação importante que só uma pessoa sabe onde está?'], ['Buscar', 'Acha qualquer cliente, pedido ou documento em segundos.', 'Alguém perde tempo procurando papel, arquivo ou cadastro antigo?'], ['Cruzar', 'Relaciona clientes, vendas e estoque, o que a planilha não faz bem.', 'Você tem uma pergunta sobre o negócio que exige juntar dados de lugares diferentes?'], ['Guardar histórico', 'Registra quem mudou o quê e quando, e permite voltar atrás.', 'Já aconteceu de alguém alterar ou apagar um dado e ninguém saber quem?'], ['Proteger', 'Controla quem vê cada informação e mantém cópias de segurança.', 'Se o computador de alguém quebrar hoje, o que se perde?']] },
];
