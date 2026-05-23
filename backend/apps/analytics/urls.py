from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyticsViewSet, PageViewViewSet, ProductViewViewSet

app_name = 'analytics'

router = DefaultRouter()
router.register(r'overview', AnalyticsViewSet, basename='overview')
router.register(r'page-views', PageViewViewSet, basename='page-view')
router.register(r'product-views', ProductViewViewSet, basename='product-view')

urlpatterns = [
    path('', include(router.urls)),
]
