from django.urls import path
from .views import (MarkNotificationReadAPIView, NotificationAPIView, UnreadNotificationCountAPIView)
urlpatterns = [
    path("api/", 
        NotificationAPIView.as_view(),
        name="notifications-list"),
    path("api/unread-count/", 
            UnreadNotificationCountAPIView.as_view(),
            name="unread-notification-count"),
    path("api/<int:pk>/mark-read/",
         MarkNotificationReadAPIView.as_view(), 
         name="mark-notification-read"),
    path("api/<int:pk>/mark-read-all/",
         MarkNotificationReadAPIView.as_view(), 
         name="mark-notification-read"),
]

