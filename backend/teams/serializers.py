from rest_framework import serializers
from .models import Team
from accounts.models import User

       
class TeamMemberSerializer(serializers.Serializer):
    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
        ]

class TeamSerializer(serializers.ModelSerializer):
    manager_name = serializers.SerializerMethodField()
    manager_email = serializers.SerializerMethodField()
    members = TeamMemberSerializer(many=True, read_only=True)
    class Meta:
        model = Team
        fields = ("id",
                  "name",
                  "company",
                  "manager",
                  "members",
                  "manager_name",
                  "manager_email",
                  "created_on",
                  "updated_on",)
        
        read_only_fields = ( "id",
                            "company",
                            "created_on",
                            "updated_on")
    
    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.first_name} {obj.manager.last_name}".strip()
        return None
    
    def get_manager_email(self, obj):
        if obj.manager:
            return obj.manager.email
        return None
    
    def validate_manager(self,value):
        user = self.context["request"].user
        if value.role != "manager":
            raise serializers.ValidationError("Selected user must be a manager.")   
        if value.company != user.company:
            raise serializers.ValidationError("You can only assign teams to managers within your company.") 
        return value
        
   