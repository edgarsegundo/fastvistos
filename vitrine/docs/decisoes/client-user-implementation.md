# ClientUser: Implementação com Email e Melhorias

**Data**: 2026-07-21  
**Status**: ✅ Implementado  
**Referência**: Baseado em `emprego.EmployerUser`, com melhorias específicas pra vitrine

## O que foi implementado

### Models: `vitrine/core/models.py`

```python
class ClientUser(AbstractBaseUser, PermissionsMixin, TimeStampedModel, UUIDModel):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = ClientUserManager()
```

### Admin: `vitrine/core/admin.py`

- `ClientUserAdmin` com campos customizados
- `list_display`: email, first_name, last_name, is_staff, is_active, created
- `list_filter`: is_staff, is_active, created
- `search_fields`: email, first_name, last_name
- Fieldsets bem organizados (Credenciais, Informações Pessoais, Permissões, Auditoria)
- `created` e `modified` em collapse (auditoria)

### Settings: `vitrine/vitrine_core/settings.py`

```python
AUTH_USER_MODEL = 'core.ClientUser'
```

## Melhorias vs emprego.EmployerUser

| Aspecto | emprego | vitrine (ClientUser) |
|--------|---------|---------------------|
| **PK** | Auto-increment (int) | UUID (segurança) |
| **Timestamps** | `date_joined` apenas | `created`, `modified` (auditoria completa via TimeStampedModel) |
| **is_active** | default=False (precisa ativar via email) | default=True (simpleza desenvolvimento) |
| **Campos específicos** | company_name, cnpj, phone, region, employer_city, employer_neighborhood, employer_lat, employer_lon | Removidos (minimalista — dados específicos em modelos de domínio) |
| **Admin** | Básico | Fieldsets, readonly_fields (created/modified), search_fields |
| **get_display_name()** | get_short_name() | get_display_name() (mais semântico) |

## Por que essas melhorias

### 1. UUID como PK
- **Segurança**: IDs sequenciais (1, 2, 3...) vazam quantidade de usuários
- **Consistência**: Client já usa UUID
- **Futuro**: facilita expor IDs em URLs sem risco

### 2. TimeStampedModel (created/modified)
- **Auditoria**: saber quando usuário foi criado/atualizado
- **Conformidade LGPD**: necessário pra rastrear ciclo de vida do usuário
- **Reutilização**: já usamos pra Client, ClientProfile, ClientModel

### 3. is_active = True por default
- **Simpleza**: em vitrine não precisa ativar via email (diferente de emprego que é SaaS público)
- **Desenvolvimento**: não precisa workaround pra testar

### 4. Campos minimalistas
- **Separação de concerns**: dados de domínio (empresa, localização) ficam em modelos de domínio, não no User
- **Reutilização**: ClientUser funciona pra qualquer tenant, não só empregadores
- **Flexibilidade**: se virar SaaS depois, adiciona campos via profile models, não User

### 5. Admin customizado
- **Usabilidade**: fieldsets reduzem confusão (separar Credenciais, Pessoais, Permissões)
- **Auditoria**: campos created/modified visíveis mas colapsados

## Como usar

### Criar usuário interativamente

```bash
uv run python manage.py createsuperuser
# Pede: Email, Password
```

### Criar usuário programaticamente

```python
from core.models import ClientUser

user = ClientUser.objects.create_user(
    email='admin@example.com',
    password='secret123',
    first_name='Admin',
    last_name='User'
)
```

### Login

```python
# No futuro: auth backend customizado
# Por enquanto, Django padrão (authenticate() procura USERNAME_FIELD)
from django.contrib.auth import authenticate

user = authenticate(username='admin@example.com', password='secret123')
# username aqui é na verdade email, porque USERNAME_FIELD='email'
```

## Próximas melhorias (futuro)

- [ ] Custom auth backend que aceita `email` explicitamente no authenticate()
- [ ] Confirmar email via magic link (django-allauth ou similar)
- [ ] Integrar com ClientProfile pra criar automaticamente na first login
- [ ] OAuth2 (Google, GitHub) se virar SaaS

## Validação

✅ Migrations rodaram com sucesso  
✅ Superuser criado: `admin@example.com` / `secret123`  
✅ Runserver rodou sem erros  
✅ Admin interface acessível em `/admin/`
