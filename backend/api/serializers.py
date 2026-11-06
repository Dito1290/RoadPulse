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


class RegisterRequestSerializer(serializers.Serializer):
    """Pendaftaran akun pengguna biasa (bukan staff/admin)."""
    username = serializers.RegexField(
        r'^[A-Za-z0-9_.]+$', min_length=3, max_length=30,
        error_messages={
            'invalid': 'Username hanya boleh huruf, angka, titik, dan garis bawah.',
            'min_length': 'Username minimal 3 karakter.',
            'max_length': 'Username maksimal 30 karakter.',
            'required': 'Username wajib diisi.',
            'blank': 'Username wajib diisi.',
        },
    )
    password = serializers.CharField(write_only=True, error_messages={'required': 'Kata sandi wajib diisi.', 'blank': 'Kata sandi wajib diisi.'})
    password_confirm = serializers.CharField(write_only=True, error_messages={'required': 'Ulangi kata sandi.', 'blank': 'Ulangi kata sandi.'})

    def validate_username(self, value):
        from django.contrib.auth.models import User
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Username sudah dipakai. Coba yang lain.')
        return value

    def validate(self, attrs):
        from django.contrib.auth.models import User
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError
        from django.utils import translation

        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Kata sandi tidak sama.'})
        try:
            with translation.override('id'):
                validate_password(attrs['password'], user=User(username=attrs['username']))
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})
        return attrs


class RegisterResponseSerializer(LoginResponseSerializer):
    pass
