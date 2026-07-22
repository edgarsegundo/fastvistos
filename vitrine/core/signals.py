from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from core.models import Project, Page


@receiver(post_save, sender=Page)
def mark_project_rebuild_on_page_change(sender, instance, created, **kwargs):
    """Quando uma página é criada/editada, marca projeto para rebuild"""
    instance.project.needs_rebuild = True
    instance.project.save(update_fields=['needs_rebuild'])
    action = "criada" if created else "editada"
    print(f"🔄 Página '{instance.slug}' {action} → Project '{instance.project.slug}' marcado para rebuild")


@receiver(post_delete, sender=Page)
def mark_project_rebuild_on_page_delete(sender, instance, **kwargs):
    """Quando uma página é deletada, marca projeto para rebuild"""
    instance.project.needs_rebuild = True
    instance.project.save(update_fields=['needs_rebuild'])
    print(f"🔄 Página '{instance.slug}' deletada → Project '{instance.project.slug}' marcado para rebuild")
