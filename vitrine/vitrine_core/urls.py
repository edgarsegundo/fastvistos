"""
URL configuration for vitrine_core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from core import views as core_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tenancy/', include('tenancy.urls')),

    # API para Astro
    path('api/projects/', core_views.api_projects_list, name='api_projects_list'),
    path('api/projects/<str:project_slug>/pages/', core_views.api_project_pages, name='api_project_pages'),
    path('api/trigger-rebuild/', core_views.api_trigger_rebuild, name='api_trigger_rebuild'),
]
