from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User,Company
from .tasks import send_welcome_email,company_creation_email

from django.urls import reverse
from django.core.mail import send_mail
from django_rest_passwordreset.signals import reset_password_token_created


@receiver(post_save,sender=User)
def user_created(sender, instance, created, **kwargs):
    if created:
        send_welcome_email.delay(instance.id) 
        #  queues the task for Celery to execute.
        # .delay() Sends the task to the redis then
        #  Celery pick up the task
        #  to do the task in bg

@receiver(post_save,sender=Company)
def company_created(sender,instance,created,**kwargs):
    if created:
        company_creation_email.delay(instance.id)
        
        
    

@receiver(reset_password_token_created)
def password_reset_token_created(
    sender, instance, reset_password_token, *args, **kwargs
):
    email_plaintext_message = (
        "Click the link below to reset your password:\n"
        "http://localhost:5173/password-reset/confirm/"
        f"{reset_password_token.key}"
    )

    send_mail(
        subject="Password Reset Request for Your Account",
        message=email_plaintext_message,
        from_email=None,  # Uses DEFAULT_FROM_EMAIL from settings.py
        recipient_list=[reset_password_token.user.email],
        fail_silently=False,
    )