from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from model_utils.models import TimeStampedModel, UUIDModel


class ClientUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)


class ClientUser(AbstractBaseUser, PermissionsMixin, TimeStampedModel, UUIDModel):
    """User model com email como identificador único.

    Herda de TimeStampedModel e UUIDModel para auditoria automática
    (created/modified) e PKs UUID (segurança + consistência com Client).

    Minimalista: email, first_name, last_name, is_active, is_staff.
    Dados específicos de domínio (empresa, CNPJ, localização) ficam em
    modelos de domínio (ex: ClientProfile, CompanyProfile).
    """

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = ClientUserManager()

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ('email',)

    def __str__(self):
        return self.email

    def get_display_name(self):
        """Retorna nome completo ou email como fallback."""
        full_name = f'{self.first_name} {self.last_name}'.strip()
        return full_name or self.email
