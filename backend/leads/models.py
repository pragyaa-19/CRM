from django.db import models
from accounts.models import User,Company
from django.db.models import Q
from django.core.exceptions import ValidationError

class Lead(models.Model):
    STATUS_CHOICES = [
    ("new", "New"),
    ("called", "Called"),
    ("interested", "Interested"),
    ("lost", "Lost"),
    ("won", "Won"),]
    
    company = models.ForeignKey(Company,on_delete=models.PROTECT)
    assigned_to = models.ForeignKey(User,on_delete=models.SET_NULL,null=True)
    name = models.CharField(max_length=50)
    status =models.CharField(choices=STATUS_CHOICES,max_length=10)
    contact_num = models.CharField(max_length=12,blank=True)
    email = models.EmailField(blank=True)
    created_at =  models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    
    def clean(self):
        # Enforce that at least one of the fields is provided
        if not self.email and not self.contact_num:
            raise ValidationError("You must provide either an email or a phone number.")
        
        super().clean()

    
class Activity(models.Model):

    ACTIVITY_TYPES = [
        ("created", "Created"),
        ("called", "Called"),
        ("follow_up", "Follow Up"),
        ("status_changed", "Status Changed"),
        ("updated", "Updated"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE
    )

    activity_type = models.CharField(
        max_length=20,
        choices=ACTIVITY_TYPES
    )

    called_on = models.DateTimeField(null=True, blank=True)
    follow_up = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    


