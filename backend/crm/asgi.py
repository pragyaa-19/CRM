"""
ASGI config for crm project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter,URLRouter
from messanger.routing import websocket_urlpatterns
from messanger.middleware import JWTAuthMiddleware


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm.settings")

django_asgi_application = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_application,
    
"websocket": JWTAuthMiddleware(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})