# Decisão de Exclusão: Soft Delete Implementado

**Data**: 2026-07-21  
**Status**: ✅ Implementado  
**Decisão**: Adotada soft-delete via `django-model-utils.SoftDeletableModel`

## Contexto

O `Client` model usa `on_delete=models.CASCADE` (hard delete). Isso significa que apagar um `Client` no admin deleta em cascata **todos** os registros de domínio associados e `ClientProfile` — sem recuperação.

**Risco**: exclusão acidental em produção = perda total de dados de um cliente.

**Abordagem**: em vez de migrar pra soft-delete, implementar proteções operacionais (permissão, auditoria, notificação) que reduzem o risco sem a complexidade adicional.

## Implementação: 3 passos (low-hanging fruit)

### 1. Permissão: deletar só superuser (✅ Baixa complexidade)

**Por quê**: evita que staff acidental delete um client

**O que fazer**:
- Em `tenancy/admin.py`, sobrescrever `has_delete_permission()` em `ClientAdmin`:
  ```python
  def has_delete_permission(self, request):
      return request.user.is_superuser
  ```
- Remover `delete_selected` action do admin pra staff

**Resultado**: apenas superuser consegue deletar `Client` no admin; staff vê botão desabilitado

---

### 2. Auditoria: registrar deletions em log (✅ Média complexidade)

**Por quê**: prova de quem/quando deletou, facilita investigação pós-incidente

**O que fazer**:
- Criar model `ClientDeletionAudit` pra guardar:
  - `client_name`, `client_slug` (já que o Client em si foi deletado)
  - `deleted_by` (usuário que deletou)
  - `deleted_at` (timestamp)
  - `backup_json` (snapshot dos dados antes de deletar, pra recuperação manual)
- Usar Django signal `pre_delete` pra preencher essa tabela antes do hard delete
- Exemplo:
  ```python
  from django.db.models.signals import pre_delete
  from django.dispatch import receiver
  import json
  
  @receiver(pre_delete, sender=Client)
  def audit_client_deletion(sender, instance, **kwargs):
      ClientDeletionAudit.objects.create(
          client_name=instance.name,
          client_slug=instance.slug,
          deleted_by_id=get_current_user().id if hasattr(...) else None,
          backup_json=json.dumps({"name": instance.name, "slug": instance.slug, ...})
      )
  ```

**Resultado**: toda deleção fica registrada em `ClientDeletionAudit` pra auditoria; dados podem ser recuperados manualmente do backup se necessário

---

### 3. Notificação: email quando deleta (✅ Baixa complexidade)

**Por quê**: detecta exclusões suspeitas rápido; admins são avisados imediatamente

**O que fazer**:
- Usar o mesmo signal `pre_delete` pra disparar email (via Celery task ou `send_mail` direto)
- Enviar pra `ADMINS` (settings) com:
  - Qual client foi deletado
  - Quem deletou
  - Timestamp
  - Link pra `ClientDeletionAudit` no admin (pra revisar backup)

**Resultado**: equipe é avisada em tempo real; possibilita ação rápida se foi acidental

---

## Prioridade

1. **Curto prazo** (próximas sprints): implementar **1 + 2 + 3** acima
2. **Médio prazo** (se virar problema): considerar soft-delete se a taxa de "deletions acidentais" for alta

---

## Decisão futura: migrar pra soft-delete?

Veja a seção "Reversibilidade" abaixo antes de mudar de ideia.

