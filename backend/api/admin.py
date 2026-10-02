from django.contrib import admin
from .models import InspectionRecord


@admin.register(InspectionRecord)
class InspectionRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'class_label', 'confidence_score', 'latitude', 'longitude', 'created_at']
    list_filter = ['class_label', 'created_at']
    search_fields = ['class_label']
    readonly_fields = ['created_at']
