"""
Adapters do django-allauth para o ClientUser (sem username, email como
identificador único) — mesmo padrão usado em candidateprofile/adapters.py
do projeto emprego, adaptado pra criar automaticamente o tenant
(Client + ClientProfile) de quem se cadastra sozinho.
"""

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

from core.provisioning import provision_tenant_for_user


class NoUsernameAccountAdapter(DefaultAccountAdapter):
    """Adapter pro fluxo normal (email+senha) — ClientUser não tem username."""

    def add_message(self, request, level, message_template, message_context=None, extra_tags=''):
        # Suprime as mensagens flash padrão do allauth (não usamos esse padrão de UI)
        pass

    def save_user(self, request, user, form, commit=True):
        user = super().save_user(request, user, form, commit=False)
        if commit:
            user.save()
            provision_tenant_for_user(user)
        return user

    def get_login_redirect_url(self, request):
        # Painel do cliente é o próprio Django Admin (reformulado via Unfold),
        # tanto pra tenant owner quanto staff/superuser.
        return '/admin/'


class NoUsernameSocialAccountAdapter(DefaultSocialAccountAdapter):
    """Adapter pro login social (Google) — cria o tenant automaticamente
    no primeiro login, igual ao signup normal."""

    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        return user

    def save_user(self, request, sociallogin, form=None):
        user = sociallogin.user
        user.set_unusable_password()
        user.is_active = True

        if sociallogin.account.provider == 'google':
            extra = sociallogin.account.extra_data
            user.first_name = user.first_name or extra.get('given_name', '')
            user.last_name = user.last_name or extra.get('family_name', '')

        user.save()
        sociallogin.save(request)
        provision_tenant_for_user(user)
        return user

    def is_auto_signup_allowed(self, request, sociallogin):
        return True
