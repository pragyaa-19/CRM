from django.contrib import admin
from . models import User,Company


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id","username","team", "email", "company", "first_name", "last_name","role", "is_active", "is_staff", "is_superuser")
    
@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "is_active", "created_at")
    search_fields = ("name",)
    list_filter = ("is_active",)
    ordering = ("name",)
    fields = ("name", "address", "is_active")
    readonly_fields = ("created_at",)

    
