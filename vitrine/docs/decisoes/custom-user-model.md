# Autenticação: Custom User Model com Email

**Data**: 2026-07-21  
**Status**: ⏳ Decisão pendente  
**Questão**: Implementar custom user model com email (como em `emprego`) ou usar Django User padrão em `vitrine`?

## O que o emprego faz

O projeto `emprego` implementa um custom user model:

```python
class EmployerUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    cnpj = models.CharField(max_length=18, blank=True, unique=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    region = models.CharField(max_length=100, blank=True)
    employer_city = models.CharField(max_length=100, blank=True)
    employer_neighborhood = models.CharField(max_length=100, blank=True)
    employer_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    employer_lon = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = EmployerUserManager()
```

**Chave**: `USERNAME_FIELD = 'email'` (não username padrão).

## Comparação: Django User vs Custom Email User

| Aspecto | Django User padrão | Custom User (emprego) |
|--------|------------------|------------------------|
| **Identificador** | Username (string) | Email (único, normalized) |
| **Login** | Username + password | Email + password |
| **Vantagem** | Simples, built-in, sem migração | Mais moderno, UX melhor, sem username duplicado |
| **Desvantagem** | Username é string arbitrária, pode virar "user123" confuso | Quebra migração se usado em greenfield |
| **Caso de uso** | Sistemas legados, multiplos login methods | B2B/B2C modernos (SaaS, ecommerce) |
| **Conformidade** | OK | Melhor (LGPD/GDPR, rastreável por email) |

## Análise: vitrine necessita de custom user?

**Contexto de vitrine**:
- Multi-tenancy com `ClientProfile` (usuário ligado a um tenant via email conceptualmente)
- Usuários são empregadores/empresários (como emprego)
- Sem username no design inicial — toda referência é por `ClientProfile.user`
- Futuro: possível integração com outros projects monorepo (emprego já tem custom user)

### Argumento PRO custom user:

1. **Consistência com emprego**: se houver auth compartilhada entre projects, email is common denominator
2. **UX**: login via email é mais natural que "escolha um username"
3. **LGPD**: email é o contacto primary do usuário — fácil de auditar exclusões (LGPD "direito ao esquecimento")
4. **Migração futura**: se começar com Django User padrão, migrar pra email depois é custoso (mudança em PKs, ForeignKeys, etc.)

### Argumento CONTRA:

1. **Custo inicial**: setup mais complexo (custom manager, AbstractBaseUser, migração de DB inicial)
2. **Django ecosystem**: packages podem assumir Django User padrão (raro, mas acontece)
3. **Não urgente**: pode adicionar email-login-only later sem custom user (alternativamente: username + email dual-login via backend customizado)

## Recomendação

**Para vitrine agora**: ✅ **Implementar custom user com email**, pelos motivos:

1. **Greenfield**: não há users migrados que quebrem
2. **Emprego já tem**: reutiliza padrão já validado no monorepo
3. **Multi-tenancy fit**: email é PKs natural pra ClientProfile (user.email é mais semântico que user.username)
4. **Futuro-proof**: evita migração custosa depois

### Implementação mínima

```python
# vitrine/core/models.py

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class ClientUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)

class ClientUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = ClientUserManager()

    def __str__(self):
        return self.email
```

### settings.py

```python
AUTH_USER_MODEL = 'core.ClientUser'
```

Depois, migração + createsuperuser pedirá email, não username.

## Próximos passos

1. Confirmar: quer implementar custom user agora?
2. Se sim: executar a implementação acima (duração: ~15 min)
3. Se não: usar Django User padrão por enquanto e adicionar custom user depois (mais caro depois)
