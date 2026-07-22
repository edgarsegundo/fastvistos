# Teste Prático: 3 Formatos de Página

## Status Atual ✅

Implementado:
- ✅ Models com 3 formatos
- ✅ Admin com UI visual
- ✅ API retornando dados corretos
- ✅ Astro renderizando cada formato diferente
- ✅ 3 páginas de exemplo criadas

Django rodando em: `http://localhost:8000`

---

## Passo 1: Acessar o Admin

```
URL: http://localhost:8000/admin/
```

**Log in** com sua conta de superuser.

---

## Passo 2: Ver as 3 Páginas Criadas

1. No menu lateral, clique em **"Páginas"** (Core → Páginas)
2. Você verá 3 páginas com badges coloridos:
   - 📝 **Home** (Azul) - Markdown
   - 🔒 **Serviços** (Laranja) - HTML Seguro
   - ⚡ **Galeria** (Vermelho) - HTML Customizado

### Screenshot esperado:
```
Páginas | Deletar | Adicionar Página

☑️  Home        | agencia-marketing | index | 📝 Markdown | ✓  | Ordem 0
☑️  Serviços    | agencia-marketing | serviços | 🔒 HTML Seguro | ✓ | Ordem 1
☑️  Galeria     | agencia-marketing | galeria | ⚡ HTML Custom | ✓ | Ordem 2
```

---

## Passo 3: Inspecionar Cada Página

### Clique em "Home"

```
Básico
├─ Projeto: Agência de Marketing
├─ Título: Home
├─ Slug: (vazio)
├─ Is Home: ✓ (checked)
├─ Published: ✓ (checked)
└─ Order: 0

Formato do Conteúdo
├─ Content Format: 📝 Markdown (Recomendado - Seguro & Rápido)
└─ ℹ️ Informações:
    📝 Markdown
    Melhor para: Blog posts, documentação, conteúdo simples
    Vantagens: ⚡ Rápido | 🎯 Bom SEO | 📱 Responsivo | 🔍 Analytics funciona
    Desvantagens: ❌ Sem JavaScript | ❌ Sem interatividade

Conteúdo
├─ # Bem-vindo à Agência de Marketing
├─ Somos especialistas em **marketing digital**...
└─ [Links em Markdown]
```

**O que ver:** Markdown formatado, sem HTML. Simples e puro.

---

### Clique em "Serviços"

```
Formato do Conteúdo
├─ Content Format: 🔒 HTML Seguro (HTML + CSS, sem JavaScript)
└─ ℹ️ Informações:
    🔒 HTML Seguro
    Melhor para: Landing pages, portfolios, conteúdo com styling
    Vantagens: ⚡ Rápido | 🎨 CSS funciona | 🎯 Bom SEO | 🔒 Seguro
    Desvantagens: ❌ Sem JavaScript | ❌ Sem interatividade

Conteúdo
├─ <div style="padding: 40px 0;">
├─   <h1 style="text-align: center; color: #2c3e50;">Nossos Serviços</h1>
├─   <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
└─   [3 cards com gradientes]
```

**O que ver:** HTML com inline styles (CSS). Sem `<script>` ou `onclick`.

---

### Clique em "Galeria"

```
Formato do Conteúdo
├─ Content Format: ⚡ HTML Customizado (HTML + CSS + JavaScript via iFrame)
└─ ℹ️ Informações:
    ⚡ HTML Customizado (com JavaScript)
    Melhor para: Aplicações interativas, dashboards, conteúdo com JavaScript
    Vantagens: 🚀 JavaScript funciona | 🎯 Máxima flexibilidade | 🤖 Ótimo com IA
    Desvantagens: ⏱️ Um pouco mais lento | 📱 CSS não herda

Conteúdo
├─ <!DOCTYPE html>
├─ <html>
├─   <head>
├─     <style>...</style>
├─   </head>
├─   <body>
├─     <div class="container">
├─     <h1>🖼️ Galeria Interativa</h1>
├─     <div class="filters">
├─       <button onclick="filterGallery('all')">Todos</button>
├─       ...
├─     </div>
├─     <script>
├─       function filterGallery(category) { ... }
├─       function openModal(img) { ... }
├─     </script>
└─   </body>
```

**O que ver:** HTML completo com `<script>` tags, funções JavaScript, interatividade.

---

## Passo 4: Criar Nova Página (Teste)

### Crie uma página MARKDOWN:

1. Admin → Pages → **Add Page**
2. Preencha:
   ```
   Project: Agência de Marketing
   Title: Sobre Nós
   Slug: sobre
   Content Format: 📝 Markdown
   Content: 
   
   # Sobre Nós
   
   Fundada em 2015, somos uma agência especializada em marketing digital.
   
   ## Nossa Missão
   
   Transformar negócios através de estratégias digitais eficientes.
   
   ## Team
   
   - João (CEO)
   - Maria (Designer)
   - Pedro (Dev)
   ```
3. Clique **SAVE**

### Resultado esperado:
- Signal dispara: "Project 'agencia-marketing' marked for rebuild"
- Page criada com badge 📝 Markdown

---

### Crie uma página HTML SEGURO:

1. Admin → Pages → **Add Page**
2. Preencha:
   ```
   Project: Agência de Marketing
   Title: Contato
   Slug: contato
   Content Format: 🔒 HTML Seguro
   Content:
   
   <div style="background: #f0f0f0; padding: 40px; border-radius: 10px;">
       <h1 style="text-align: center;">Entre em Contato</h1>
       <p style="text-align: center;">Tem uma pergunta? Estamos aqui para ajudar!</p>
       
       <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
           <div style="background: white; padding: 20px; border-radius: 5px;">
               <h3>📧 Email</h3>
               <p><a href="mailto:contato@agencia.com">contato@agencia.com</a></p>
           </div>
           <div style="background: white; padding: 20px; border-radius: 5px;">
               <h3>📱 WhatsApp</h3>
               <p><a href="https://wa.me/5561999999999">(61) 99999-9999</a></p>
           </div>
           <div style="background: white; padding: 20px; border-radius: 5px;">
               <h3>📍 Endereço</h3>
               <p>Brasília, DF</p>
           </div>
       </div>
   </div>
   ```
3. Clique **SAVE**

### Resultado esperado:
- Page criada com badge 🔒 HTML Seguro
- HTML foi sanitizado (scripts removidos se houver)

---

### Crie uma página HTML CUSTOMIZADO com JavaScript:

1. Admin → Pages → **Add Page**
2. Preencha:
   ```
   Project: Agência de Marketing
   Title: Calculadora
   Slug: calculadora
   Content Format: ⚡ HTML Customizado
   Content:
   
   <!DOCTYPE html>
   <html>
   <head>
       <style>
           body { font-family: Arial; padding: 20px; background: #f0f0f0; }
           .calc { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
           input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
           button { width: 100%; padding: 10px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; }
           button:hover { background: #5568d3; }
           #resultado { margin-top: 20px; padding: 15px; background: #ecf0f1; border-radius: 5px; text-align: center; font-size: 18px; }
       </style>
   </head>
   <body>
       <div class="calc">
           <h1>Calculadora ROI</h1>
           <input type="number" id="investimento" placeholder="Investimento (R$)" value="1000">
           <input type="number" id="retorno" placeholder="Retorno (R$)" value="5000">
           <button onclick="calcular()">Calcular ROI</button>
           <div id="resultado"></div>
       </div>
       
       <script>
           function calcular() {
               const investimento = parseFloat(document.getElementById('investimento').value);
               const retorno = parseFloat(document.getElementById('retorno').value);
               const roi = ((retorno - investimento) / investimento * 100).toFixed(2);
               
               document.getElementById('resultado').innerHTML = 
                   `<strong>ROI: ${roi}%</strong><br>Lucro: R$ ${(retorno - investimento).toFixed(2)}`;
           }
       </script>
   </body>
   </html>
   ```
3. Clique **SAVE**

### Resultado esperado:
- Page criada com badge ⚡ HTML Custom
- JavaScript NÃO foi removido
- Quando renderizado, será colocado em um iFrame

---

## Passo 5: Rodar Build do Astro

Agora que tem 6 páginas (3 originárias + 3 que você criou), vamos gerar os HTMLs estáticos:

```bash
cd /Users/edgar/Repos/fastvistos/vitrine
python manage.py build_static_sites
```

### Esperado:
```
🔨 Building 1 project(s)...
📦 Running: npm run build

✅ Build completed successfully
```

### Resultado:
Arquivos estáticos criados em `/dist/agencia-marketing/`:
```
/dist/agencia-marketing/
├── index.html                  (Home - Markdown renderizado)
├── servicos/index.html         (Serviços - HTML Seguro)
├── galeria/index.html          (Galeria - iFrame com JavaScript)
├── sobre/index.html            (Sobre - Markdown renderizado)
├── contato/index.html          (Contato - HTML Seguro)
└── calculadora/index.html      (Calculadora - iFrame com JavaScript)
```

---

## Passo 6: Inspecionar HTMLs Gerados

### Verificar tamanho dos arquivos:

```bash
ls -lh /dist/agencia-marketing/*/index.html
```

### Resultado esperado:
```
-rw-r--r--  index.html          ~5KB   (Markdown - pequeno)
-rw-r--r--  servicos/index.html ~8KB   (HTML Seguro - médio)
-rw-r--r--  galeria/index.html  ~200KB (iFrame - grande, contém tudo)
-rw-r--r--  sobre/index.html    ~4KB   (Markdown - pequeno)
-rw-r--r--  contato/index.html  ~7KB   (HTML Seguro - médio)
-rw-r--r--  calculadora/index.html ~50KB (iFrame - médio)
```

---

## Passo 7: Testar no Browser

### Opção A: Servir com Python

```bash
cd /dist/agencia-marketing
python -m http.server 8001
```

Acesse: `http://localhost:8001/`

### Opção B: Usar Nginx

Configure Nginx e acesse: `https://agenciafuturo.com.br/` (seu domínio)

---

## Observações ao Testar

### Página HOME (Markdown):
- ✅ Renderiza como HTML simples
- ✅ Rápido
- ✅ Bom para SEO
- ❌ Sem interatividade

### Página SERVIÇOS (HTML Seguro):
- ✅ CSS inline funciona (gradientes, cores, grid)
- ✅ Links funcionam
- ✅ Imagens funcionam
- ✅ Rápido
- ❌ Sem JavaScript

### Página GALERIA (HTML Customizado):
- ✅ Filtros funcionam (JavaScript roda)
- ✅ Modal abre ao clicar (JavaScript)
- ✅ Hover effects funcionam
- ✅ Tudo interativo
- ⚠️ Um pouco maior (contém tudo no iFrame)

### Página CALCULADORA (HTML Customizado):
- ✅ Calcula ROI em tempo real
- ✅ Inputs funcionam
- ✅ Button interativo
- ✅ JavaScript executa
- ⚠️ Isolado em iFrame (não acessa cookies/localStorage da página)

---

## Resumo do Que Cada Formato Faz

| Formato | Tamanho | Performance | SEO | JavaScript | Ideal para |
|---|---|---|---|---|---|
| Markdown | Pequeno | ⚡⚡⚡⚡⚡ | ✅ Bom | ❌ Não | Blog, docs |
| HTML Seguro | Médio | ⚡⚡⚡⚡ | ✅ Bom | ❌ Não | Landing, portfolio |
| HTML Custom | Grande | ⚡⚡⚡ | ⚠️ Limitado | ✅ Sim | Apps, interativas |

---

## Próximos Passos

1. ✅ **Testar cada formato** (você está aqui)
2. 📋 **Editar páginas** e ver rebuild automático
3. 🚀 **Deploy em produção**
4. 🤖 **Integrar com IA** (gerar código HTML/JS)
5. 📊 **Monitorar analytics**

---

## Dúvidas?

Se algo não funcionar, check:
1. Django rodando? `http://localhost:8000/admin/`
2. API funcionando? `curl http://localhost:8000/api/projects/`
3. Build rodou sem erros? `python manage.py build_static_sites`
4. Arquivos existem? `ls -la /dist/agencia-marketing/`

Tudo ok? Vamos testar na prática! 🚀
