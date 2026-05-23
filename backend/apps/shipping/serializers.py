from rest_framework import serializers
from .models import ShippingMethod, Shipment


class ShippingMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingMethod
        fields = ['id', 'name', 'description', 'cost', 'estimated_days']


class ShipmentSerializer(serializers.ModelSerializer):
    shipping_method = ShippingMethodSerializer(read_only=True)
    
    class Meta:
        model = Shipment
        fields = [
            'id', 'order', 'shipping_method', 'status', 'tracking_number',
            'shipped_at', 'delivered_at', 'created_at'
        ]
        read_only_fields = ['id', 'order', 'created_at', 'updated_at']
