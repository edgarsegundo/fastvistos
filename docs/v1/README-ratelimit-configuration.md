Aqui está uma **mini documentação em Markdown** pronta pra você salvar como `nginx-rate-limit-cors.md`:

````md
# Nginx API Reverse Proxy - Rate Limit & CORS

Este documento descreve a configuração aplicada no Nginx para proteção de API, controle de tráfego e suporte a CORS.

---

## 📌 Objetivo

Esta configuração tem como objetivo:

- Proteger a API contra abuso e excesso de requisições
- Permitir uso normal por usuários e frontends modernos (SPAs)
- Habilitar comunicação entre domínios (CORS)
- Melhorar estabilidade do backend Node.js

---

## 🚦 Rate Limiting (Proteção contra abuso)

```nginx
limit_req zone=api_limit burst=20 nodelay;
````

### Como funciona:

* Controla a quantidade de requisições por IP
* Baseado em uma zone definida no `http`:

  ```nginx
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
  ```

### Parâmetros:

* **10r/s** → até 10 requisições por segundo por IP
* **burst=20** → permite picos temporários (ex: carregamento de página)
* **nodelay** → não cria fila, responde imediatamente dentro do limite

### Benefícios:

* Evita flood e abuso de API
* Protege o backend contra sobrecarga
* Mantém compatibilidade com frontends modernos

---

## 🌐 CORS (Cross-Origin Resource Sharing)

```nginx
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
```

### Função:

Permite que aplicações frontend em outros domínios acessem a API.

### Explicação:

* `Allow-Origin *` → permite qualquer domínio acessar a API
* `Allow-Methods` → métodos HTTP permitidos
* `Allow-Headers` → headers aceitos nas requisições

---

## ⚡ Preflight Request (OPTIONS)

```nginx
if ($request_method = OPTIONS) {
    return 204;
}
```

### O que é:

Browsers enviam uma requisição `OPTIONS` antes de certas chamadas API (CORS preflight).

### O que essa regra faz:

* Responde diretamente com `204 No Content`
* Evita que o request vá para o backend Node.js
* Melhora performance e reduz carga no servidor

---

## 🧩 Proxy da API

A API é encaminhada para o backend Node.js:

```nginx
proxy_pass http://72.60.57.150:3900/;
```

Inclui headers padrão para manter contexto da requisição:

* IP real do cliente
* protocolo original
* host original

---

## 📊 Resumo da arquitetura

* Nginx atua como reverse proxy
* Rate limit protege contra abuso
* CORS permite integração frontend/backend
* OPTIONS é tratado diretamente no proxy
* Node.js recebe apenas requisições válidas

---

## 🚀 Resultado final

Esta configuração garante:

* Segurança básica contra tráfego excessivo
* Compatibilidade com aplicações modernas (SPA)
* Boa performance no backend
* Estrutura escalável para APIs futuras

```

---

Se quiser, posso também te gerar uma versão **README.md estilo GitHub com badge, diagraminha e versão mais profissional**.
```


for i in {1..40}; do curl -s https://fastvistos.com.br/msitesapp/api/test-hello; done
