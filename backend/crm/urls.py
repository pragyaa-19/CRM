"""
URL configuration for crm project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
from django.urls import path,include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.contrib.auth import views as auth_views


urlpatterns = [
  
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("silk/", include("silk.urls", namespace="silk")),
    path("",include("accounts.urls")),
    path("invitations/",include("invitations.urls")),
    path("leads/",include("leads.urls")),
    path("teams/",include("teams.urls")),
    path("messages/", include("messanger.urls")),
    path("subscriptions/", include("subscriptions.urls")),
    path("notifications/", include("notification.urls")),
    path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
]

admin.site.index_title = "THE CRM"
admin.site.site_title = "CRM"
admin.site.site_header = "THE CRM Admin"