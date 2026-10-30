from channels.generic.websocket import AsyncJsonWebsocketConsumer


class NotificationConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        self.user = self.scope.get("user")

        # Reject unauthenticated connections
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        # Each user gets a separate notification group
        self.notification_group_name = (
            f"user_notifications_{self.user.id}"
        )

        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name,
        )

        await self.accept()

    async def send_notification(self, event):
        await self.send_json(event["notification"])

    async def disconnect(self, close_code):
        if hasattr(self, "notification_group_name"):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name,
            ) 