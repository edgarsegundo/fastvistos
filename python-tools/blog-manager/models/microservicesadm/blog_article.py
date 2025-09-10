from uuid import uuid4
from tortoise import fields, models


class BlogArticle(models.Model):
    TYPE_CHOICES = ("internal", "public", "restricted")

    id = fields.CharField(pk=True, max_length=32, default=lambda: uuid4().hex)
    blog_topic = fields.ForeignKeyField("models.BlogTopic", related_name="posts", on_delete=fields.CASCADE)

    title = fields.TextField()
    metatitle = fields.TextField(null=True)

    content_raw = fields.TextField(null=True)
    content_html = fields.TextField(null=True)
    content_md = fields.TextField(null=True)

    type = fields.CharField(max_length=50, default="internal")
    slug = fields.CharField(max_length=255, unique=True, null=True)

    published = fields.DatetimeField(auto_now_add=True)
    image = fields.CharField(max_length=500, null=True)  # Path to the image

    created = fields.DatetimeField(auto_now_add=True)
    updated = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "blog_article"
        ordering = ["created"]