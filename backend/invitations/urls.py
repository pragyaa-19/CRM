from django.urls import path
from .views import InvitationAPIView,AcceptInvitation

urlpatterns = [
    path('api/invite/',InvitationAPIView.as_view(), name="invitation"),
    path(
    'api/accept/<str:token>/',
    AcceptInvitation.as_view(),
    name="accept_invitation"
),
]