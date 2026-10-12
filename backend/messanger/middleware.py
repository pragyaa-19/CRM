from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken

#getting the sender from jwt 
@database_sync_to_async
def get_user(user_id):

    from django.contrib.auth import get_user_model

    User = get_user_model()

    try:
        return User.objects.get(id=user_id)

    except User.DoesNotExist:
        return None


class JWTAuthMiddleware:

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):

        query_string = scope.get("query_string", b"").decode()

        query_params = parse_qs(query_string)

        token = query_params.get("token", [None])[0]

        scope["user"] = None

        if token:

            try:
                access_token = AccessToken(token)

                user_id = access_token["user_id"]

                user = await get_user(user_id)

                scope["user"] = user

            except Exception as e:

                print("WebSocket JWT error:", e)

                scope["user"] = None

        return await self.app(scope, receive, send)