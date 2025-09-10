import aiohttp

from quart import Quart
from quart_cors import cors


def create_app():
    app = Quart(__name__)
    app = cors(app, allow_origin=[
        "https://fastvistos.tur.br",
        "https://www.fastvistos.tur.br",
        "https://fastvistos.com.br",
        "https://www.fastvistos.com.br",
        "https://ideas.p2digital.com.br",
        "https://adm.p2digital.com.br"
    ])    

    @app.before_serving
    async def create_aiohttp_session():
        timeout = aiohttp.ClientTimeout(total=10)
        connector = aiohttp.TCPConnector(limit=100)
        app.aiohttp_session = aiohttp.ClientSession(connector=connector, timeout=timeout)

    @app.after_serving
    async def close_aiohttp_session():
        await app.aiohttp_session.close()

    return app