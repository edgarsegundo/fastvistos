from django.conf import settings
from django.db import models
from model_utils.models import SoftDeletableModel, TimeStampedModel, UUIDModel

from .managers import ClientManager
from .threadlocal import get_current_client


class Client(SoftDeletableModel, TimeStampedModel, UUIDModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)

    # Staff com acesso restrito a este client (superuser sempre tem acesso,
    # independente desta lista — ver CurrentClientMiddleware).
    staff_members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="accessible_clients", blank=True
    )

    # SoftDeletableModel fornece `objects` que filtra por `is_removed=False`.
    # `all_objects` vê tudo, incluindo deletados (pra admin/auditoria).
    all_objects = models.Manager()

    class Meta:
        ordering = ("name",)
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_removed", "created"]),
        ]

    def __str__(self):
        return self.name


class ClientProfile(SoftDeletableModel, TimeStampedModel, UUIDModel):
    """Liga um usuário-cliente (não staff) a um client (tenant), sempre fixo.

    `role` distingue o dono da conta (criou o client, pode convidar/remover
    empregados e mexer em configurações sensíveis) dos empregados que ele
    convida — que compartilham o mesmo client mas não têm esses poderes.

    Soft-delete: quando um usuário é deletado, seu ClientProfile é marcado
    como `is_removed=True`, não é hard-deletado. Permite recuperação e auditoria.
    """

    ROLE_OWNER = "owner"
    ROLE_EMPLOYEE = "employee"
    ROLE_CHOICES = [
        (ROLE_OWNER, "Dono"),
        (ROLE_EMPLOYEE, "Empregado"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="profiles")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_EMPLOYEE)

    all_objects = models.Manager()

    class Meta:
        verbose_name = "Perfil do Cliente"
        verbose_name_plural = "Perfis dos Clientes"
        ordering = ["client", "role"]
        constraints = [
            models.UniqueConstraint(
                fields=["user"], condition=models.Q(is_removed=False), name="unique_active_user_profile"
            ),
        ]
        indexes = [
            models.Index(fields=["client", "role"]),
            models.Index(fields=["is_removed", "created"]),
        ]

    @property
    def is_owner(self):
        return self.role == self.ROLE_OWNER

    def __str__(self):
        return f"{self.user} → {self.client} ({self.role})"


class ClientModel(SoftDeletableModel, TimeStampedModel):
    """Base abstrata para qualquer model pertencente a um tenant.

    Garante `is_removed` (soft-delete), `created`/`modified` (auditoria), e
    isolamento automático pelo client corrente (thread-local).

    - Leitura: `objects` já filtra automaticamente pelo client corrente
      (thread-local setado pelo CurrentClientMiddleware) E por `is_removed=False`
      (soft-delete). Use `all_objects` quando precisar explicitamente enxergar
      todos os tenants/deletados (ex: painel interno, management command).
    - Escrita: `save()` preenche `client` automaticamente a partir do
      client corrente, se não foi setado explicitamente. Se o objeto já
      pertence a um client diferente do corrente, a escrita é bloqueada
      (protege contra update cross-tenant de um objeto obtido via
      `all_objects` ou por PK sem passar pelo manager filtrado).
    - Exclusão: apagar um objeto marca como `is_removed=True` (soft-delete),
      não remove do banco. Use `queryset.hard_delete()` pra hard-delete se necessário.
    """

    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=False, blank=False)

    objects = ClientManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        current = get_current_client()
        if not self.client_id:
            if current is None:
                raise ValueError(
                    "Nenhum client corrente definido — não é possível salvar "
                    f"{self.__class__.__name__} sem um client. Passe `client=` "
                    "explicitamente ou garanta que o CurrentClientMiddleware rodou."
                )
            self.client = current
        elif current is not None and self.client_id != current.id:
            raise ValueError(
                f"Tentativa de salvar {self.__class__.__name__} do client "
                f"{self.client_id}, mas o contexto corrente é outro client "
                f"({current.id}) — bloqueado para evitar escrita cross-tenant."
            )
        super().save(*args, **kwargs)
