"""
URL configuration for roadpulse project.
"""
from django.contrib import admin
from django.urls import path, include
from django.db import connection
from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


def api_root(request):
    return render(request, 'api/root.html')


def privacy(request):
    return render(request, 'api/privacy.html', {
        'contact_email': settings.PRIVACY_CONTACT_EMAIL,
        'effective_date': settings.PRIVACY_EFFECTIVE_DATE,
    })


def healthz(_request):
    """Dipakai Docker/monitoring: 200 bila Django dan database siap."""
    try:
        connection.ensure_connection()
    except Exception:  # noqa: BLE001 — health check tidak boleh melempar error
        return JsonResponse({'status': 'error', 'database': False}, status=503)
    return JsonResponse({'status': 'ok', 'database': True})


urlpatterns = [
    path('', api_root, name='api-root'),
    path('privacy/', privacy, name='privacy'),
    path('healthz/', healthz, name='healthz'),
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/v1/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
