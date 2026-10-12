from rest_framework.permissions import BasePermission


class CanInviteUsers(BasePermission):
    message = "You do not have permission to invite users."
    
    def has_permission(self, request, view):
        #print("========== INVITATION PERMISSION ==========")
        #print("USER:", request.user)
        #print("AUTHENTICATED:", request.user.is_authenticated)

        #if request.user.is_authenticated:
        #    print("ROLE:", request.user.role)
        #    print("COMPANY:", request.user.company)

        #print("===========================================")
        return (
            request.user.is_authenticated
            and request.user.role in ["owner", "manager"]
        )