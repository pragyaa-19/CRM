from django.urls import path
from .views import (ListMessagesHistoryAPIView,
                    RecentConversationAPIView,
                    UserSearchAPIView,
                    DirectConversationAPIView,
                    CreateGroupAPIView,
                    CompanyUsersAPIView)

urlpatterns = [
    path(
        "api/conversations/<int:conversation_id>/messages/",
        ListMessagesHistoryAPIView.as_view(),
    ),
    path("api/conversations/",
         RecentConversationAPIView.as_view(),
    ),
    path("api/users/search/",
         UserSearchAPIView.as_view(),
    ),
    path(
        "api/conversations/direct/",
        DirectConversationAPIView.as_view(),
    ),
    path(
            "api/conversations/group/",
            CreateGroupAPIView.as_view(),
    ),
    path(
        "api/users/",
        CompanyUsersAPIView.as_view(),
    )
]