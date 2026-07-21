from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Client, ClientProfile
from .threadlocal import get_current_client


@admin.register(Client)
class ClientAdmin(ModelAdmin):
    list_display = ("name", "slug", "created", "is_removed")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("staff_members",)
    list_filter = ("is_removed",)

    def get_queryset(self, request):
        # Usa all_objects pra ver deletados/não-deletados, depois filtra permissão
        qs = Client.all_objects.get_queryset()
        if request.user.is_superuser:
            return qs
        return qs.filter(staff_members=request.user)


@admin.register(ClientProfile)
class ClientProfileAdmin(ModelAdmin):
    list_display = ("user", "client", "role", "is_removed")
    list_filter = ("role", "is_removed", "client")

    def get_queryset(self, request):
        # Usa all_objects pra ver deletados/não-deletados
        qs = ClientProfile.all_objects.get_queryset()
        if request.user.is_superuser:
            return qs
        return qs.filter(client__staff_members=request.user)

    def get_list_filter(self, request):
        # O dropdown de "client" no list_filter lista todos os clients via
        # Client._default_manager, ignorando o get_queryset acima — vazaria
        # nome de tenants fora do escopo do staff. Removido pra não-superuser.
        if request.user.is_superuser:
            return self.list_filter
        return ("role", "is_removed")


class ClientScopedAdmin(ModelAdmin):
    """Mixin para ModelAdmin de qualquer model que herde ClientModel.

    Usa `all_objects` (sem filtro automático do manager) e filtra
    explicitamente pelo client corrente (a mesma resolução usada pelo
    CurrentClientMiddleware): fixo para usuário-cliente, seletor de
    sessão para staff.

    Superuser sem client ativo selecionado ainda vê tudo (conveniência);
    staff comum sem client ativo não vê nada (tem que escolher um antes).

    O campo `client` é escondido do formulário pra não-superuser: sem
    isso, o usuário veria um dropdown editável pra reatribuir o registro
    a outro tenant — o `save()` do model bloquearia a troca, mas com um
    ValueError cru (erro 500), não uma validação limpa. Escondendo o
    campo, a criação usa o auto-preenchimento normal do `ClientModel.save()`
    a partir do client corrente.
    """

    def get_queryset(self, request):
        qs = self.model.all_objects.get_queryset()
        client = get_current_client()
        if client is not None:
            return qs.filter(client=client)
        if request.user.is_superuser:
            return qs
        return qs.none()

    def get_exclude(self, request, obj=None):
        excluded = super().get_exclude(request, obj) or ()
        if not request.user.is_superuser:
            return (*excluded, "client")
        return excluded
