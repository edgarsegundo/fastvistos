from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import Project
import subprocess
import os


class Command(BaseCommand):
    help = 'Rebuild all projects that need rebuild'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force rebuild even if needs_rebuild is False',
        )
        parser.add_argument(
            '--project',
            type=str,
            help='Rebuild only a specific project by slug',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        project_slug = options.get('project')

        # Determina quais projetos precisam rebuild
        if project_slug:
            try:
                projects = Project.objects.filter(slug=project_slug)
                if not projects.exists():
                    self.stdout.write(self.style.ERROR(f'❌ Project "{project_slug}" not found'))
                    return
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error: {e}'))
                return
        else:
            projects = Project.objects.all() if force else Project.objects.filter(needs_rebuild=True)

        if not projects.exists():
            self.stdout.write(self.style.WARNING('⚠️  No projects need rebuild'))
            return

        self.stdout.write(f'\n🔨 Building {projects.count()} project(s)...\n')

        try:
            # Configurações via Django settings (env var)
            astro_root = getattr(settings, 'ASTRO_ROOT', '/Users/edgar/Repos/fastvistos')
            platform_site_id = getattr(settings, 'PLATFORM_SITE_ID', '_saas')

            # Executa Astro build uma vez (renderiza todos os projetos do site SaaS)
            build_script = f'build:{platform_site_id}'
            self.stdout.write(f'📦 Running: npm run {build_script}')

            env = os.environ.copy()
            env['SITE_ID'] = platform_site_id

            result = subprocess.run(
                ['npm', 'run', build_script],
                cwd=astro_root,
                capture_output=True,
                timeout=600,
                text=True,
                env=env
            )

            self.stdout.write(result.stdout)

            if result.returncode == 0:
                # Marca todos como rebuild completo apenas se o build foi sucesso
                projects.update(needs_rebuild=False)
                self.stdout.write(self.style.SUCCESS('\n✅ Build completed successfully'))
                self.stdout.write(f'📁 Output directory: {astro_root}/dist/{platform_site_id}/')
            else:
                self.stdout.write(self.style.ERROR('\n❌ Build failed'))
                if result.stderr:
                    self.stdout.write(result.stderr)
                # Não marca como rebuild completo se falhar

        except subprocess.TimeoutExpired:
            self.stdout.write(self.style.ERROR('\n❌ Build timeout (>10 min)'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR('\n❌ npm not found. Make sure Node.js/npm is installed'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {e}'))
