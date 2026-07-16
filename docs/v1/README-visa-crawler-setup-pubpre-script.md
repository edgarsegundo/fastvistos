# Visa-Crawler API Server Setup

## Overview

O site `centraldevistos` depende de um serviço API externo chamado **visa-crawler**, que fornece dados de países, vistos e requisitos de viagem via `GET /api/visa-countries`.

Esse serviço **não está** no repo `fastvistos` — ele vive em um projeto separado e precisa estar rodando **antes de testar ou fazer deploy do `centraldevistos`**.

## Localização

O servidor visa-crawler está em:
```
/Users/edgar/Repos/openclaw/edgar/api/
```

Nesse diretório você encontrará:
- `server.js` — o servidor Express
- `visa-crawler.routes.js` — as rotas de API
- `.env` — configuração (variáveis de ambiente)
- `package.json` — dependências Node.js

## Como rodar

### 1. Navegue até o diretório
```bash
cd /Users/edgar/Repos/openclaw/edgar/api
```

### 2. Instale dependências (primeira vez)
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Copie o template se ainda não tiver um `.env`:
```bash
cp .env-template .env
```

Depois edite `.env` e preencha as variáveis necessárias (pelo menos `API_KEY_MICROSEVICESADM` e `FASTVISTOS_BUSINESS_ID` devem estar preenchidas se você faz requisições autenticadas).

### 4. Inicie o servidor
```bash
node server.js
```

Você verá:
```
API listening on http://localhost:3001
```

### 5. Teste se está funcionando
```bash
curl http://localhost:3001/api/visa-countries
```

Deve retornar um JSON com a lista de países.

## Quando rodar

### Desenvolvimento local
Sempre que for **testar o `centraldevistos` localmente**, o visa-crawler deve estar rodando em background:
```bash
# Terminal 1: start visa-crawler
cd /Users/edgar/Repos/openclaw/edgar/api && node server.js

# Terminal 2: start fastvistos
cd /Users/edgar/Repos/fastvistos && npm run dev:watch:centraldevistos
```

### Com publish-pre.sh
Se usar o script `publish-pre.sh`, **certifique-se de que o visa-crawler já está rodando** em outro terminal antes de executar:
```bash
./publish-pre.sh centraldevistos
```

Senão, o build falhará com erro de `fetch` na linha 19 do `HeroSection.astro`:
```
[ERROR] fetch failed ... internalConnectMultiple (node:net:1117:18)
```

## Troubleshooting

### "Connection refused" ao rodar centraldevistos
**Causa:** visa-crawler não está rodando na porta 3001.

**Solução:**
1. Abra outro terminal
2. `cd /Users/edgar/Repos/openclaw/edgar/api`
3. `node server.js`
4. Espere a mensagem "API listening on http://localhost:3001"
5. Volte ao terminal do fastvistos e tente de novo

### "Cannot find module 'express'" / npm errors
**Solução:** Certifique-se de rodar `npm install` dentro de `/openclaw/edgar/api/`

### Porta 3001 já em uso
Se outra coisa está rodando na porta 3001:
```bash
lsof -i :3001  # descobre qual processo
kill -9 <PID>   # mata o processo (ou use Activity Monitor no macOS)
```

Depois relance o visa-crawler.

## Variáveis de ambiente (.env)

As variáveis esperadas estão documentadas em `.env-template`:

- `API_KEY_MICROSEVICESADM` — chave de API para autenticação no microservicesadm (se necessário)
- `FASTVISTOS_BUSINESS_ID` — business_id do fastvistos (se necessário para integração)
- `FASTVISTOS_API_URL` — URL da API do fastvistos (padrão: `http://localhost:8000`, em prod é `https://sys.fastvistos.com.br/api`)

## Notas de deploy

- Em **produção**, o visa-crawler deve estar rodando em um serviço persistente (ex: PM2, systemd, Docker) — não pode ser um processo manual em background.
- A porta padrão é `3001`, mas pode ser alterada via `PORT=3099 node server.js` (deve bater com `VISA_API_BASE` em `.env` do fastvistos).

## Ver também

- [Fastvistos dev setup](./⭐%20README-multi-site.md) — guia geral do projeto
- [Troubleshooting de deploy](./README-backlog.md) — outros problemas comuns
