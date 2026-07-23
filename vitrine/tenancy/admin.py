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

    O campo `client` é escondido do formulário pra quem já tem um client
    fixo (`ClientProfile`) — pra esses, o `save()` do model auto-preenche
    a partir do `get_current_client()`, que pra eles é sempre o client do
    profile, sem ambiguidade nenhuma. Mostrar o campo pra esse grupo só
    criaria risco de reatribuir o registro pra outro tenant sem querer.

    Pra quem NÃO tem `ClientProfile` (superuser, ou staff comum
    gerenciando vários clients) — mesma resolução do
    `CurrentClientMiddleware._resolve_client()` — não existe client fixo
    nenhum, e como hoje não há UI pro `set_active_client` (só o endpoint),
    esse grupo precisa escolher o `client` direto no formulário na hora de
    criar um objeto novo, senão `ClientModel.save()` levanta `ValueError`
    (sem ninguém pra "adivinhar" o dono).
    """

    def _user_needs_client_field(self, request):
        """True se este usuário não tem client fixo — precisa escolher
        manualmente (mesma condição que cai no branch `is_staff` do
        `CurrentClientMiddleware._resolve_client()`)."""
        if getattr(request.user, "clientprofile", None) is not None:
            return False
        return request.user.is_superuser or request.user.is_staff

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
        if not self._user_needs_client_field(request):
            return (*excluded, "client")
        return excluded

    def get_fieldsets(self, request, obj=None):
        """Quem precisa escolher `client` manualmente (ver
        `_user_needs_client_field`) vê uma seção extra "Tenant" ao criar
        um objeto novo (obj is None) — `get_exclude` já permite o campo
        pra esse grupo, mas ele só aparece de fato se estiver listado em
        algum fieldset, por isso esse método injeta a seção."""
        fieldsets = super().get_fieldsets(request, obj)
        if self._user_needs_client_field(request) and obj is None:
            fieldsets = (*fieldsets, ("Tenant", {"fields": ("client",)}))
        return fieldsets

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Restringe o dropdown de `client` aos tenants que o staff
        (não-superuser) realmente tem acesso — sem isso, vazaria o nome
        de TODOS os clients da plataforma pra qualquer staff comum, mesmo
        os que ele não deveria nem saber que existem. Superuser continua
        vendo todos (mesmo padrão já usado no ClientAdmin/ClientProfileAdmin)."""
        if db_field.name == "client" and not request.user.is_superuser:
            kwargs["queryset"] = request.user.accessible_clients.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
