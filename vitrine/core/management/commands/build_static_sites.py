from django.core.management.base import BaseCommand
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
            # Caminho do projeto Astro
            astro_root = '/Users/edgar/Repos/fastvistos'  # Mudar se necessário

            # Executa Astro build uma vez (renderiza todos os projetos)
            self.stdout.write('📦 Running: npm run build')
            result = subprocess.run(
                ['npm', 'run', 'build'],
                cwd=astro_root,
                capture_output=True,
                timeout=600,
                text=True
            )

            self.stdout.write(result.stdout)

            if result.returncode == 0:
                # Marca todos como rebuild completo
                projects.update(needs_rebuild=False)
                self.stdout.write(self.style.SUCCESS('\n✅ Build completed successfully'))
                self.stdout.write(f'📁 Output directory: {astro_root}/dist/')
            else:
                self.stdout.write(self.style.ERROR('\n❌ Build failed'))
                if result.stderr:
                    self.stdout.write(result.stderr)

        except subprocess.TimeoutExpired:
            self.stdout.write(self.style.ERROR('\n❌ Build timeout (>10 min)'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR('\n❌ npm not found. Make sure Node.js/npm is installed'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {e}'))
