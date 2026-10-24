from django.shortcuts import render
from .models import User
from .serializers import (SignupSerializer,
                          LoginSerializer,
                          CurrentUserSerializer,
                          EmployeeSerializer,
                          ManagerSerializer,
                          AvailableEmployeeSerializer,
                          ChangePasswordSerializer)
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from django.contrib import messages
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status 
from rest_framework.permissions import IsAuthenticated


class SignUpApi(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Company and manager created successfully."},
            status=status.HTTP_201_CREATED,
        )
class LoginApi(APIView):
    serializer_class = LoginSerializer
    
    
    def post(self,request):
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]
            
            try:
                user = User.objects.only(
                    "id","password",).get(email=email)              
                
            except User.DoesNotExist:
                return Response(
                         {"message": "USER DOES NOT EXISTS"},
                         status=404
                )
                
            if user.check_password(password):
                
                refresh = RefreshToken.for_user(user) #refresh token+access token
                return Response({
                    "message": "Login successful",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                })
            else:
                return Response({
                "messages":"password is incorrect!"},
                                status=401)
        
        return Response(
            serializer.errors,
            status=400
        )   
        
        
        
class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)
    
    
class EmployeeListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employees = User.objects.filter(role__in=['employee','manager'], company=request.user.company)
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)  
    
    
class ManagerListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        manager =User.objects.filter(role="manager",company=request.user.company)
        serialzer = ManagerSerializer(manager,many=True)
        return Response(serialzer.data)
    
    
class AvailableEmployeeListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employees = User.objects.filter(
            role="employee",
            company=request.user.company,
            team__isnull=True
        )

        serializer = AvailableEmployeeSerializer(
            employees,
            many=True
        )

        return Response(serializer.data)
    
    
class ChangePasswordAPIView(APIView):   
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            
            user = request.user 
            
            if not user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.data.get("new_password"))
            user.save(update_fields=["password"])
            
            refresh = RefreshToken.for_user(user)

            
            return Response({
                "message": "Password updated successfully.",
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)