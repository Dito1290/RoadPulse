from rest_framework import serializers
from .models import InspectionRecord


class InspectionRecordSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = InspectionRecord
        fields = ['id', 'class_label', 'confidence_score', 'image_url',
              'latitude', 'longitude', 'location_name', 'captured_at', 'created_at']
        read_only_fields = ['class_label', 'confidence_score', 'created_at']
    
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
