from django.db import models
from django.contrib.auth.models import AbstractUser
from teams.models import Team


class Company(models.Model):
    name = models.CharField(max_length=200)
    created_at = models.DateField(auto_now_add=True)
    address = models.CharField(max_length=250,blank=True)
    is_active = models.BooleanField(default=True)
    using_teams = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = [
    ("owner", "Owner"),
    ("manager", "Manager"),
    ("employee", "Employee"),
] 
    company = models.ForeignKey(Company,on_delete=models.PROTECT,null=True,
    blank=True,)
    role = models.CharField(choices=ROLE_CHOICES,max_length=10)
    team = models.ForeignKey("teams.Team", on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    
    
