from django.db import models

from .threadlocal import get_current_client


class ClientManager(models.Manager):
    """Filtra automaticamente pelo client corrente (thread-local) E por soft-delete.

    Retorna apenas objetos ativos (`is_removed=False`) e do client corrente.
    Se nenhum client estiver setado (ex: management command, shell),
    retorna apenas objetos ativos de qualquer client — use `all_objects`
    quando precisar explicitamente ver todos os tenants/deletados.
    """

    def get_queryset(self):
        qs = super().get_queryset()
        # Filtra soft-deletados por padrão
        qs = qs.filter(is_removed=False)
        # Filtra pelo client corrente
        client = get_current_client()
        if client is not None:
            qs = qs.filter(client=client)
        return qs
