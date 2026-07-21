# Soft Delete: Implementação

**Data**: 2026-07-21  
**Status**: ✅ Implementado  
**Racional**: Facilitar recuperação de dados, auditoria, e conformidade com LGPD/GDPR sem perder dados acidentalmente.

## O que mudou

### Models
- `Client`, `ClientProfile` herdam de `SoftDeletableModel`, `TimeStampedModel`, `UUIDModel`
- `ClientModel` (abstrata) herda de `SoftDeletableModel`, `TimeStampedModel`
  - Garante que qualquer novo model de domínio (herdando ClientModel) já tenha auditoria (`created`/`modified`)
- Campos `is_removed`, `created`, `modified` automáticos via mixins
- PKs em `Client`/`ClientProfile` são UUID; em modelos de domínio serão herdados via `ClientModel`
- `all_objects = models.Manager()` adicionado pra acessar deletados (auditoria, admin)

### Managers
- `ClientManager` agora filtra por `is_removed=False` por padrão
- Querysets retornam apenas objetos ativos

### Admin
- `is_removed` adicionado ao `list_display` e `list_filter` em `ClientAdmin` e `ClientProfileAdmin`
- Admins conseguem ver/restaurar deletados usando o filtro `is_removed`

### Comportamento
```python
# Criação normal
c = Client.objects.create(name="Meu Client", slug="meu-client")

# Soft-delete (marca como is_removed=True, não deleta do banco)
c.delete()

# objects não mostra deletados
Client.objects.filter(id=c.id).exists()  # False

# all_objects mostra tudo (incluindo deletados)
Client.all_objects.filter(id=c.id).exists()  # True
c_deleted = Client.all_objects.get(id=c.id)
c_deleted.is_removed  # True

# Hard-delete se realmente necessário (nunca é)
Client.all_objects.filter(id=c.id).hard_delete()
```

## Vantagens

✅ **Recuperação**: dados deletados podem ser restaurados manualmente  
✅ **Auditoria**: quem deletou, quando, é possível rastrear (via logs)  
✅ **LGPD/GDPR**: mais fácil implementar "direito ao esquecimento" de verdade depois  
✅ **Admin-friendly**: filtro `is_removed` permite ver deletados e restaurar se necessário  

## Melhorias implementadas junto

### 1. UUIDModel
- PK agora é UUID (segurança + consistência com `microservicesadm`)
- Automaticamente gerado, não sequencial
- Melhor pra futuro se precisar expor IDs em URLs

### 2. TimeStampedModel  
- Campos `created` e `modified` automáticos
- Removidas as declarações manuais (antes tinha `auto_now_add` / `auto_now`)
- Mais elegante e consistente

### 3. Índices úteis
- `Client.slug`: busca rápida por slug
- `Client.is_removed, created`: eficiente pra listar deletados por data
- `ClientProfile.client, role`: busca rápida por client + papel
- Idem `is_removed, created` pra ClientProfile

### 4. Constraints
- `unique_active_user_profile`: garante que um usuário só tem UM profile ativo (soft-delete respeita isso — um user deletado pode ser recriado depois com outro profile)

### 5. Verbose names
- Português no admin: "Cliente", "Perfil do Cliente"
- Melhor UX pra usuários brasileiros

### 6. Ordenação útil
- `ClientProfile` ordena por `client, role` (agrupa por tenant)

## Futuras melhorias (opcionais)

- Log automático quando um `Client` é deletado (signal + table `ClientDeletionLog`)
- Endpoint pra restore (admin action ou API)
- Cleanup automático: hard-delete tudo com `is_removed=True` e `created > 90 dias atrás`
