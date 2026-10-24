from django.db import models
from django.conf import settings

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.SET_NULL,
                                  null=True,
                                  blank=True,
                                  related_name='sent_notifications')
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.message