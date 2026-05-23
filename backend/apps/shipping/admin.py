from django.contrib import admin
from .models import ShippingMethod, Shipment


@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'cost', 'estimated_days', 'is_active']
    list_filter = ['is_active']


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'tracking_number', 'shipped_at', 'delivered_at']
    list_filter = ['status', 'shipped_at', 'delivered_at']
    search_fields = ['order__order_number', 'tracking_number']
