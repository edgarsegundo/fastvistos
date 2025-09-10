import logging

from uuid import uuid4
from tortoise import fields, models


logger = logging.getLogger(__name__)

class BlogConfig(models.Model):
    id = fields.CharField(pk=True, max_length=32, default=lambda: uuid4().hex)
    title = fields.CharField(max_length=255)
    slug = fields.CharField(max_length=255, unique=True, null=True)
    config = fields.JSONField(default=dict)

    created = fields.DatetimeField(auto_now_add=True)
    updated = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "blog_config"
        ordering = ["title"]
