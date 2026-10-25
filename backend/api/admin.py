from django.contrib import admin
from . import models

# Otomatis mendaftarkan semua model yang ada di api/models.py ke Django Admin
for model in models.__dict__.values():
    if isinstance(model, type) and issubclass(model, models.models.Model):
        try:
            admin.site.register(model)
        except admin.sites.AlreadyRegistered:
            pass