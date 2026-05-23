from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['reference', 'order', 'amount', 'currency', 'provider', 'status', 'payment_method', 'paid_at', 'created_at']
    list_filter = ['provider', 'status', 'payment_method', 'created_at']
    search_fields = ['reference', 'order__order_number', 'transaction_id']
    readonly_fields = ['reference', 'transaction_id', 'paid_at', 'created_at', 'updated_at']
