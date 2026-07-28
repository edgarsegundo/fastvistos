"""
Management command para testar a configuração do R2 (Cloudflare storage).
Sobe um arquivo de teste pequeno e imprime a URL resultante.

Uso:
    python manage.py test_r2_upload

Saída esperada:
    ✓ R2 está configurado e funcionando
    URL: https://cdn.example.com/uploads/test-client/abc123.txt
"""

import tempfile
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Testa a configuração de storage (R2 ou local) uploadando um arquivo de teste.'

    def handle(self, *args, **options):
        try:
            # Criar arquivo de teste em memória
            test_content = b'Test file for R2 storage configuration\n'
            test_file = ContentFile(test_content, name='test-r2-upload.txt')

            # Salvar no storage padrão (configurado em settings.STORAGES['default'])
            path = default_storage.save('test-uploads/test-r2-upload.txt', test_file)

            # Obter URL
            url = default_storage.url(path)

            self.stdout.write(
                self.style.SUCCESS('\n✓ Storage funcionando corretamente!\n')
            )
            self.stdout.write(f'Arquivo salvo em: {path}')
            self.stdout.write(f'URL pública:     {url}\n')

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\n✗ Erro ao testar storage: {e}\n')
            )
            raise
