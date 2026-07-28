"""Admin da Galeria de Imagens (MediaAsset) + busca de imagens stock
(Pexels/Pixabay/Unsplash) + proxies pra baixar bytes de imagem sem CORS/
hotlink protection. Arquivo separado do admin.py (mesmo padrão de
admin_domain.py) porque essas rotas não pertencem a nenhuma `Page`
específica.

Backend Django novo, não um proxy pro serviço Node legado (msitesapp) —
decisão explícita: msitesapp já tem consumidor de produção (pipeline
Discord → publicação de artigo) com quota própria nessas mesmas APIs;
compartilhar routing/chaves acoplaria os dois produtos (ver
docs/editor/guia-editor-blocos-context.md)."""

import math

import requests
from django.conf import settings
from django.contrib import admin
from django.core.paginator import Paginator
from django.http import HttpResponse, JsonResponse
from django.urls import path
from unfold.admin import ModelAdmin

from tenancy.admin import ClientScopedAdmin

from .models import MediaAsset

GALLERY_PAGE_LIMIT = 24
STOCK_PER_PAGE = 20
PROXY_TIMEOUT = 10  # segundos

# Hosts fixos das fontes stock — mesma allowlist do proxy legado
# (multi-sites/core/msitesapp/api/stock-routes.js).
STOCK_ALLOWED_HOSTS = {
    'images.pexels.com',
    'www.pexels.com',
    'cdn.pixabay.com',
    'pixabay.com',
    'images.unsplash.com',
    'plus.unsplash.com',
}


def resolve_stock_api_key(provider: str) -> str:
    """Seam pra chaves por-client no futuro (v2, não implementado agora):
    hoje é passthrough puro pras chaves da plataforma. Quando/se cada
    client puder cadastrar sua própria chave (evitar contenção de quota
    entre clients na mesma plataforma), só esta função muda — as views
    de busca ficam intocadas."""
    return {
        'pexels': settings.PEXELS_API_KEY,
        'pixabay': settings.PIXABAY_API_KEY,
        'unsplash': settings.UNSPLASH_ACCESS_KEY,
    }[provider]


def _clamp(value, lo, hi):
    return max(lo, min(hi, value))


def _int_param(request, name, default):
    try:
        return int(request.GET.get(name, default))
    except (TypeError, ValueError):
        return default


@admin.register(MediaAsset)
class MediaAssetAdmin(ClientScopedAdmin, ModelAdmin):
    list_display = ('filename', 'source', 'project', 'client', 'created')
    list_filter = ('source', 'created')
    readonly_fields = ('url', 'storage_path', 'content_type', 'size', 'created', 'modified')
    search_fields = ('filename', 'alt')

    def get_urls(self):
        custom = [
            path('gallery/', self.admin_site.admin_view(self.gallery_list), name='core_mediaasset_gallery'),
            path('stock/pexels/', self.admin_site.admin_view(self.stock_pexels), name='core_mediaasset_stock_pexels'),
            path('stock/pixabay/', self.admin_site.admin_view(self.stock_pixabay), name='core_mediaasset_stock_pixabay'),
            path('stock/unsplash/', self.admin_site.admin_view(self.stock_unsplash), name='core_mediaasset_stock_unsplash'),
            path('stock/proxy/', self.admin_site.admin_view(self.stock_proxy), name='core_mediaasset_stock_proxy'),
            path('stock/google-proxy/', self.admin_site.admin_view(self.stock_google_proxy), name='core_mediaasset_stock_google_proxy'),
        ]
        return custom + super().get_urls()

    # ------------------------------------------------------------------
    # Galeria — imagens já enviadas por este client (todo o client, não só
    # o projeto atual — decisão fechada, ver guia-editor-blocos-context.md)
    # ------------------------------------------------------------------
    def gallery_list(self, request):
        limit = _clamp(_int_param(request, 'limit', GALLERY_PAGE_LIMIT), 1, 60)
        page_number = max(1, _int_param(request, 'page', 1))

        qs = self.get_queryset(request)
        paginator = Paginator(qs, limit)
        page = paginator.page(min(page_number, paginator.num_pages) if paginator.num_pages else 1)

        images = [
            {
                'id': obj.id,
                'url': obj.url,
                'filename': obj.filename,
                'alt': obj.alt,
                'source': obj.source,
                'created': obj.created.isoformat(),
            }
            for obj in page.object_list
        ]
        return JsonResponse({
            'images': images,
            'page': page.number if paginator.num_pages else 1,
            'pages': paginator.num_pages,
            'total': paginator.count,
            'limit': limit,
        })

    # ------------------------------------------------------------------
    # Busca stock
    # ------------------------------------------------------------------
    def stock_pexels(self, request):
        q = request.GET.get('q', '').strip()
        if not q:
            return JsonResponse({'error': 'O parâmetro "q" é obrigatório.'}, status=400)

        api_key = resolve_stock_api_key('pexels')
        if not api_key:
            return JsonResponse({'error': 'PEXELS_API_KEY não configurada.'}, status=500)

        page = max(1, _int_param(request, 'page', 1))
        try:
            resp = requests.get(
                'https://api.pexels.com/v1/search',
                params={'query': q, 'per_page': STOCK_PER_PAGE, 'page': page},
                headers={'Authorization': api_key},
                timeout=PROXY_TIMEOUT,
            )
            data = resp.json()
            if not resp.ok:
                raise ValueError(data.get('error') or f'Erro {resp.status_code}')
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

        photos = [
            {
                'id': p.get('id'),
                'photographer': p.get('photographer'),
                'photographer_url': p.get('photographer_url'),
                'src_medium': (p.get('src') or {}).get('medium'),
                'src_large': (p.get('src') or {}).get('large'),
                'src_original': (p.get('src') or {}).get('original'),
                'width': p.get('width'),
                'height': p.get('height'),
                'alt': p.get('alt') or '',
            }
            for p in data.get('photos') or []
        ]
        total_results = data.get('total_results') or 0
        return JsonResponse({
            'photos': photos,
            'total_results': total_results,
            'page': page,
            'per_page': STOCK_PER_PAGE,
            'pages': math.ceil(total_results / STOCK_PER_PAGE) if total_results else 0,
        })

    def stock_pixabay(self, request):
        q = request.GET.get('q', '').strip()
        if not q:
            return JsonResponse({'error': 'O parâmetro "q" é obrigatório.'}, status=400)

        api_key = resolve_stock_api_key('pixabay')
        if not api_key:
            return JsonResponse({'error': 'PIXABAY_API_KEY não configurada.'}, status=500)

        page = max(1, _int_param(request, 'page', 1))
        try:
            resp = requests.get(
                'https://pixabay.com/api/',
                params={
                    'key': api_key, 'q': q, 'per_page': STOCK_PER_PAGE, 'page': page,
                    'image_type': 'photo', 'safesearch': 'true',
                },
                timeout=PROXY_TIMEOUT,
            )
            data = resp.json()
            if not resp.ok:
                raise ValueError(data.get('message') or f'Erro {resp.status_code}')
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

        photos = [
            {
                'id': hit.get('id'),
                'user': hit.get('user'),
                'preview_url': hit.get('previewURL'),
                'medium_url': hit.get('webformatURL'),
                'large_url': hit.get('largeImageURL'),
                'width': hit.get('imageWidth'),
                'height': hit.get('imageHeight'),
                'tags': hit.get('tags') or '',
            }
            for hit in data.get('hits') or []
        ]
        total_results = data.get('totalHits') or 0
        return JsonResponse({
            'photos': photos,
            'total_results': total_results,
            'page': page,
            'per_page': STOCK_PER_PAGE,
            'pages': math.ceil(total_results / STOCK_PER_PAGE) if total_results else 0,
        })

    def stock_unsplash(self, request):
        q = request.GET.get('q', '').strip()
        if not q:
            return JsonResponse({'error': 'O parâmetro "q" é obrigatório.'}, status=400)

        access_key = resolve_stock_api_key('unsplash')
        if not access_key:
            return JsonResponse({'error': 'UNSPLASH_ACCESS_KEY não configurada.'}, status=500)

        page = max(1, _int_param(request, 'page', 1))
        try:
            resp = requests.get(
                'https://api.unsplash.com/search/photos',
                params={'query': q, 'page': page, 'per_page': STOCK_PER_PAGE},
                headers={'Authorization': f'Client-ID {access_key}'},
                timeout=PROXY_TIMEOUT,
            )
            data = resp.json()
            if not resp.ok:
                errors = data.get('errors') or []
                raise ValueError(errors[0] if errors else f'Erro {resp.status_code}')
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

        photos = [
            {
                'id': p.get('id'),
                'user': (p.get('user') or {}).get('name') or '',
                'thumb_url': (p.get('urls') or {}).get('small') or '',
                'large_url': (p.get('urls') or {}).get('full') or '',
                'alt': p.get('alt_description') or p.get('description') or '',
                'width': p.get('width') or 0,
                'height': p.get('height') or 0,
            }
            for p in data.get('results') or []
        ]
        total_results = data.get('total') or 0
        return JsonResponse({
            'photos': photos,
            'total_results': total_results,
            'page': page,
            'per_page': STOCK_PER_PAGE,
            'pages': math.ceil(total_results / STOCK_PER_PAGE) if total_results else 0,
        })

    # ------------------------------------------------------------------
    # Proxies — baixam bytes de imagem same-origin (evita CORS/hotlink ao
    # exibir/ajustar no canvas do editor).
    # ------------------------------------------------------------------
    def stock_proxy(self, request):
        """Proxy com allowlist: fontes stock fixas + o host do próprio
        storage do client — permite reaproveitar este MESMO proxy pra
        "Ajustar" uma imagem já escolhida da Galeria."""
        url = request.GET.get('url')
        if not url:
            return JsonResponse({'error': 'O parâmetro "url" é obrigatório.'}, status=400)

        from urllib.parse import urlparse
        parsed = urlparse(url)
        if parsed.scheme != 'https':
            return JsonResponse({'error': 'URL inválida.'}, status=400)

        allowed_hosts = set(STOCK_ALLOWED_HOSTS)
        allowed_hosts.add(request.get_host().split(':')[0])
        if settings.AWS_S3_CUSTOM_DOMAIN:
            allowed_hosts.add(settings.AWS_S3_CUSTOM_DOMAIN.split('/')[0])

        if parsed.hostname not in allowed_hosts:
            return JsonResponse({'error': f'Host não permitido: {parsed.hostname}'}, status=403)

        return self._proxy_download(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)'})

    def stock_google_proxy(self, request):
        """Proxy sem allowlist de host (aba URL direta) — só exige https +
        content-type image/*, timeout curto."""
        url = request.GET.get('url')
        if not url:
            return JsonResponse({'error': 'O parâmetro "url" é obrigatório.'}, status=400)

        from urllib.parse import urlparse
        parsed = urlparse(url)
        if parsed.scheme != 'https':
            return JsonResponse({'error': 'Apenas URLs https são permitidas.'}, status=403)
        if parsed.hostname in {'localhost', '127.0.0.1', '0.0.0.0', '::1'}:
            return JsonResponse({'error': 'Host não permitido.'}, status=403)

        return self._proxy_download(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                              '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                'Referer': f'{parsed.scheme}://{parsed.netloc}',
            },
            not_image_error='O site não permite download direto desta imagem (hotlink protection). '
                             'Salve a imagem localmente e faça upload.',
        )

    def _proxy_download(self, url, headers, not_image_error='URL não retornou uma imagem válida.'):
        try:
            resp = requests.get(url, headers=headers, timeout=PROXY_TIMEOUT, stream=True)
        except requests.RequestException as e:
            return JsonResponse({'error': f'Falha ao buscar imagem: {e}'}, status=502)

        if not resp.ok:
            return JsonResponse({'error': f'Erro ao buscar imagem: {resp.status_code}'}, status=resp.status_code)

        content_type = resp.headers.get('content-type', '')
        if not content_type.startswith('image/'):
            return JsonResponse({'error': not_image_error}, status=415)

        response = HttpResponse(resp.content, content_type=content_type)
        response['Cache-Control'] = 'public, max-age=3600'
        return response
