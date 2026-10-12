from rest_framework import serializers
from .models import Lead,Activity

class LeadSerializer(serializers.ModelSerializer):
    
    assigned_to_name = serializers.SerializerMethodField()
    assigned_to_email = serializers.SerializerMethodField()
    
    
    class Meta:
        model = Lead
        fields = ["id", 
                  "name",
                  "email", 
                  "contact_num",  
                  "status",
                  "created_at",
                  "assigned_to",
                  "assigned_to_name",
                  "assigned_to_email",
                  "updated_at",
                  ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "assigned_to_name",
            "assigned_to_email",
            ]
        
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
        return None

    def get_assigned_to_email(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.email
        return None

class EmployeeLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            "id",
            "name",
            "email",
            "contact_num",
            "status",
            "created_at",
            "assigned_to",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "assigned_to",
        ]   
class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ["id", 
                  "lead",
                  "activity_type", 
                  "called_on",
                  "follow_up",
                  "notes", 
                  "created_at",
                  ]
        read_only_fields = ["id", "created_at"]