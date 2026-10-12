from django.urls import path
from .views import (ActivityRetrieveUpdateDestroyView,
                    LeadListCreateView, 
                    LeadRetrieveUpdateDestroyView,
                    ActivityListCreateView,DeletedLeadListAPIView,
                    RestoreLeadAPIView)

urlpatterns = [
    path(
        'api/create-lead/',
        LeadListCreateView.as_view(),
        name='lead-list-create'
    ),

    path(
        'api/leads/<int:pk>/',
        LeadRetrieveUpdateDestroyView.as_view(),
        name='lead-retrieve-update-destroy'
    ),

    path(
        'api/activities/',
        ActivityListCreateView.as_view(),
        name='activity-list-create'
    ),

    path(
        'api/activities/<int:pk>/',
        ActivityRetrieveUpdateDestroyView.as_view(),
        name='activity-retrieve-update-destroy'
    ),
    path(
    "api/trash/",
    DeletedLeadListAPIView.as_view(),
    name="deleted-leads"
),
    path(
    "api/trash/<int:pk>/restore/",
    RestoreLeadAPIView.as_view(),
    name="restore-lead"
),
]