from rest_framework import viewsets, permissions
from .models import ShippingMethod, Shipment
from .serializers import ShippingMethodSerializer, ShipmentSerializer


class ShippingMethodViewSet(viewsets.ReadOnlyModelViewSet):
    """Shipping methods"""
    
    queryset = ShippingMethod.objects.filter(is_active=True)
    serializer_class = ShippingMethodSerializer
    permission_classes = [permissions.AllowAny]


class ShipmentViewSet(viewsets.ReadOnlyModelViewSet):
    """Shipment tracking"""
    
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Shipment.objects.all()
        return Shipment.objects.filter(order__user=self.request.user)
