"""
URL configuration for roadpulse project.
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


def api_root(request):
    return JsonResponse({
        "message": "RoadPulse API is running",
        "endpoints": {
            "classify": "/api/v1/classify/",
            "dashboard_stats": "/api/v1/dashboard/stats/",
            "dashboard_history": "/api/v1/dashboard/history/",
            "dashboard_map": "/api/v1/dashboard/map/",
        },
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/v1/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
