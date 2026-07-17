from django.db import models

from .threadlocal import get_current_client


class ClientManager(models.Manager):
    """Filtra automaticamente pelo client corrente (thread-local).

    Se nenhum client estiver setado (ex: management command, shell),
    o queryset não é filtrado — use `all_objects` quando precisar
    explicitamente ver todos os tenants.
    """

    def get_queryset(self):
        qs = super().get_queryset()
        client = get_current_client()
        if client is not None:
            qs = qs.filter(client=client)
        return qs
