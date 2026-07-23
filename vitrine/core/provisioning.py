"""
Provisionamento automático de tenant para novos usuários que se
cadastram sozinhos (signup público ou Google SSO) — não usado pra
usuários criados manualmente pelo admin (createsuperuser, admin de staff).
"""

from django.contrib.auth.models import Group, Permission
from django.utils.text import slugify

from tenancy.models import Client, ClientProfile

# Nome do grupo com as permissões padrão de um dono de tenant — o painel
# do cliente é o próprio Django Admin (reformulado), então precisa de
# permissão explícita nos models pra aparecer/funcionar (is_staff sozinho
# não é suficiente pra não-superuser).
TENANT_OWNER_GROUP_NAME = 'Donos de Tenant'

# (app_label, model_name) que um dono de tenant pode gerenciar por completo
_TENANT_MANAGED_MODELS = [
    ('core', 'project'),
    ('core', 'page'),
    ('core', 'domain'),
    ('core', 'build'),       # só view (Build não tem add/change form de verdade, é readonly)
    ('core', 'deployment'),  # idem
]


def _get_or_create_tenant_owner_group():
    group, created = Group.objects.get_or_create(name=TENANT_OWNER_GROUP_NAME)
    if created:
        perms = Permission.objects.filter(
            content_type__app_label__in=[a for a, m in _TENANT_MANAGED_MODELS],
            content_type__model__in=[m for a, m in _TENANT_MANAGED_MODELS],
        )
        group.permissions.set(perms)
    return group


def provision_tenant_for_user(user):
    """
    Garante que `user` tem um Client (tenant) + ClientProfile(role=owner)
    próprios, `is_staff=True` (pra acessar o admin) e as permissões de
    dono de tenant. Idempotente: se o user já tiver um profile, não faz nada.

    Chamado nos 2 pontos de entrada de auto-cadastro: o signup normal
    (core/views.py: signup_view) e o adapter do Google SSO
    (core/adapters.py: NoUsernameSocialAccountAdapter.save_user).

    Returns:
        ClientProfile: o profile existente ou recém-criado
    """
    existing = ClientProfile.objects.filter(user=user).first()
    if existing is not None:
        return existing

    base_name = user.get_display_name() or user.email
    base_slug = slugify(base_name) or slugify(user.email.split('@')[0])

    slug = base_slug
    suffix = 1
    while Client.objects.filter(slug=slug).exists():
        suffix += 1
        slug = f'{base_slug}-{suffix}'

    client = Client.objects.create(name=base_name, slug=slug)
    profile = ClientProfile.objects.create(
        user=user, client=client, role=ClientProfile.ROLE_OWNER
    )

    if not user.is_staff:
        user.is_staff = True
        user.save(update_fields=['is_staff'])

    group = _get_or_create_tenant_owner_group()
    user.groups.add(group)

    return profile
