from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class SignupForm(forms.Form):
    first_name = forms.CharField(
        label=_('Nome'), max_length=150,
        widget=forms.TextInput(attrs={'placeholder': _('Nome')})
    )
    last_name = forms.CharField(
        label=_('Sobrenome'), max_length=150,
        widget=forms.TextInput(attrs={'placeholder': _('Sobrenome')})
    )
    email = forms.EmailField(
        label=_('Email'),
        widget=forms.EmailInput(attrs={'placeholder': _('Email')})
    )
    phone = forms.CharField(
        label=_('Telefone'), max_length=32, required=False,
        widget=forms.TextInput(attrs={'placeholder': _('Telefone')})
    )
    password = forms.CharField(
        label=_('Senha'),
        widget=forms.PasswordInput(attrs={'placeholder': _('Senha')})
    )
    terms_accepted = forms.BooleanField(
        label=_('Li e aceito os termos de uso e políticas de privacidade')
    )
    marketing_opt_in = forms.BooleanField(
        label=_('Aceito receber dicas e atualizações por email'),
        required=False,
    )

    def clean_email(self):
        email = self.cleaned_data['email'].lower().strip()
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError(_('Já existe uma conta com este email.'))
        return email

    def clean_password(self):
        password = self.cleaned_data['password']
        validate_password(password)
        return password

    def save(self):
        user = User.objects.create_user(
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
            first_name=self.cleaned_data['first_name'],
            last_name=self.cleaned_data['last_name'],
            phone=self.cleaned_data.get('phone', ''),
            marketing_opt_in=self.cleaned_data.get('marketing_opt_in', False),
        )
        return user


class LoginForm(forms.Form):
    email = forms.EmailField(
        label=_('Email'),
        widget=forms.EmailInput(attrs={'placeholder': _('Email')})
    )
    password = forms.CharField(
        label=_('Senha'),
        widget=forms.PasswordInput(attrs={'placeholder': _('Senha')})
    )
