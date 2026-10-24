from .models import Notification


def create_notification(user, message, from_user=None):
    """
    Create a notification for a specific user.
    """

    return Notification.objects.create(
        user=user,
        message=message,
        from_user=from_user,
    )