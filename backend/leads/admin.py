from django.contrib import admin
from .models import Lead,Activity

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "contact_num", "company","status", "assigned_to", "is_deleted", "created_at", "updated_at")
admin.site.register(Activity)
