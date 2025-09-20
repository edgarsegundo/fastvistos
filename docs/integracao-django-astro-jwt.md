# Integração Django + Astro: Edição Restrita com JWT (Single Sign-On)

## Objetivo
Permitir que apenas usuários autenticados no Django admin possam acessar o modo de edição visual (modal) do site Astro, usando JWT para autenticação segura.

---

## Passo a Passo

### 1. Django: Gere um JWT para o usuário autenticado

- Instale a lib:
  ```bash
  pip install djangorestframework-simplejwt
  ```
- Crie uma view protegida:
  ```python
  from rest_framework_simplejwt.tokens import RefreshToken
  from django.http import JsonResponse
  from django.contrib.auth.decorators import login_required

  @login_required
  def get_jwt(request):
      refresh = RefreshToken.for_user(request.user)
      return JsonResponse({'access': str(refresh.access_token)})
  ```
- Adicione a rota:
  ```python
  from .views import get_jwt
  urlpatterns = [
      path('api/get-jwt/', get_jwt, name='get_jwt'),
  ]
  ```

---

### 2. Django: Disponibilize o JWT para o frontend

- Após login, faça uma chamada AJAX para `/api/get-jwt/` e salve o token em um cookie seguro:
  ```js
  fetch('/api/get-jwt/')
    .then(res => res.json())
    .then(data => {
      document.cookie = `jwt_token=${data.access}; path=/; Secure; SameSite=Strict`;
    });
  ```

---

### 3. Astro: Detecte o JWT e ative o modo edição

- No Astro, adicione um script que lê o cookie `jwt_token` e só ativa o modo edição se ele existir:
  ```js
  function getCookie(name) {
    return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
  }
  const jwt = getCookie('jwt_token');
  if (jwt) {
    // Ativar modo edição (injetar JS/modal)
  }
  ```

---

### 4. (Opcional) Valide o JWT no backend Astro

- Para máxima segurança, crie um endpoint no Astro que valida o JWT usando a mesma chave secreta do Django.
- Só permita ações de edição se o JWT for válido.

---

### 5. Segurança
- Use HTTPS sempre.
- Configure o cookie como `Secure` e `SameSite=Strict`.
- Defina expiração curta para o JWT.

---

## Resumo
1. Django gera e entrega JWT para usuário autenticado.
2. Frontend salva JWT em cookie.
3. Astro só ativa o modo edição se o JWT estiver presente e válido.

---

Se precisar de exemplos de código mais detalhados ou integração com frontend/backend, peça aqui!
