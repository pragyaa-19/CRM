from celery import Celery
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm.settings")
app = Celery("crm") #It's just like creating an object in Python.
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()