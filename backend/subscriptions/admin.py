from django.contrib import admin
from .models import Subscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('company', 'plan', 'status', 'stripe_customer_id', 'stripe_subscription_id', 'current_period_end', 'created_at', 'updated_at')
    list_filter = ('plan', 'status')
    search_fields = ('company__name', 'stripe_customer_id', 'stripe_subscription_id')
