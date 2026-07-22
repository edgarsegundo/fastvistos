from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from model_utils.models import TimeStampedModel, UUIDModel
from tenancy.models import ClientModel


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


class Project(ClientModel):
    """Um projeto/site criado por um usuário do SaaS"""
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    description = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    needs_rebuild = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Projeto"
        verbose_name_plural = "Projetos"
        ordering = ['-created']
        constraints = [
            models.UniqueConstraint(
                fields=['client', 'slug'],
                name='unique_project_slug_per_client'
            ),
        ]
        indexes = [
            models.Index(fields=['slug', 'is_published']),
            models.Index(fields=['needs_rebuild']),
        ]

    def __str__(self):
        return f"{self.name} ({self.slug})"


class Page(ClientModel):
    """Uma página dentro de um projeto com suporte a múltiplos formatos"""

    # Formatos disponíveis
    FORMAT_MARKDOWN = 'markdown'
    FORMAT_HTML_SAFE = 'html_safe'
    FORMAT_HTML_CUSTOM = 'html_custom'

    FORMAT_CHOICES = [
        (FORMAT_MARKDOWN, '📝 Markdown (Recomendado - Seguro & Rápido)'),
        (FORMAT_HTML_SAFE, '🔒 HTML Seguro (HTML + CSS, sem JavaScript)'),
        (FORMAT_HTML_CUSTOM, '⚡ HTML Customizado (HTML + CSS + JavaScript via iFrame)'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='pages')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)

    # Formato do conteúdo
    content_format = models.CharField(
        max_length=20,
        choices=FORMAT_CHOICES,
        default=FORMAT_MARKDOWN,
        help_text="Escolha como você quer criar o conteúdo"
    )

    # Conteúdo (pode ser Markdown, HTML seguro, ou HTML customizado)
    content = models.TextField(
        default='',
        help_text="Conteúdo em Markdown ou HTML (conforme o formato selecionado)"
    )

    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    is_published = models.BooleanField(default=True)
    is_home = models.BooleanField(default=False, help_text="Marque para ser a página inicial")
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Página"
        verbose_name_plural = "Páginas"
        ordering = ['order', 'title']
        constraints = [
            models.UniqueConstraint(
                fields=['project', 'slug'],
                name='unique_page_slug_per_project'
            ),
        ]
        indexes = [
            models.Index(fields=['project', 'is_published']),
            models.Index(fields=['slug', 'is_published']),
        ]

    def __str__(self):
        return f"{self.project.slug}/{self.slug}"

    def render_content_for_api(self):
        """Renderiza conteúdo pra API (retorna formato final)"""
        if self.content_format == self.FORMAT_MARKDOWN:
            return {
                'format': 'markdown',
                'content': self.content,
                'render_type': 'marked'
            }
        elif self.content_format == self.FORMAT_HTML_SAFE:
            sanitized = self._sanitize_html_safe(self.content)
            return {
                'format': 'html_safe',
                'content': sanitized,
                'render_type': 'inline'
            }
        elif self.content_format == self.FORMAT_HTML_CUSTOM:
            return {
                'format': 'html_custom',
                'content': self.content,
                'render_type': 'iframe'
            }

    @staticmethod
    def _sanitize_html_safe(html_content):
        """Sanitiza HTML removendo scripts e eventos perigosos"""
        try:
            import bleach
        except ImportError:
            # Se bleach não tiver instalado, retorna como está
            return html_content

        allowed_tags = [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'table',
            'thead', 'tbody', 'tr', 'th', 'td', 'div', 'section', 'article',
            'figure', 'figcaption', 'video', 'audio', 'source'
        ]

        allowed_attributes = {
            'a': ['href', 'title', 'target'],
            'img': ['src', 'alt', 'width', 'height', 'loading'],
            'video': ['src', 'width', 'height', 'controls', 'poster'],
            'audio': ['src', 'controls'],
            'source': ['src', 'type'],
            '*': ['class', 'id', 'style']
        }

        return bleach.clean(
            html_content,
            tags=allowed_tags,
            attributes=allowed_attributes,
            strip=True
        )


class Build(ClientModel):
    """Registro de um build de Astro (toda a plataforma SaaS)"""

    STATUS_PENDING = 'pending'
    STATUS_RUNNING = 'running'
    STATUS_SUCCESS = 'success'
    STATUS_FAILED = 'failed'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pendente'),
        (STATUS_RUNNING, 'Em execução'),
        (STATUS_SUCCESS, 'Sucesso'),
        (STATUS_FAILED, 'Falha'),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )
    triggered_by = models.ForeignKey(
        ClientUser,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='triggered_builds'
    )
    log_output = models.TextField(blank=True, help_text='stdout + stderr do build')
    content_snapshot = models.JSONField(
        default=list,
        help_text='Snapshot das páginas no momento do build'
    )
    release_path = models.CharField(
        max_length=255,
        blank=True,
        help_text='ex: releases/20260722-153000'
    )
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Build'
        verbose_name_plural = 'Builds'
        ordering = ['-created']
        indexes = [
            models.Index(fields=['status', 'created']),
        ]

    def __str__(self):
        return f"Build {self.id} ({self.status}) - {self.created.strftime('%d/%m/%Y %H:%M')}"


class Deployment(ClientModel):
    """Registro de um deploy de um build pro VPS"""

    STATUS_PENDING = 'pending'
    STATUS_DEPLOYING = 'deploying'
    STATUS_SUCCESS = 'success'
    STATUS_FAILED = 'failed'
    STATUS_ROLLED_BACK = 'rolled_back'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pendente'),
        (STATUS_DEPLOYING, 'Deployando'),
        (STATUS_SUCCESS, 'Sucesso'),
        (STATUS_FAILED, 'Falha'),
        (STATUS_ROLLED_BACK, 'Revertido'),
    ]

    build = models.OneToOneField(
        Build,
        on_delete=models.CASCADE,
        related_name='deployment'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )
    log_output = models.TextField(blank=True, help_text='stdout + stderr do deploy')
    deployed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Deployment'
        verbose_name_plural = 'Deployments'
        ordering = ['-created']
        indexes = [
            models.Index(fields=['status', 'created']),
        ]

    def __str__(self):
        return f"Deployment {self.id} (Build {self.build.id}) - {self.status}"
