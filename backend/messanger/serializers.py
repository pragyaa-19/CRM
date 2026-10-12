from rest_framework import serializers
from .models import Message
from accounts.models import User

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)
    conversation_name = serializers.CharField(
        source="conversation.name",
        read_only=True
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "content",
            "created_at",
            "is_read",
            "is_deleted",
            "is_edited",
            "conversation",
            "sender",
            "sender_name",
            "conversation_name",
        ]
        
        
class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id","username"]
        
        
class DirectConversationSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    
    
class CreateGroupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    members = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset = User.objects.all(),
        
    )
    
   