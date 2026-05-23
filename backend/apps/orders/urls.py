from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import OrderViewSet, OrderItemViewSet

app_name = 'orders'

router = SimpleRouter()
router.register(r'', OrderViewSet, basename='order')
router.register(r'items', OrderItemViewSet, basename='order-item')

urlpatterns = [
    path('', include(router.urls)),
]
