from rest_framework import serializers
from .models import Analytics, PageView, ProductView


class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = [
            'id', 'total_revenue', 'total_orders', 'total_products_sold',
            'unique_customers', 'avg_order_value', 'date'
        ]


class PageViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageView
        fields = ['id', 'page', 'referrer', 'created_at']


class ProductViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductView
        fields = ['id', 'product', 'duration', 'created_at']
