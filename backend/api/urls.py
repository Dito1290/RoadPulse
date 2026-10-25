from django.urls import path
from .views import (
    ClassifyView,
    DashboardStatsView,
    InspectionHistoryView,
    InspectionMapView,
    LoginView,
    api_v1_root,
)

urlpatterns = [
    path('', api_v1_root, name='api-v1-root'),
    path('classify/', ClassifyView.as_view(), name='classify'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/history/', InspectionHistoryView.as_view(), name='dashboard-history'),
    path('dashboard/map/', InspectionMapView.as_view(), name='dashboard-map'),
    path('auth/login/', LoginView.as_view(), name='login'),
]
