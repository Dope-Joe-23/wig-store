from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CategoryViewSet, ProductViewSet, ProductMediaViewSet, ProductVariantViewSet

app_name = 'products'

router = SimpleRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'media', ProductMediaViewSet, basename='media')
router.register(r'variants', ProductVariantViewSet, basename='variant')

urlpatterns = [
    path('', include(router.urls)),
]
