from django.urls import path
from .views import AdminDashboardStatsView

app_name = 'dashboard'

urlpatterns = [
    path('stats/', AdminDashboardStatsView.as_view(), name='stats'),
]
