from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid
from accounts.models import Company,User

class Invitation(models.Model):
    STATUS_CHOICES = [
        ("ACCEPTED","accepted"),
        ("PENDING","pending"),
        ("EXPIRED","expired"),
        ("CANCELLED","cancelled"),]
    
    
    EMAIL_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("failed", "Failed"),
    ]
    email = models.EmailField()
    
    email_status = models.CharField(
        max_length=10,
        choices=EMAIL_STATUS_CHOICES,
        default="pending",
    )

    email_sent_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    email_error = models.TextField(
        null=True,
        blank=True,
    )

    company = models.ForeignKey(Company,
            on_delete=models.CASCADE,
            related_name="invitations")
    
    role = models.CharField(
        max_length=20,
        choices=User.ROLE_CHOICES
        )
    
    invited_by = models.ForeignKey(
        User,
        on_delete = models.CASCADE,
        related_name="sent_invitations")
    
    token = models.UUIDField(
        default=uuid.uuid4,
        unique= True,
        editable=False
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING")
    
    created_at =  models.DateField(auto_now_add=True)
    expires_at = models.DateField()
    accepted_at = models.DateTimeField(
        null=True,
        blank=True
    )
    
    def save(self,*args,**kwrgs):
        
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        
        super().save(*args,**kwrgs)
        
    def __str__(self):
        return f"{self.email} - {self.status}"                        
