from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST

from .middleware import ACTIVE_CLIENT_SESSION_KEY
from .models import Client


@login_required
@user_passes_test(lambda u: u.is_staff)
@require_POST
def set_active_client(request, client_id):
    """Staff escolhe qual client fica ativo na sessão corrente.

    Superuser pode escolher qualquer client; staff comum só os que
    estão em `client.staff_members` (validado aqui, não só na UI).

    Exige POST (protegido por CSRF) porque é uma troca de estado — GET
    aqui permitiria um ataque CSRF via <img>/link forçando a troca do
    client ativo sem o usuário perceber.
    """
    if request.user.is_superuser:
        client = get_object_or_404(Client, id=client_id)
    else:
        client = request.user.accessible_clients.filter(id=client_id).first()
        if client is None:
            return HttpResponseForbidden("Você não tem acesso a este client.")

    request.session[ACTIVE_CLIENT_SESSION_KEY] = client.id

    next_url = request.POST.get("next", "")
    if not url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
        next_url = reverse("admin:index")
    return redirect(next_url)
