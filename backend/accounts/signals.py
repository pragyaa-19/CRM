from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User,Company
from .tasks import send_welcome_email,company_creation_email

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