from django.db import models


class Team(models.Model):
    name =  models.CharField(max_length=100)
    description = models.TextField(blank=True)
    company = models.ForeignKey("accounts.Company",on_delete=models.CASCADE)
    manager = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, related_name='managed_teams')
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   