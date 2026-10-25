from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import InspectionRecord


class InspectionRecordSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = InspectionRecord
        fields = ['id', 'class_label', 'confidence_score', 'image_url',
              'latitude', 'longitude', 'location_name', 'captured_at', 'created_at']
        read_only_fields = ['class_label', 'confidence_score', 'created_at']
    
    @extend_schema_field(serializers.URLField(allow_null=True))
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


class ClassifyRequestSerializer(serializers.Serializer):
    image = serializers.ImageField(required=True)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    location_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    captured_at = serializers.DateTimeField(required=False, allow_null=True)


class LoginRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class LoginResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    username = serializers.CharField()


class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField()


class DashboardStatsResponseSerializer(serializers.Serializer):
    total_inspections = serializers.IntegerField()
    class_distribution = serializers.DictField(child=serializers.IntegerField())
    recent_inspections = InspectionRecordSerializer(many=True)


class InspectionHistoryResponseSerializer(serializers.Serializer):
    results = InspectionRecordSerializer(many=True)
    page = serializers.IntegerField()
    total_pages = serializers.IntegerField()
    total_records = serializers.IntegerField()


class InspectionMapPointSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    class_label = serializers.CharField()
    confidence_score = serializers.FloatField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    location_name = serializers.CharField()
    captured_at = serializers.DateTimeField(allow_null=True)
    created_at = serializers.DateTimeField()
