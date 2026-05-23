from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import ShippingMethodViewSet, ShipmentViewSet

app_name = 'shipping'

router = SimpleRouter()
router.register(r'methods', ShippingMethodViewSet, basename='method')
router.register(r'shipments', ShipmentViewSet, basename='shipment')

urlpatterns = [
    path('', include(router.urls)),
]
