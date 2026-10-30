from django.db import models
from accounts.models import Company
# Create your models here.



class Subscription(models.Model):
    PLAN_CHOICES = [
    ("FREE", "Free"),
    ("PRO_MONTHLY", "Pro Monthly"),
    ("PRO_YEARLY", "Pro Yearly"),]

    STATUS_CHOICES = [
    ("INACTIVE", "Inactive"),
    ("PENDING", "Pending"),
    ("ACTIVE", "Active"),
    ("CANCELLED", "Cancelled"),
    ("PAST_DUE", "Past Due"),]
    
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE, 
        related_name='subscription'
        )

    plan = models.CharField(
    max_length=20,
    choices=PLAN_CHOICES,
    default="FREE"
)

    status = models.CharField(
    max_length=20,
    choices=STATUS_CHOICES,
    default="ACTIVE"
)
    
    stripe_customer_id = models.CharField(
    max_length=255,
    blank=True,
    null=True
)

    stripe_subscription_id = models.CharField(
    max_length=255,
    blank=True,
    null=True
)

    current_period_end = models.DateTimeField(
    blank=True,
    null=True
)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company.name} - {self.plan} ({self.status})"
