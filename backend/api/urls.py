from django.urls import path
from .views import (
    ClassifyView,
    DashboardStatsView,
    InspectionHistoryView,
    InspectionMapView,
)

urlpatterns = [
    path('classify/', ClassifyView.as_view(), name='classify'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/history/', InspectionHistoryView.as_view(), name='dashboard-history'),
    path('dashboard/map/', InspectionMapView.as_view(), name='dashboard-map'),
]
