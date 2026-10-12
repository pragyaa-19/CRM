from django.db import models
from accounts.models import User, Company


class Conversation(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="conversations"
    )

    name = models.CharField(
        max_length=100,
        blank=True
    )

    is_group = models.BooleanField(default=False)

    members = models.ManyToManyField(
        User,
        related_name="conversations"
    ) #2 options we are given 
      #1. conversation.members.all() -- who belongs to this chat 
      #2. reverse relation request.user.conversations.all() - all chats of a specific user

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.name:
            return self.name

        return f"Conversation {self.id}"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    is_read = models.BooleanField(default=False)
    
    is_deleted = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username}: {self.content[:30]}"