from django.conf import settings
from django.contrib.sites.models import Site


class AutoSyncSiteMiddleware:
    """Em DEBUG, sincroniza o Site com o host da request automaticamente.

    Evita Site.DoesNotExist quando você testa em localhost, 127.0.0.1,
    0.0.0.0, ou qualquer host — sem precisar atualizar o banco manualmente.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if settings.DEBUG:
            host = request.get_host().split(':')[0]  # Remove porta
            site = Site.objects.first()
            if site and site.domain != host:
                site.domain = host
                site.save()

        return self.get_response(request)
