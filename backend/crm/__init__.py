from .celery import app as celery_app

__all__ = ("celery_app",) #"If someone imports everything from this package (from crm import *), only export celery_app."