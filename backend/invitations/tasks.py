from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Invitation
from django.utils import timezone

@shared_task()
def send_invitation_email(invitation_id):
    try:
        invitation = Invitation.objects.get(id=invitation_id)
    except Invitation.DoesNotExist:
        return
    
    if invitation.status != 'PENDING':
        return 
    
    
    try:
        invite_link = (f"http://localhost:5173/accept-invitation/{invitation.token}")
            
        send_mail(
        subject = f"Invitation to join {invitation.company.name}",
        message = f"""
            Hi,

            You have been invited to join {invitation.company.name} as a {invitation.role}.

            Click below to accept your invitation:

            {invite_link}

            This invitation expires on {invitation.expires_at:%Y-%m-%d}.

            Thanks,
            {invitation.company.name}""",
            from_email = settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invitation.email],
            fail_silently=False,
            )
        invitation.email_status = "sent" 
        invitation.email_sent_at = timezone.now() 
        invitation.email_error = None 
        invitation.save( update_fields=[ "email_status", "email_sent_at", "email_error", ] )
        return "Invitation email sent successfully"
    except Exception as error:
        invitation.email_status = "failed"
        invitation.email_error = str(error) 
        invitation.save( update_fields=[ "email_status", "email_error", ] ) # Tell Celery that the task failed raise