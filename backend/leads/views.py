from django.db.migrations import serializer
from django.shortcuts import render
from .serializers import LeadSerializer,ActivitySerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView,ListAPIView
from .models import Lead,Activity
from rest_framework.views import APIView
from rest_framework.response import Response
from .pagination import UserPagination
from rest_framework import status

class LeadListCreateView(ListCreateAPIView):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = UserPagination
    
    def get_queryset(self):
        return Lead.objects.filter(
            company=self.request.user.company,
            is_deleted=False
        ).select_related("assigned_to"
        ).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role ==      "employee":
            serializer.save(
                company=self.request.user.company,
                assigned_to = self.request.user
            )
        else:  
            serializer.save(
                company=user.company,
            )
        
        
class LeadRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Lead.objects.filter(
            company = self.request.user.company,
            is_deleted = False
        )
        
    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save() 
        
        
class ActivityListCreateView(ListCreateAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Activity.objects.filter(
            lead__company=self.request.user.company
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            )
        
        
class ActivityRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Activity.objects.filter(
            lead__company = self.request.user.company
        )
        
    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()
        
        
class DeletedLeadListAPIView(ListAPIView):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lead.objects.filter(
            company=self.request.user.company,
            is_deleted=True
        )
        
        
class RestoreLeadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            lead = Lead.objects.get(
                id=pk,
                company=request.user.company,
                is_deleted=True
            )
        except Lead.DoesNotExist:
            return Response(
                {"error": "Deleted lead not found."},
                status=404
            )

        lead.is_deleted = False
        lead.save()

        return Response(
            {"message": "Lead restored successfully."}
        )
        
        
        
        
class PermanentDeleteLeadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            lead = Lead.objects.get(
                id=pk,
                company=request.user.company,
                is_deleted=True
            )
        except Lead.DoesNotExist:
            return Response(
                {"error": "Deleted lead not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        lead.delete()

        return Response(
            {"message": "Lead permanently deleted successfully."},
            status=status.HTTP_200_OK
        )