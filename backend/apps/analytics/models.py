from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Analytics(models.Model):
    """Store-wide analytics"""
    
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_orders = models.PositiveIntegerField(default=0)
    total_products_sold = models.PositiveIntegerField(default=0)
    unique_customers = models.PositiveIntegerField(default=0)
    
    avg_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    date = models.DateField(auto_now_add=True, unique=True)
    
    class Meta:
        db_table = 'analytics_analytics'
        ordering = ['-date']
    
    def __str__(self):
        return f"Analytics for {self.date}"


class PageView(models.Model):
    """Page view tracking"""
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    page = models.CharField(max_length=255)
    referrer = models.CharField(max_length=255, blank=True)
    
    user_agent = models.TextField(blank=True)
    ip_address = models.CharField(max_length=45, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_page_view'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.page} - {self.created_at}"


class ProductView(models.Model):
    """Product view tracking"""
    
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    duration = models.PositiveIntegerField(default=0)  # in seconds
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_product_view'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.product.name} viewed"
