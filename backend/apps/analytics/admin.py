from django.contrib import admin
from .models import Analytics, PageView, ProductView


@admin.register(Analytics)
class AnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_revenue', 'total_orders', 'unique_customers', 'avg_order_value']
    list_filter = ['date']
    readonly_fields = ['date']


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ['page', 'created_at']
    list_filter = ['page', 'created_at']
    search_fields = ['page']
    readonly_fields = ['created_at']


@admin.register(ProductView)
class ProductViewAdmin(admin.ModelAdmin):
    list_display = ['product', 'duration', 'created_at']
    list_filter = ['product', 'created_at']
    search_fields = ['product__name']
    readonly_fields = ['created_at']
