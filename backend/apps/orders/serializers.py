from django.db import models, transaction
from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()


class UserBriefSerializer(serializers.ModelSerializer):
    """Minimal user details for orders"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone']
        read_only_fields = fields


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserBriefSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'status', 'payment_status',
            'payment_reference', 'subtotal',
            'shipping_cost', 'tax', 'total', 'items', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'payment_status', 'payment_reference',
            'created_at', 'updated_at'
        ]


class CartItemInputSerializer(serializers.Serializer):
    """Serializer for cart items input during order creation"""
    id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders from cart"""
    cart_items = CartItemInputSerializer(many=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    tax = serializers.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def create(self, validated_data):
        user = self.context['request'].user
        cart_items = validated_data.pop('cart_items')
        
        # Generate order number
        from django.utils import timezone
        import uuid
        order_number = f"ORD-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

        # Transaction ensures stock validation + decrement are atomic,
        # preventing overselling under concurrent requests
        with transaction.atomic():
            # --- Validate stock BEFORE creating anything ---
            products_to_update = []  # (product, quantity, unit_price)
            for item in cart_items:
                try:
                    product = Product.objects.select_for_update().get(id=item['id'])
                except Product.DoesNotExist:
                    raise serializers.ValidationError(f"Product with id {item['id']} not found")

                if product.stock_quantity < item['quantity']:
                    raise serializers.ValidationError(
                        f"Insufficient stock for '{product.name}': requested {item['quantity']}, available {product.stock_quantity}"
                    )
                products_to_update.append((product, item['quantity'], item['price']))

            # Create order
            order = Order.objects.create(
                user=user,
                order_number=order_number,
                subtotal=validated_data['subtotal'],
                tax=validated_data['tax'],
                shipping_cost=validated_data['shipping_cost'],
                total=validated_data['total'],
                notes=validated_data.get('notes', ''),
                status='pending',
                payment_status='pending',
            )

            # Create order items and decrement stock
            for product, qty, unit_price in products_to_update:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price=unit_price,
                )
                Product.objects.filter(id=product.id).update(
                    stock_quantity=models.F('stock_quantity') - qty
                )

        return order
