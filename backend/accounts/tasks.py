from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import User,Company

#@shared_task
#Registers a function as a Celery task
@shared_task
def send_welcome_email(user_id):
    user = User.objects.get(id=user_id)

    send_mail(
        subject="Welcome to our CRM",
        message=f"""
Hi {user.first_name},

Welcome to our CRM!

Your account has been successfully created.

You can now log in and start using the CRM.

Best regards,
CRM Team
""",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        fail_silently=False,
    )
    
@shared_task
def company_creation_email(company_id):
    company = Company.objects.get(id=company_id)
    
    owner = User.objects.get(company=company,
                             role="owner")
    
    send_mail(
        subject="Welcome TO CRM ",
        message=f"""
        
        
        Hii {owner.username}, Congrats!!!!
        
        Welcome to the CRM,
        Your Company has been Registered Successfully!
        Now you can Manage your Relations Easily
        
        Best regards,
        CRM Team
        """,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[owner.email],
        fail_silently=False,
        
    )
        