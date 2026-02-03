# Sistema de Temas Dark/Light

## 📋 Visão Geral

Este documento descreve a implementação completa do sistema de temas dark/light no site Zenith. O sistema utiliza CSS Custom Properties (variáveis CSS) combinado com JavaScript para oferecer uma experiência de usuário moderna e suave.

## 🏗️ Arquitetura do Sistema

### **1. CSS Custom Properties (`global.css`)**

O sistema é baseado em variáveis CSS que definem as cores para cada tema:

```css
/* Light Theme (Padrão) */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 98%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
}

/* Dark Theme */
[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  --border: 217.2 32.6% 17.5%;
}
```

### **2. Classe Theme-Transition**

A classe `theme-transition` fornece transições suaves entre temas:

```css
.theme-transition {
  transition: background-color 0.3s ease-in-out, 
              color 0.3s ease-in-out, 
              border-color 0.3s ease-in-out;
}
```

#### **Para que serve a `theme-transition`:**

✅ **Sem theme-transition:**
- Mudança instantânea e abrupta entre temas
- Cores mudam de forma "seca", sem suavidade
- Experiência visual menos polida

✅ **Com theme-transition:**
- Mudança suave e gradual entre temas (0.3 segundos)
- Transição elegante das cores de fundo, texto e bordas
- Experiência visual profissional e moderna

### **3. JavaScript Toggle (`ThemeToggle.astro`)**

Componente responsável por alternar entre temas:

#### **Funcionalidades:**
- **Botão flutuante** no canto inferior direito
- **Ícones SVG** para sol (light) e lua (dark)
- **Persistência** no localStorage
- **Detecção automática** do tema preferido do sistema
- **Aplicação imediata** sem reload da página

#### **Funções principais:**
```javascript
function toggleTheme() {
  // Alterna entre 'light' e 'dark'
  // Salva no localStorage
  // Aplica no documento
}

function loadSavedTheme() {
  // Carrega tema salvo ou detecta preferência do sistema
  // Aplica no carregamento da página
}
```

## 🎨 Classes CSS Disponíveis

### **Cores de Fundo:**
- `bg-background` - Fundo principal da página
- `bg-card` - Fundo de cards e componentes
- `bg-muted` - Fundo de seções alternativas
- `bg-primary` - Cor primária de destaque

### **Cores de Texto:**
- `text-foreground` - Texto principal
- `text-muted-foreground` - Texto secundário
- `text-primary` - Texto em cor primária
- `text-primary-foreground` - Texto sobre fundo primário

### **Bordas:**
- `border-border` - Cor padrão das bordas

### **Componentes Personalizados:**
```css
.btn-primary {
  @apply bg-primary text-primary-foreground hover:opacity-90 theme-transition;
}

.btn-secondary {
  @apply border border-border text-foreground hover:bg-muted theme-transition;
}
```

## 🔧 Implementação em Componentes

### **Padrão de Aplicação:**

```astro
<!-- Seções principais -->
<section class="bg-background theme-transition">

<!-- Cards e componentes -->
<div class="bg-card border border-border theme-transition">

<!-- Links e elementos interativos -->
<a class="text-muted-foreground hover:text-primary theme-transition">
```

## 🚀 Como Usar

### **1. Aplicar em novos componentes:**
```astro
<section class="bg-background theme-transition py-20">
  <div class="bg-card border border-border theme-transition p-8">
    <h2 class="text-foreground">Título</h2>
    <p class="text-muted-foreground">Descrição</p>
    <button class="btn-primary">Ação</button>
  </div>
</section>
```

### **2. Botões personalizados:**
```astro
<button class="bg-primary text-primary-foreground hover:opacity-90 theme-transition">
  Botão Primário
</button>

<button class="border border-border text-foreground hover:bg-muted theme-transition">
  Botão Secundário
</button>
```

### **3. Links e navegação:**
```astro
<a href="#" class="text-muted-foreground hover:text-primary theme-transition">
  Link com transição
</a>
```

## ⚡ Performance e Boas Práticas

### **Vantagens desta abordagem:**
1. **Performance superior** - CSS custom properties são mais rápidas que classes dinâmicas
2. **Sem re-renderização** - Mudanças instantâneas sem reload
3. **Manutenibilidade** - Cores centralizadas em um local
4. **Flexibilidade** - Fácil adição de novos temas
5. **Acessibilidade** - Respeita preferências do sistema

### **Boas práticas:**
- Sempre usar `theme-transition` em elementos que mudam de cor
- Manter consistência nas classes de cor
- Testar em ambos os temas durante desenvolvimento
- Verificar contraste adequado em ambos os temas

## 🔄 Extensibilidade

### **Adicionando novos temas:**
```css
[data-theme="blue"] {
  --primary: 214 100% 50%;
  /* outras variáveis */
}
```

### **Novas variáveis de cor:**
```css
:root {
  --accent: 210 100% 50%;
  --accent-foreground: 0 0% 100%;
}
```
