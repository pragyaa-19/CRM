from django.shortcuts import render
from accounts.models import User
from subscriptions.models import Subscription
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
from accounts.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import transaction
from subscriptions.models import Subscription
from .serializers import AcceptInvitaionSerializer


class InvitationAPIView(APIView):
    permission_classes = [CanInviteUsers]

    def post(self, request):
        serializer = BulkInvitationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        users = serializer.validated_data["users"]

        company = request.user.company
        created = []
        skipped = []

        subscription = Subscription.objects.filter(
            company=company
        ).first()

        # Free plan: maximum 2 accounts, including pending invitations.
        if not subscription or subscription.plan == "FREE":
            existing_users = User.objects.filter(
                company=company
            ).count()

            pending_invites = Invitation.objects.filter(
                company=company,
                status="PENDING",
            ).count()

            available_slots = max(
                0,
                2 - existing_users - pending_invites,
            )

            if available_slots < len(users):
                skipped.extend(
                    {
                        "email": invited_user["email"],
                        "reason": (
                            "Free plan allows only 2 accounts. "
                            "Upgrade to Pro to add more."
                        ),
                    }
                    for invited_user in users[available_slots:]
                )

                users = users[:available_slots]

        for invited_user in users:
            email = invited_user["email"]
            role = invited_user["role"]

            if request.user.role == "manager" and role == "owner":
                skipped.append({
                    "email": email,
                    "reason": "Managers cannot invite owners.",
                })
                continue

            if Invitation.objects.filter(
                email=email,
                company=company,
                status="PENDING",
            ).exists():
                skipped.append({
                    "email": email,
                    "reason": "Pending invitation already exists.",
                })
                continue

            invitation = Invitation.objects.create(
                email=email,
                company=company,
                role=role,
                invited_by=request.user,
                token=uuid.uuid4(),
                status="PENDING",
                expires_at=timezone.now() + timedelta(days=7),
            )

            created.append(email)
            send_invitation_email.delay(invitation.id)

        return Response(
            {
                "message": "Invitation process completed.",
                "created": created,
                "skipped": skipped,
            },
            status=status.HTTP_201_CREATED,
        )


class AcceptInvitation(APIView):

    def post(self, request, token):
        try:
            invitation = Invitation.objects.select_related(
                "company"
            ).get(token=token)
        except Invitation.DoesNotExist:
            return Response(
                {"error": "Invalid invitation."},
                status=status.HTTP_404_NOT_FOUND
            )

        if invitation.status != "PENDING":
            return Response(
                {
                    "error": "This invitation has already been accepted "
                    "or is no longer valid."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if invitation.expires_at <= timezone.now():
            return Response(
                {"error": "This invitation has expired."},
                status=status.HTTP_400_BAD_REQUEST
            )

        company = invitation.company

        with transaction.atomic():

            subscription = Subscription.objects.filter(
                company=company
            ).first()

            # Free plan: maximum 2 accounts, including the owner.
            if not subscription or subscription.plan == "FREE":

                existing_users = User.objects.filter(
                    company=company
                ).count()

                if existing_users >= 2:
                    return Response(
                        {
                            "error": (
                                "Free plan allows only 2 accounts, "
                                "including the owner. Upgrade to Pro "
                                "to add more users."
                            )
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

            serializer = AcceptInvitaionSerializer(
                data=request.data,
                context={"invitation": invitation}
            )

            if not serializer.is_valid():
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer.save()

            invitation.status = "ACCEPTED"
            invitation.save(update_fields=["status"])

        return Response(
            {
                "message": (
                    "Invitation accepted successfully. "
                    "Your account has been created."
                )
            },
            status=status.HTTP_201_CREATED
        )