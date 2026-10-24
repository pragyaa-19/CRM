from django.db.models.signals import pre_save, post_save, m2m_changed
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from accounts.models import User
from leads.models import Lead
from messanger.models import Message,Conversation
from notification.services import create_notification


@receiver(pre_save, sender=Lead)
def track_previous_assignee(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_assigned_to_id = None
        return

    try:
        previous_lead = Lead.objects.get(pk=instance.pk)
        instance._previous_assigned_to_id = previous_lead.assigned_to_id
    except Lead.DoesNotExist:
        instance._previous_assigned_to_id = None


@receiver(post_save, sender=Lead)
def create_lead_assignment_notification(sender, instance, created, **kwargs):
    previous_assignee_id = getattr(
        instance, "_previous_assigned_to_id", None
    )

    new_assignee = instance.assigned_to

    if new_assignee is None:
        return

    # New lead assigned to an employee
    if created:
        create_notification(
            user=new_assignee,
            message=f'A new lead, "{instance.name}", has been assigned to you.',
            
        )
        return

    # Existing lead reassigned to another employee
    if previous_assignee_id != new_assignee.id:
        create_notification(
            user=new_assignee,
            message=f'The lead, "{instance.name}", has been assigned to you.',
        )
        
@receiver(post_save, sender=Message)
def create_message_notification(sender, instance,created, **kwargs):
    if not created:
        return
    
    #print("MESSAGE SIGNAL TRIGGERED")
    #print("Sender:", instance.sender)
    #print("Receiver:", instance.conversation.members.exclude(id=instance.sender.id).first())
    
    channel_layer = get_channel_layer()
    
    recipients = instance.conversation.members.exclude(
        id=instance.sender.id
        )
    
    for recipient in recipients:
        notification = create_notification(
            user=recipient,
            message=f'You have received a new message from {instance.sender.username}.',
            from_user=instance.sender
        )
    async_to_sync(channel_layer.group_send)(
    f"user_notifications_{recipient.id}",
            {
                "type": "send_notification",
                "notification": {
                    "id": notification.id,
                    "message": notification.message,
                    "from_user": instance.sender.id,
                    "created_at": notification.created_at.isoformat(),
                    "is_read": notification.is_read,
                    "is_deleted": notification.is_deleted,
                },
            },
        )
    
@receiver(m2m_changed, sender=Conversation.members.through)
def create_group_notification(sender, instance, action, pk_set, **kwargs):
    if action != "post_add":
        return

    if not instance.is_group:
        return

    from accounts.models import User

    members = User.objects.filter(id__in=pk_set).exclude(id=instance.id)

    for member in members:
        create_notification(
            user=member,
            message=f'You have been added to the group "{instance.name}".',
        )
    
@receiver(post_save, sender=Lead)
def create_lead_notification(sender, instance, created, **kwargs):
    if not created:
        return 
    
    company_members = User.objects.filter(
        company=instance.company,
        role__in=["employee",  "manager"]
    )
    
    for member in company_members:
        
        create_notification(
            user=member,
            message=f'we have created a new lead, "{instance.name}".',
        
        )