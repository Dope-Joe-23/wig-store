from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Payment(models.Model):
    """Payment records"""
    
    PAYMENT_METHOD_CHOICES = [
        ('card', 'Card'),
        ('mobile_money', 'Mobile Money'),
        ('mtn_momo', 'MTN Mobile Money'),
        ('telecel_momo', 'Telecel Mobile Money'),
        ('airteltigo_momo', 'AirtelTigo Money'),
        ('bank_transfer', 'Bank Account Transfer'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='payments')
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='GHS')
    provider = models.CharField(max_length=50, default='paystack')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    transaction_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    reference = models.CharField(max_length=255, unique=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    
    # Ghana Mobile Money specific fields
    phone_number = models.CharField(max_length=20, blank=True, null=True)  # Momo phone
    network_operator = models.CharField(max_length=20, blank=True, null=True)  # MTN, Telecel, etc
    
    # Bank transfer specific fields
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    account_name = models.CharField(max_length=255, blank=True, null=True)
    
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments_payment'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reference']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Payment {self.reference} - {self.get_payment_method_display()}"
