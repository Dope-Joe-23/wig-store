from decimal import Decimal

from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'user', 'amount', 'currency', 'provider', 'payment_method',
            'payment_method_display', 'status', 'status_display', 'transaction_id',
            'reference', 'phone_number', 'network_operator', 'paid_at', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = fields


class PaymentInitializeSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    payment_method = serializers.ChoiceField(
        choices=['card', 'mobile_money', 'mtn_momo', 'telecel_momo', 'airteltigo_momo'],
        required=False,
        default='mobile_money',
    )


class PaymentInitializeResponseSerializer(serializers.Serializer):
    authorization_url = serializers.URLField()
    reference = serializers.CharField()


class PaymentVerificationSerializer(serializers.Serializer):
    reference = serializers.CharField()
    status = serializers.CharField()
    order_id = serializers.IntegerField()
    order_number = serializers.CharField()
    payment_status = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
