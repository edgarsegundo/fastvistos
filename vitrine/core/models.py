from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _
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
    phone = models.CharField(max_length=32, blank=True)
    marketing_opt_in = models.BooleanField(
        default=False,
        help_text='Aceitou receber dicas/atualizações por email no cadastro'
    )
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
        verbose_name = _("Meu Projeto")
        verbose_name_plural = _("Meus Projetos")
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

    PAGE_TYPE_HOME = 'home'
    PAGE_TYPE_GENERIC = 'generic'
    PAGE_TYPE_CONTACT = 'contact'
    PAGE_TYPE_ABOUT = 'about'
    PAGE_TYPE_BLOG_POST = 'blog_post'
    PAGE_TYPE_LANDING = 'landing'

    PAGE_TYPE_CHOICES = [
        (PAGE_TYPE_HOME, 'Página Inicial'),
        (PAGE_TYPE_GENERIC, 'Genérica'),
        (PAGE_TYPE_CONTACT, 'Contato'),
        (PAGE_TYPE_ABOUT, 'Sobre'),
        (PAGE_TYPE_BLOG_POST, 'Post de Blog'),
        (PAGE_TYPE_LANDING, 'Landing Page'),
    ]

    page_type = models.CharField(
        max_length=20,
        choices=PAGE_TYPE_CHOICES,
        default=PAGE_TYPE_GENERIC,
        help_text="Tipo de conteúdo — habilita campos de SEO específicos (ex: endereço em Contato)"
    )
    is_published = models.BooleanField(default=True)
    is_home = models.BooleanField(default=False, help_text="Marque para ser a página inicial")
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name = _("Minha Página")
        verbose_name_plural = _("Minhas Páginas")
        ordering = ['order', 'title']
        constraints = [
            models.UniqueConstraint(
                fields=['project', 'slug'],
                name='unique_page_slug_per_project'
            ),
            # Só considera unicidade entre linhas com is_home=True — permite
            # quantas páginas com is_home=False quiser, mas nunca deixa 2
            # marcadas como home no MESMO projeto ao mesmo tempo (o Astro
            # geraria 2 arquivos pro mesmo path na raiz do projeto, um
            # sobrescrevendo o outro silenciosamente — ver
            # multi-sites/sites/_saas/pages/[project]/[...slug].astro).
            models.UniqueConstraint(
                fields=['project'],
                condition=models.Q(is_home=True),
                name='unique_home_page_per_project',
            ),
        ]
        indexes = [
            models.Index(fields=['project', 'is_published']),
            models.Index(fields=['slug', 'is_published']),
        ]

    def __str__(self):
        return f"{self.project.slug}/{self.slug}"

    def clean(self):
        """Validação amigável — sem isso, a constraint do banco ainda
        protege a integridade, mas o erro que o admin mostra é um
        IntegrityError cru, não uma mensagem de formulário legível."""
        super().clean()
        if self.is_home:
            conflicting = Page.all_objects.filter(
                project_id=self.project_id, is_home=True
            ).exclude(pk=self.pk)
            if conflicting.exists():
                other = conflicting.first()
                raise ValidationError({
                    'is_home': _(
                        'Já existe outra página marcada como home neste projeto '
                        '("%(other)s"). Desmarque "is_home" nela primeiro, ou '
                        'deixe esta desmarcada.'
                    ) % {'other': other.title}
                })

    def save(self, *args, **kwargs):
        """Mantém page_type sincronizado com is_home nos dois sentidos —
        evita o estado inconsistente is_home=True com page_type != 'home'
        (ou o inverso), sem exigir o usuário entender a interação entre
        os dois campos. Ver docs/guia-seo-projetos-paginas.md."""
        if self.is_home:
            self.page_type = self.PAGE_TYPE_HOME
        elif self.page_type == self.PAGE_TYPE_HOME:
            self.page_type = self.PAGE_TYPE_GENERIC
        super().save(*args, **kwargs)

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
    """Registro de um build de Astro ESCOPADO A 1 PROJETO.

    Cada Build representa "rodei o Astro só pras páginas deste Project".
    Por isso faz sentido herdar ClientModel: o build pertence de fato ao
    client dono do project (client é auto-preenchido a partir de
    project.client em build_project(), nunca escolhido arbitrariamente).

    Ver docs/build-por-projeto.md para o porquê dessa decisão.
    """

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

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='builds',
        help_text='Projeto que este build gerou (build é sempre escopado a 1 projeto)'
    )
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
        help_text='Snapshot das páginas do projeto no momento do build'
    )
    release_path = models.CharField(
        max_length=255,
        blank=True,
        help_text='ex: releases/20260722-153000 (preenchido no deploy, não no build)'
    )
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Build'
        verbose_name_plural = 'Builds'
        ordering = ['-created']
        indexes = [
            models.Index(fields=['status', 'created']),
            models.Index(fields=['project', 'created']),
        ]

    def __str__(self):
        return f"Build {self.id} ({self.project.slug}, {self.status}) - {self.created.strftime('%d/%m/%Y %H:%M')}"


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


class Domain(ClientModel):
    """Domínio customizado para um projeto"""

    VERIFICATION_PENDING = 'pending_dns'
    VERIFICATION_VERIFIED = 'dns_verified'
    VERIFICATION_FAILED = 'failed'

    VERIFICATION_CHOICES = [
        (VERIFICATION_PENDING, 'Pendente DNS'),
        (VERIFICATION_VERIFIED, 'DNS Verificado'),
        (VERIFICATION_FAILED, 'Falha na Verificação'),
    ]

    SSL_NONE = 'none'
    SSL_PENDING = 'pending'
    SSL_ISSUED = 'issued'
    SSL_FAILED = 'failed'

    SSL_CHOICES = [
        (SSL_NONE, 'Nenhum'),
        (SSL_PENDING, 'Pendente'),
        (SSL_ISSUED, 'Ativo'),
        (SSL_FAILED, 'Falha'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='domains',
        help_text='Projeto associado'
    )
    domain = models.CharField(
        max_length=255,
        unique=True,
        help_text='ex: agenciafuturo.com.br'
    )
    is_primary = models.BooleanField(
        default=False,
        help_text='Se True, é o domínio padrão; False = domínio customizado'
    )
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_CHOICES,
        default=VERIFICATION_PENDING,
        help_text='Status da verificação de DNS'
    )
    ssl_status = models.CharField(
        max_length=20,
        choices=SSL_CHOICES,
        default=SSL_NONE,
        help_text='Status do certificado SSL'
    )
    verified_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Timestamp da verificação'
    )
    dns_check_log = models.TextField(
        blank=True,
        help_text='Log da última verificação de DNS'
    )

    class Meta:
        verbose_name = _('Meu Domínio')
        verbose_name_plural = _('Meus Domínios')
        ordering = ['domain']
        indexes = [
            models.Index(fields=['project', 'is_primary']),
            models.Index(fields=['verification_status', 'ssl_status']),
        ]

    def __str__(self):
        return f"{self.domain} ({self.project.name})"


class PlatformSeoDefaults(models.Model):
    """Defaults de SEO/branding da plataforma inteira (singleton).

    Substitui o antigo multi-sites/sites/_saas/site-config.ts: em vez de
    um dev editar um arquivo estático por deploy, um admin edita esses
    valores no Django admin e eles servem de última camada de fallback
    pra qualquer Project/Page que não definir algo próprio.
    """

    site_name = models.CharField(max_length=255, blank=True)
    default_favicon_url = models.URLField(blank=True)
    default_og_image_url = models.URLField(blank=True)
    default_author_name = models.CharField(max_length=255, blank=True)
    theme_color = models.CharField(max_length=7, blank=True, help_text="ex: #0f172a")
    google_site_verification = models.CharField(max_length=255, blank=True)
    gtm_id = models.CharField(max_length=32, blank=True)
    locale = models.CharField(max_length=10, default='pt-BR')
    organization_name = models.CharField(max_length=255, blank=True)
    organization_logo_url = models.URLField(blank=True)

    class Meta:
        verbose_name = 'Configuração de SEO da Plataforma'
        verbose_name_plural = 'Configuração de SEO da Plataforma'

    def __str__(self):
        return 'Configuração de SEO da Plataforma'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _created = cls.objects.get_or_create(pk=1)
        return obj


class ProjectSeoSettings(models.Model):
    """Camada de SEO/branding específica de um Project — sobrescreve
    PlatformSeoDefaults, é sobrescrita por PageSeoSettings."""

    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name='seo_settings'
    )
    og_image_url = models.URLField(blank=True)
    favicon_url = models.URLField(blank=True)
    author_name = models.CharField(max_length=255, blank=True)
    canonical_domain_override = models.CharField(
        max_length=255, blank=True,
        help_text="Reservado para domínio customizado (feature futura)"
    )
    organization_name_override = models.CharField(max_length=255, blank=True)
    default_title_suffix = models.CharField(
        max_length=100, blank=True,
        help_text='ex: " | Minha Empresa" — anexado ao título quando a página não definir o próprio'
    )

    class Meta:
        verbose_name = 'SEO do Projeto'
        verbose_name_plural = 'SEO dos Projetos'

    def __str__(self):
        return f"SEO de {self.project.slug}"


class PageSeoSettings(models.Model):
    """Camada de SEO específica de uma Page — última palavra na
    resolução em cascata (Page > Project > Platform).

    type_specific_data guarda campos que só fazem sentido pra certos
    page_type (ex: endereço/telefone em Contact, data/autor em BlogPost)
    sem precisar de coluna dedicada pra cada combinação possível.
    """

    page = models.OneToOneField(
        Page, on_delete=models.CASCADE, related_name='seo_settings'
    )
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    og_image_override = models.URLField(blank=True)
    canonical_override = models.URLField(blank=True)
    noindex = models.BooleanField(
        default=False, help_text="Pede aos buscadores para não indexar esta página"
    )
    type_specific_data = models.JSONField(
        default=dict, blank=True,
        help_text="Campos extras conforme page_type (ex: endereço, telefone, data de publicação)"
    )

    class Meta:
        verbose_name = 'SEO da Página'
        verbose_name_plural = 'SEO das Páginas'

    def __str__(self):
        return f"SEO de {self.page.slug}"
