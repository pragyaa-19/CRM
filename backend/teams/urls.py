from django.urls import path
from .views import (TeamListCreateView,
                    TeamRetrieveUpdateDestroyView,
                    AddTeamMemberView,RemoveTeamMember)
urlpatterns = [
    path("api/create-team/", 
         TeamListCreateView.as_view(),
         name="create-team"),
    
    path("api/team/<int:pk>/",
         TeamRetrieveUpdateDestroyView.as_view(),
         name="update-delete-team"),
    
    path("api/team/<int:team_id>/members/",
         AddTeamMemberView.as_view(),
         name="add-members"),
    
    path("api/team/<int:team_id>/members/<int:user_id>/",
    RemoveTeamMember.as_view(),
    name="remove-team-member")
]
