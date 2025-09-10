import os
import argparse
from . import create_app
from app.ping import ping_bp
from app.settings import TORTOISE_ORM, local_test
from tortoise.contrib.quart import register_tortoise


ACTIVE_ENDPOINTS = (
    ("/", ping_bp), 
    )

app = create_app()

# Disable strict slashes (Quart does not support strict_slashes natively)
# Quart follows standard behavior where `/route` and `/route/` are the same.

# Register blueprints dynamically
for endpoint, blueprint in ACTIVE_ENDPOINTS:
    app.register_blueprint(blueprint, url_prefix=endpoint)

# Register Tortoise ORM
register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=True if local_test else False, 
    # add_exception_handlers=True,
)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--local-test", action="store_true")
    args, _ = parser.parse_known_args()

    if args.local_test:
        # import app.in_app_in_process_async_tasks.tasks.fetch_contact.test
        # import app.in_app_in_process_async_tasks.tasks.categorize_message.test
        pass
        # import app.fastvistos.post.test
    else:
        app.run(
            host="0.0.0.0",
            port=int(os.getenv("PORT", "8000")),
            debug=__debug__
        )