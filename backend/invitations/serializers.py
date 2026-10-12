from rest_framework import serializers
from .models import Invitation
from accounts.models import User
from django.contrib.auth.hashers import make_password

class UserInvitationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

class BulkInvitationSerializer(serializers.Serializer):
    users = UserInvitationSerializer(many=True)
    
    
class AcceptInvitaionSerializer(serializers.ModelSerializer):
        class Meta:
            model = User
            fields = ["first_name","last_name","password","confirm_password"]
            
        confirm_password = serializers.CharField(write_only=True)
        
        def validate(self, data):
            if data["password"] != data["confirm_password"]:
                raise serializers.ValidationError(
                    "Passwords do not match."
        )
            return data
        
        def create(self, validated_data):
            invitation = self.context["invitation"]
            user = User.objects.create(
                first_name = validated_data["first_name"],
                last_name = validated_data["last_name"],
                password= make_password(validated_data["password"]),
                email=invitation.email,
                company=invitation.company,
                role=invitation.role,)
            
            return user