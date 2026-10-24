from django.urls import path
from .views import (ChangePasswordAPIView, EmployeeListAPIView,
                    SignUpApi,LoginApi,
                    CurrentUserAPIView,
                    ManagerListAPIView,
                    AvailableEmployeeListAPIView)

urlpatterns = [
    path('api/signup/',SignUpApi.as_view(), name="create"),
    path('api/login/', LoginApi.as_view(), name="Login"),
    path("api/me/", CurrentUserAPIView.as_view(), name="current-user"),
    path("api/employees/", EmployeeListAPIView.as_view(), name="employee-list"),
    path("api/managers/", ManagerListAPIView.as_view(), name="manager-list"),
    path(
        "api/available-employees/",
        AvailableEmployeeListAPIView.as_view(),
        name="available-employees"
    ),
    path("api/change-password/", ChangePasswordAPIView.as_view(), name="change-password")
    
]

