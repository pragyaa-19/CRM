from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import NotificationSerializer
from .models import Notification


class NotificationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user,
            is_deleted=False,
        ).order_by("-created_at")

        serializer = NotificationSerializer(
            notifications,
            many=True,
        )

        return Response(serializer.data)


class UnreadNotificationCountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        unread_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
            is_deleted=False,
        ).count()

        return Response({"unread_count": unread_count})


class MarkNotificationReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(
            Notification,
            pk=pk,
            user=request.user,
            is_deleted=False,
        )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response({
            "message": "Notification marked as read.",
            "is_read": notification.is_read,
        })
        
        