
from importlib import metadata

import stripe
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY
from datetime import datetime

from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Subscription


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    plan = request.data.get("plan")

    price_ids = {
        "PRO_MONTHLY": settings.STRIPE_MONTHLY_PRICE_ID,
        "PRO_YEARLY": settings.STRIPE_YEARLY_PRICE_ID,
    }

    if plan not in price_ids:
        return Response(
            {"error": "Invalid subscription plan."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    price_id = price_ids[plan]

    if not price_id:
        return Response(
            {"error": "Price ID is not configured."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    company_id = request.user.company_id

    if not company_id:
        return Response(
            {"error": "Your account is not associated with a company."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Prevent creating a second Checkout Session for an already
    # active paid subscription.
    existing_subscription = Subscription.objects.filter(
        company_id=company_id,
        status="ACTIVE",
    ).exclude(
        stripe_subscription_id__isnull=True,
    ).exclude(
        stripe_subscription_id="",
    ).first()

    if existing_subscription:
        return Response(
            {"error": "Your company already has an active subscription."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            success_url=(
                "http://localhost:5173/subscription/success"
                "?session_id={CHECKOUT_SESSION_ID}"
            ),
            cancel_url="http://localhost:5173/pricing",
            client_reference_id=str(company_id),
            metadata={
                "company_id": str(company_id),
                "plan": plan,
            },
            subscription_data={
                "metadata": {
                    "company_id": str(company_id),
                    "plan": plan,
                }
            },
        )

        return Response({"checkout_url": session.url})

    except Exception as e:
        print("Stripe checkout error:", repr(e))

        return Response(
        {"error": "Could not create checkout session"},
        status=400,
    )

#print("Django key loaded:", bool(settings.STRIPE_SECRET_KEY))
#print("Stripe SDK key loaded:", bool(stripe.api_key))
@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    signature = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=settings.STRIPE_WEBHOOK_SECRET,
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    event_type = event["type"]
    data = event["data"]["object"].to_dict()

    # 1. Checkout completed.
    if event_type == "checkout.session.completed":
        
        company_id = data.get("metadata", {}).get("company_id")
        plan = data.get("metadata", {}).get("plan")
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")

        if (
            not company_id
            or plan not in ["PRO_MONTHLY", "PRO_YEARLY"]
            or not subscription_id
        ):
            return HttpResponse(status=400)

        # Do not overwrite ACTIVE with PENDING when Stripe retries
        # or delivers events in an unexpected order.
        subscription, created = Subscription.objects.get_or_create(
            company_id=company_id,
            defaults={
                "plan": plan,
                "status": "PENDING",
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": subscription_id,
            },
        )

        if not created:
            # Update the existing record only when it belongs to
            # this Stripe subscription or has no Stripe subscription ID.
            if (
                subscription.stripe_subscription_id == subscription_id
                or not subscription.stripe_subscription_id
                or subscription.status in ["CANCELLED", "INACTIVE"]
                ):
                subscription.stripe_customer_id = customer_id
                subscription.stripe_subscription_id = subscription_id
                subscription.plan = plan

                # Preserve ACTIVE if an earlier event already activated it.
                if subscription.status != "ACTIVE":
                    subscription.status = "PENDING"

                subscription.save(
                    update_fields=[
                        "stripe_customer_id",
                        "stripe_subscription_id",
                        "plan",
                        "status",
                        "updated_at",
                    ]
                )

    # 2. Successful invoice payment.
    elif event_type == "invoice.paid":
        subscription_id = data.get("subscription")

        if not subscription_id:
            parent = data.get("parent") or {}
            details = parent.get("subscription_details") or {}
            subscription_id = details.get("subscription")

        if subscription_id:
            Subscription.objects.filter(
        stripe_subscription_id=subscription_id,
    ).exclude(
        status="CANCELLED",
    ).update(status="ACTIVE")

    # 3. Failed invoice payment.
    elif event_type == "invoice.payment_failed":
        subscription_id = data.get("subscription")

        if not subscription_id:
            parent = data.get("parent") or {}
            details = parent.get("subscription_details") or {}
            subscription_id = details.get("subscription")

        if subscription_id:
            Subscription.objects.filter(
                stripe_subscription_id=subscription_id,
            ).exclude(
                status="CANCELLED",
            ).update(status="PAST_DUE")

    # 4. Subscription actually deleted/cancelled.
    elif event_type == "customer.subscription.deleted":
        subscription_id = data.get("id")

        Subscription.objects.filter(
            stripe_subscription_id=subscription_id,
        ).update(
            status="CANCELLED",
        )

    # 5. Subscription status changed.
    elif event_type == "customer.subscription.updated":
        subscription_id = data.get("id")
        stripe_status = data.get("status")

        status_mapping = {
            "active": "ACTIVE",
            "past_due": "PAST_DUE",
            "canceled": "CANCELLED",
            "unpaid": "PAST_DUE",
            "incomplete": "PENDING",
            "incomplete_expired": "INACTIVE",
            "paused": "INACTIVE",
        }

        updates = {}

        if stripe_status in status_mapping:
            updates["status"] = status_mapping[stripe_status]

        period_end = data.get("current_period_end")

        if period_end:
            updates["current_period_end"] = datetime.fromtimestamp(
                period_end,
                tz=timezone.get_current_timezone(),
            )

        if updates and subscription_id:
            Subscription.objects.filter(
                stripe_subscription_id=subscription_id,
            ).update(**updates)

    return HttpResponse(status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def subscription_status(request):
    session_id = request.query_params.get("session_id")

    if not session_id:
        return Response(
            {"error": "Session ID is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # 1. Retrieve and verify the Checkout Session.
        session = stripe.checkout.Session.retrieve(session_id)
        session_data = session.to_dict()

        company_id = request.user.company_id
        metadata = session_data.get("metadata") or {}

        session_company_id = (
            metadata.get("company_id")
            or session_data.get("client_reference_id")
        )

        if str(session_company_id) != str(company_id):
            return Response(
                {"error": "This checkout session does not belong to your company."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 2. Verify successful checkout and payment.
        if session_data.get("status") != "complete":
            return Response({
                "status": "PENDING",
                "message": "Checkout has not completed yet.",
            })

        if session_data.get("payment_status") not in [
            "paid",
            "no_payment_required",
        ]:
            return Response({
                "status": "PENDING",
                "message": "Payment confirmation is pending.",
            })

        stripe_subscription_id = session_data.get("subscription")

        if not stripe_subscription_id:
            return Response({
                "status": "PENDING",
                "message": "Stripe subscription ID is missing.",
            })

        # 3. Verify the actual Stripe subscription status.
        stripe_subscription = stripe.Subscription.retrieve(
            stripe_subscription_id
        )
        stripe_subscription_data = stripe_subscription.to_dict()

        stripe_status = stripe_subscription_data.get("status")

        status_mapping = {
            "active": "ACTIVE",
            "trialing": "ACTIVE",
            "past_due": "PAST_DUE",
            "unpaid": "PAST_DUE",
            "canceled": "CANCELLED",
            "incomplete": "PENDING",
            "incomplete_expired": "INACTIVE",
            "paused": "INACTIVE",
        }

        local_status = status_mapping.get(stripe_status, "PENDING")

        # 4. Determine the plan from trusted Checkout Session metadata.
        plan = metadata.get("plan")

        if plan not in ["PRO_MONTHLY", "PRO_YEARLY"]:
            return Response(
                {"error": "Invalid subscription plan in checkout metadata."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 5. Create or update the company's subscription.
        # Do not overwrite a different active Stripe subscription.
        existing_subscription = Subscription.objects.filter(
            company_id=company_id
        ).first()

        if (
            existing_subscription
            and existing_subscription.stripe_subscription_id
            and existing_subscription.stripe_subscription_id
                != stripe_subscription_id
            and existing_subscription.status == "ACTIVE"
        ):
            return Response(
                {
                    "error": (
                        "Your company already has a different active "
                        "subscription. Please review it before changing plans."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )

        subscription, created = Subscription.objects.update_or_create(
            company_id=company_id,
            defaults={
                "plan": plan,
                "status": local_status,
                "stripe_customer_id": session_data.get("customer"),
                "stripe_subscription_id": stripe_subscription_id,
                
            },
        )

        # 6. Return the confirmed database state.
        return Response({
            "plan": subscription.plan,
            "status": subscription.status,
            "message": (
                "Subscription confirmed."
                if subscription.status == "ACTIVE"
                else "Payment verified, but subscription is not active yet."
            ),
        })

    except stripe.StripeError as e:
        print("Stripe subscription verification error:", repr(e))
        return Response(
            {"error": "Unable to verify the checkout session."},
            status=status.HTTP_502_BAD_GATEWAY,
        )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_subscription(request):
    subscription = Subscription.objects.filter(
        company=request.user.company,
    ).first()

    if not subscription:
        return Response({
            "plan": "FREE",
            "status": "ACTIVE",
            "message": "You are using the Free plan.",
            "has_stripe_subscription": False,
            "cancel_at_period_end": False,
            "current_period_end": None,
        })

    cancel_at_period_end = False

    if subscription.stripe_subscription_id:
        try:
            stripe_subscription = stripe.Subscription.retrieve(
                subscription.stripe_subscription_id
            )

            # Stripe Subscription is an object, not a dictionary.
            cancel_at_period_end = bool(
                stripe_subscription.cancel_at_period_end
            )

        except stripe.StripeError:
            return Response(
                {
                    "error": "Unable to retrieve subscription details from Stripe."
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

    return Response({
        "plan": subscription.plan,
        "status": subscription.status,
        "current_period_end": subscription.current_period_end,
        "has_stripe_subscription": bool(
            subscription.stripe_subscription_id
        ),
        "cancel_at_period_end": cancel_at_period_end,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    subscription = Subscription.objects.filter(
        company=request.user.company,
    ).first()

    if not subscription or not subscription.stripe_subscription_id:
        return Response(
            {"error": "No paid subscription found."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if subscription.status == "CANCELLED":
        return Response(
            {"message": "Subscription is already cancelled."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        stripe_subscription = stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            cancel_at_period_end=True,
        )

        # Stripe Subscription is an object, not a dictionary.
        period_end = stripe_subscription.current_period_end

        current_period_end = (
            datetime.fromtimestamp(
                period_end,
                tz=timezone.get_current_timezone(),
            )
            if period_end
            else subscription.current_period_end
        )

        # Save the billing period end in the database.
        subscription.current_period_end = current_period_end
        subscription.save(update_fields=["current_period_end"])

        return Response({
            "message": (
                "Your subscription will be cancelled at the end "
                "of the current billing period."
            ),
            "cancel_at_period_end": bool(
                stripe_subscription.cancel_at_period_end
            ),
            "current_period_end": (
                current_period_end.isoformat()
                if current_period_end
                else None
            ),
        }, status=status.HTTP_200_OK)

    except stripe.StripeError as exc:
        print("Stripe cancellation error:", str(exc))

        return Response(
            {"error": "Unable to cancel subscription. Please try again."},
            status=status.HTTP_502_BAD_GATEWAY,
        )
