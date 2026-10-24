from django.shortcuts import render
from .models import Conversation,Message
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import (MessageSerializer,
                        UserSerializers,
                        DirectConversationSerializer,
                        CreateGroupSerializer)
from django.db.models import Max
from accounts.models import User
from rest_framework import status
from .pagination import UserPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics


class ListMessagesHistoryAPIView(APIView):
    
    def get(self,request,conversation_id):
        
        msgs = Message.objects.filter(
            conversation = conversation_id,
            is_deleted  = False,
        )
        
        serialized = MessageSerializer(msgs,many=True)
        
        return Response(
            serialized.data
        )





class RecentConversationAPIView(APIView):

    def get(self, request):

        conversations = Conversation.objects.filter(
            company=request.user.company,
            members=request.user,
        ).annotate(
            latest_message=Max("messages__created_at")
        ).order_by("-latest_message")

        groups = []
        dm = []

        for conversation in conversations:

            # Latest message in this conversation
            latest_msg = conversation.messages.order_by(
                "-created_at"
            ).first()

            # Group chat
            if conversation.is_group:

                groups.append({
                    "conversation_id": conversation.id,
                    "name": conversation.name,
                    "last_message": latest_msg.content if latest_msg else None,
                    "last_message_time": (
                        latest_msg.created_at
                        if latest_msg else None
                    ),
                })

            # 1-to-1 chat
            else:

                other_user = conversation.members.exclude(
                    id=request.user.id
                ).only("id", "username").first()

                dm.append({
                    "conversation_id": conversation.id,
                    "user": other_user.username if other_user else None,
                    "last_message": latest_msg.content if latest_msg else None,
                    "last_message_time": (
                        latest_msg.created_at
                        if latest_msg else None
                    ),
                })

        return Response({
            "groups": groups,
            "dm": dm,
        })
        
        
        
class UserSearchAPIView(APIView):

    def get(self, request):
        query = request.query_params.get("q")
        
        users = User.objects.filter(
            username__icontains = query,
            company = request.user.company
        ).exclude(
            id=request.user.id
        )
        
        serializer = UserSerializers(users, many=True)
        
        return Response(
            serializer.data
        )
        
class DirectConversationAPIView(APIView):
    
    def post(self,request):
        
        #validate input
        serializer = DirectConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        #id of the person we wanna chat
        user_id = serializer.validated_data["user_id"]
        
        #find the user
        try:
            other_user = User.objects.get(
                id=user_id,
                company=request.user.company
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
            
        # Don't allow chatting with yourself
        if other_user.id == request.user.id:
            return Response(
                {"detail": "You cannot create a conversation with yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
         # Check whether DM already exists
        conversation = (
            Conversation.objects.filter(
                company = request.user.company,
                is_group = False,
                members = request.user
            )
            .filter(
                members=other_user,
            )
            .first()
        )
        
        if not conversation:
            
            conversation = Conversation.objects.create(
                company=request.user.company,
                is_group=False,
            )
            
            #create first then add
            #ek ya kuch users add karo
            conversation.members.add(
                request.user,
                other_user,
            )
            
        return Response({
            "conversation_id": conversation.id,
            "user_id": other_user.id,
            "username": other_user.username,
        })
        

class CreateGroupAPIView(APIView):
    
    def post(self,request):
        #request.data = upcoming data
        serializer = CreateGroupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        group_name = serializer.validated_data["name"]
        group_members = serializer.validated_data["members"]
        
        group_members = list(group_members)
        group_members.append(request.user)
        
        for member in group_members:
            if request.user.company != member.company:
                return Response(
                            {"detail": "You cannot add users from another company."},
                    status=status.HTTP_400_BAD_REQUEST,
                        )
             
        group = Conversation.objects.create(
        
            company=request.user.company,
             name = group_name,
            is_group=True
        )
                    
         # Many-to-many relation is added after conversation is saved
        group.members.set(group_members)
        
        return Response(
        {
            "conversation_id": group.id,
            "name": group.name,
            "is_group": group.is_group,
        },
        status=status.HTTP_201_CREATED
    )
        
        
class CompanyUsersAPIView(generics.ListAPIView):
    
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializers
    pagination_class = UserPagination
    
    def get_queryset(self):
        return User.objects.filter(
            company=self.request.user.company
            ).exclude(
                id=self.request.user.id
            ).order_by("id")