from enum import member

from django.http import request
from django.http import request
from django.shortcuts import render
from .serializers import TeamSerializer
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Team
from .permission import IsOwner
from accounts.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class TeamListCreateView(ListCreateAPIView):
    permission_classes = [IsOwner]
    serializer_class = TeamSerializer
    
    def get_queryset(self):
        user = self.request.user
        return Team.objects.filter(company=user.company)
    
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)
        
        
class TeamRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwner]
    serializer_class = TeamSerializer
    
    
    def get_queryset(self):
        user = self.request.user
        return Team.objects.filter(company=user.company)
    
    

class AddTeamMemberView(APIView):
    permission_classes = [IsOwner]
    
  
    def post(self,request,*args,**kwargs):
        team_id = self.kwargs["team_id"]
        user_id = request.data["user_id"]
                
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response(
                {"error": "Team Does Not Exists"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            member = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if team.company != request.user.company:
            return Response(
                {"error": "You can only manage teams in your company."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if member.role != "employee":
            return Response(
                {"error":"Only Employees can be added"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if member.team is not None:
            return Response(
                {"error": "This employee already belongs to a team."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        member.team = team
        member.save()
        
        return Response(
            {"error":"Employee Added to team successfully."},
            status=status.HTTP_200_OK
        )
        
        
class RemoveTeamMember(APIView):
    permission_classes = [IsOwner]
    
    def delete(self,request,*args,**kwargs):
        
        team_id = self.kwargs["team_id"]
        user_id = request.data["user_id"]
        
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
                        return Response(
                            {"error": "Team Does Not Exists"},
                            status=status.HTTP_404_NOT_FOUND
                        )
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
                    return Response(
                        {"error": "User Does Not Exists"},
                        status=status.HTTP_404_NOT_FOUND
                    )
                    
        if team.company != request.user.company:
            return Response(
                        {"error": "You can only manage teams in your company."},
                        status=status.HTTP_403_FORBIDDEN
                    )
        if user.team != team:
            return Response(
                {"error": "This employee is not a member of this team."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user.team = None
        user.save()
        
        return Response(
            {"message": "Employee removed from team successfully."},
            status=status.HTTP_200_OK
        )
            
        
        
        
        
            
          
          
        
            
            