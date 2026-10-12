from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json 
from .models import Conversation,Message


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        
        # Logged-in user from our JWT middleware
        self.user = self.scope.get("user")
        
        # Conversation ID from the WebSocket URL
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]

        # Make sure user is authenticated
        if not self.user:
            await self.close()
            return
        
        # Check whether this user belongs to this conversation
        conversation_exists = await self.user_in_conversation()

        if not conversation_exists:
            await self.close()
            return
        
        # Create the Channels group name
        self.room_group_name = f"conversation_{self.conversation_id}"
        
        # Join the Channels group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        # Accept WebSocket connection
        await self.accept()

        
    @database_sync_to_async
    def user_in_conversation(self):

        return Conversation.objects.filter(
            id=self.conversation_id,
            company=self.user.company,
            members=self.user
        ).exists()
        
        
    @database_sync_to_async
    def  save_message(self,text_data):
       return  Message.objects.create(
            conversation_id=self.conversation_id,
            sender = self.user,
            content = text_data,
        )
        
    async def receive(self, text_data):

        
        data = json.loads(text_data)
        
        msg = await self.save_message(data["content"]) 
        await self.channel_layer.group_send(
            self.room_group_name,
        {
            "type": "chat.system_message",
            "message": {
                "id": msg.id,
                "sender": msg.sender_id,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "is_read": msg.is_read,
                "is_deleted": msg.is_deleted,
                "is_edited": msg.is_edited,
            },
        },
    )
        
    async def chat_system_message(self, event):

        await self.send(
        text_data=json.dumps(event["message"])
    )
        
    async def disconnect(self, close_code):

        if hasattr(self, "room_group_name"):

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

