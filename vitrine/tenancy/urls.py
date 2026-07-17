from django.urls import path

from . import views

app_name = "tenancy"

urlpatterns = [
    path("set-active-client/<int:client_id>/", views.set_active_client, name="set-active-client"),
]
