const consultas = [{"query":"agenda casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv","theme":"Centros de Atendimento (CASV)","avgms":5000},{"query":"agendamento casv 2022","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv datas","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv e consulado","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv e consulado mesmo dia","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv porto alegre","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv sao paulo","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"agendamento casv são paulo","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"agendamento casv sp","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv visto","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento casv visto americano","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento consular e casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento de visto americano casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento do casv","theme":"Centros de Atendimento (CASV)","avgms":5000},{"query":"agendamento no casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento no casv o que levar","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento no casv sp","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento retirada passaporte casv","theme":"Centros de Atendimento (CASV)","avgms":50},{"query":"agendamento visto americano casv","theme":"Centros de Atendimento (CASV)","avgms":500},{"query":"agendamento visto casv","theme":"Centros de Atendimento (CASV)","avgms":500}]; // Array completo omitido por brevidade

const artigos = [
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

// Função para validar se todas as queries estão contempladas nos artigos
function validarConsultas(consultas, artigos) {
  const textoArtigos = artigos.map(a => (
    [a.titulo, ...a.subtitulos, a.MetaDescription].join(" ").toLowerCase()
  )).join(" ");

  const faltando = consultas.filter(c => !textoArtigos.includes(c.query.toLowerCase()));

  if (faltando.length === 0) {
    console.log("Todas as consultas foram contempladas nos artigos!");
  } else {
    console.log("Consultas não contempladas:");
    faltando.forEach(f => console.log(`- ${f.query}`));
  }
}

validarConsultas(consultas, artigos);
