from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from core.models import Project
from pathlib import Path
import subprocess
import os


class Command(BaseCommand):
    help = 'Builda projetos via Astro. Build é sempre escopado a 1 projeto por vez (ver docs/build-por-projeto.md).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force rebuild de todos os projetos, mesmo sem needs_rebuild=True',
        )
        parser.add_argument(
            '--project',
            type=str,
            help='Builda apenas este projeto (por slug)',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        project_slug = options.get('project')

        if project_slug:
            try:
                project = Project.objects.get(slug=project_slug)
            except Project.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'❌ Project "{project_slug}" not found'))
                return
            except Project.MultipleObjectsReturned:
                self.stdout.write(self.style.ERROR(
                    f'❌ Multiple projects with slug "{project_slug}" found across '
                    'different clients. Rode este comando com um client corrente '
                    'setado, ou passe o project via core.deploy.build_project(project=...) '
                    'diretamente.'
                ))
                return
            single_project_mode = True
            projects = [project]
        else:
            single_project_mode = False
            projects = list(Project.objects.all() if force else Project.objects.filter(needs_rebuild=True))

        if not projects:
            self.stdout.write(self.style.WARNING('⚠️  No projects need rebuild'))
            return

        self.stdout.write(f'\n🔨 Building {len(projects)} project(s) (1 build por projeto)...\n')

        succeeded = 0
        failed = 0

        for project in projects:
            self.stdout.write(f'\n--- Projeto: {project.slug} ---')
            success = self._build_single_project(project)
            if success:
                succeeded += 1
            else:
                failed += 1
                if single_project_mode:
                    # Modo --project <slug>: propaga falha como exceção,
                    # pra quem chamou via call_command() (ex: core.deploy.build_project)
                    # saber com certeza que falhou, sem precisar inferir do stdout.
                    raise CommandError(f'Build failed for project "{project.slug}"')

        self.stdout.write(f'\n📊 Resultado: {succeeded} sucesso(s), {failed} falha(s)')

    def _build_single_project(self, project):
        """Builda um único projeto via Astro (PROJECT_SLUG_FILTER=<slug>).

        Returns:
            bool: True se o build teve sucesso
        """
        astro_root = getattr(settings, 'ASTRO_ROOT', '/Users/edgar/Repos/fastvistos')
        platform_site_id = getattr(settings, 'PLATFORM_SITE_ID', '_saas')

        build_script = f'build:{platform_site_id}'
        self.stdout.write(f'📦 Running: npm run {build_script} (PROJECT_SLUG_FILTER={project.slug})')

        env = os.environ.copy()
        env['SITE_ID'] = platform_site_id
        env['PROJECT_SLUG_FILTER'] = project.slug

        try:
            result = subprocess.run(
                ['npm', 'run', build_script],
                cwd=astro_root,
                capture_output=True,
                timeout=600,
                text=True,
                env=env
            )
        except subprocess.TimeoutExpired:
            self.stdout.write(self.style.ERROR(f'❌ Build timeout (>10 min) para {project.slug}'))
            return False
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR('❌ npm not found. Make sure Node.js/npm is installed'))
            return False

        # SEMPRE inclui o stderr no log, mesmo quando o Astro "tem sucesso"
        # (returncode 0) — console.error() do JS (ex: erro dentro de
        # getStaticPaths(), como falha de fetch na API) escreve no stderr,
        # não no stdout. Astro trata "0 páginas geradas" como sucesso, não
        # como erro fatal — sem isso, a mensagem real do erro nunca aparecia
        # no log salvo (só o texto genérico de "build falhou" no passo
        # seguinte, sem contexto nenhum).
        self.stdout.write(result.stdout)
        if result.stderr:
            self.stdout.write(result.stderr)

        if result.returncode != 0:
            self.stdout.write(self.style.ERROR(f'❌ Build de {project.slug} falhou (astro build retornou erro)'))
            return False

        # Astro pode retornar sucesso (returncode 0) mas gerar 0 páginas pro
        # projeto filtrado (ex: erro de rede/API dentro de getStaticPaths()
        # que caiu no catch e retornou [] silenciosamente) — sem essa
        # checagem, o deploy seguinte falha tentando fazer rsync de uma
        # pasta que nunca foi criada, com uma mensagem de erro confusa.
        output_dir = Path(astro_root) / 'dist' / platform_site_id / project.slug
        if not output_dir.is_dir() or not any(output_dir.iterdir()):
            self.stdout.write(self.style.ERROR(
                f'❌ Build de {project.slug} não gerou nenhuma página '
                f'(pasta de saída {output_dir} não existe ou está vazia, '
                'mesmo o astro build tendo retornado sucesso — provável '
                'erro de fetch/API dentro de getStaticPaths(), ver stderr acima)'
            ))
            return False

        project.needs_rebuild = False
        project.save(update_fields=['needs_rebuild'])
        self.stdout.write(self.style.SUCCESS(f'✅ Build de {project.slug} completo'))
        self.stdout.write(f'📁 Output: {output_dir}/')
        return True
