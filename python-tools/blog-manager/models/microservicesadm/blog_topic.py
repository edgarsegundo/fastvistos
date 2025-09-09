from uuid import uuid4
from tortoise import fields, models


class BlogTopic(models.Model):
    id = fields.CharField(pk=True, max_length=32, default=lambda: uuid4().hex)
    blog_config = fields.ForeignKeyField("models.BlogConfig", related_name="topics", on_delete=fields.CASCADE)

    title = fields.CharField(max_length=255)
    metatitle = fields.TextField(null=True)

    slug = fields.CharField(max_length=255, unique=True, null=True)
    image = fields.CharField(max_length=500, null=True)  # Path to the image instead of ImageField
    order = fields.IntField(default=0, index=True)

    created = fields.DatetimeField(auto_now_add=True)
    updated = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "blog_topic"
        ordering = ["title"]