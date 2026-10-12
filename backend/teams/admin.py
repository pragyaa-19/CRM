from django.contrib import admin
from .models import Team

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "company", "manager", "member_count","created_on", "updated_on")

    def member_count(self, obj):
        return obj.members.count()

    member_count.short_description = "Members"