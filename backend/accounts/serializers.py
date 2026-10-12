from  rest_framework import serializers
from .models import User
from .models import Company,User

class SignupSerializer(serializers.Serializer):
    company_name = serializers.CharField()
    manager_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")

        return value
    
    def create(self, validated_data):
        
        #print(validated_data)
        company = Company.objects.create(
            name=validated_data["company_name"])
        
        owner = User.objects.create_user(
            username=validated_data["owner_name"],
            company = company,
            email=validated_data["email"],
            password = validated_data["password"],
            role = "owner")
        
        
        return owner
    
    
class LoginSerializer(serializers.Serializer):
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    
class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "role","username"]
        

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name"]
        
class ManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name","email"]

class AvailableEmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]