from django.urls import path
from .views import cancel_subscription, create_checkout_session, my_subscription, stripe_webhook, subscription_status

urlpatterns = [
    path("webhook/", stripe_webhook, name="stripe-webhook"),
    path("checkout/", create_checkout_session, name="create-checkout-session"),
    path("status/", subscription_status, name="subscription-status"),
    path("my-subscription/", my_subscription, name="my-subscription"),
    path("cancel/", cancel_subscription, name="cancel-subscription"),
]