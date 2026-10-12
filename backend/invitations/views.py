from django.shortcuts import render
from .models import Invitation
from rest_framework.views import APIView # bcs we need more control and we are sending invitations in bulk 
from .serializers import BulkInvitationSerializer,AcceptInvitaionSerializer
from rest_framework.response import Response
from rest_framework import status
import uuid
from datetime import timedelta
from django.utils import timezone
from .tasks import send_invitation_email
from .permissions import CanInviteUsers

class InvitationAPIView(APIView):
    permission_classes = [CanInviteUsers]
    def post(self,request):
        #print("USER:", request.user)
        #print("AUTHENTICATED:", request.user.is_authenticated)
        #print("ROLE:", request.user.role)

        serializer  = BulkInvitationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST,
        )
        
        users = serializer.validated_data["users"]
        
        created = []
        skipped = []
        
        for user in users:
            
            if request.user.role == "manager" and user["role"] == "owner":
                skipped.append({
        "email": user["email"],
        "reason": "Managers cannot invite owners."})
                continue
            
            if Invitation.objects.filter(
            email=user["email"],
            company=request.user.company,
            status="PENDING"
            ).exists():
                skipped.append({
                    "email": user["email"],
                    "reason": "Pending invitation already exists."
                    })
                continue
                
            invitation = Invitation.objects.create(
                email = user["email"],
                company=request.user.company,
                role = user["role"],
                invited_by = request.user,
                token = uuid.uuid4(),
                status="PENDING",
                expires_at = timezone.now() + timedelta(days=7)
            )
            created.append(user["email"])
            send_invitation_email.delay(invitation.id)
        #print(created,skipped)
        return Response(
            {
                "message": "Invitation process completed.",
                "created": created,
                "skipped": skipped,
            },
            status=status.HTTP_201_CREATED,
        )
    
        
        
class AcceptInvitation(APIView):
    
    def post(self,request,token):
        try:
            invitation = Invitation.objects.get(token=token)
        except Invitation.DoesNotExist: 
            return Response( 
                            {"error": "Invalid invitation."}, 
                            status=status.HTTP_404_NOT_FOUND )
            
        if invitation.status != 'PENDING':
            return Response( 
                    {"error": "This invitation has already been accepted or is no longer valid."}, 
                    status=status.HTTP_400_BAD_REQUEST )
        if invitation.expires_at <= timezone.localdate():
            return Response( 
                    {"error": "This invitation has expired."}, 
                    status=status.HTTP_400_BAD_REQUEST )
        serializer = AcceptInvitaionSerializer(
                        data = request.data,
                        context = {"invitation":invitation}
                    )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
)
                           
        serializer.save()
        invitation.status = "ACCEPTED"
        invitation.save()
                        
        return Response( {
            "message": "Invitation accepted successfully. Your account has been created."
                        },
            status=status.HTTP_201_CREATED )
            
        