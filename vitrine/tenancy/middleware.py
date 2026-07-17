from .models import Client
from .threadlocal import clear_current_client, set_current_client

ACTIVE_CLIENT_SESSION_KEY = "active_client_id"


class CurrentClientMiddleware:
    """Resolve o client corrente e guarda no thread-local pra a duração
    da requisição.

    Dois papéis diferentes:
    - Usuário-cliente (tem `ClientProfile`): sempre fixo no seu próprio
      client, sem opção de trocar.
    - Staff (`is_staff`/`is_superuser`, sem `ClientProfile`): pode
      gerenciar vários clients, então o client corrente vem de um
      "seletor" guardado na sessão (`ACTIVE_CLIENT_SESSION_KEY`).
      Superuser pode selecionar qualquer client; staff comum só os que
      estão em `client.staff_members`.

    A limpeza no `finally` é essencial: sem ela, se a thread for
    reaproveitada pelo servidor (worker pool), o próximo request pode
    herdar o client de um request anterior — vazando dado entre
    tenants.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            client = self._resolve_client(request)
            set_current_client(client)
            response = self.get_response(request)
        finally:
            clear_current_client()
        return response

    def _resolve_client(self, request):
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            return None

        profile = getattr(user, "clientprofile", None)
        if profile is not None:
            return profile.client

        if user.is_staff:
            return self._resolve_active_client_for_staff(request, user)

        return None

    def _resolve_active_client_for_staff(self, request, user):
        client_id = request.session.get(ACTIVE_CLIENT_SESSION_KEY)
        if not client_id:
            return None

        if user.is_superuser:
            return Client.objects.filter(id=client_id).first()

        return user.accessible_clients.filter(id=client_id).first()
