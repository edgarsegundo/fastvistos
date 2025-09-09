import os
from app.common.common_helpers import load_environment, read_secret
from tortoise import Tortoise

# Always load environment variables (not just in debug mode)
load_environment()

local_test = os.getenv("lOCAL_TEST", False)

MYSQL_USERPASS = read_secret("MYSQL_MICROSERVICESADM_APPUSER_PWD") or os.getenv("MYSQL_USERPASS")

microservicesadm_models = [ "app.models.microservicesadm.blog_config", 
                            "app.models.microservicesadm.blog_topic", 
                            "app.models.microservicesadm.blog_article",
                            ]

if local_test:
    TORTOISE_ORM = {
        "connections": {
            "default": "sqlite://db.sqlite3",
        },
        "apps": {
            "models": {
                "models": microservicesadm_models,
                "default_connection": "default"
            },
        }
    }
else:
    TORTOISE_ORM = {
        "connections": {
            "default": {
                "engine": "tortoise.backends.mysql",
                "credentials": {
                    "host": "72.60.57.150",
                    "port": 3306,
                    "user": "microservicesadm_appuser",
                    "password": MYSQL_USERPASS,
                    "database": "microservicesadm",
                    "charset": "utf8mb4",
                    "init_command": "SET sql_mode='STRICT_TRANS_TABLES', time_zone = '+00:00'"
                }
            },
        },
        "apps": {
            "models": {
                "models": microservicesadm_models, 
                "default_connection": "default"
            },
        }
    }    

async def init_db(generate_schemas: bool = False):
    await Tortoise.init(config=TORTOISE_ORM)
    if generate_schemas:
        await Tortoise.generate_schemas()