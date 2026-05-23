from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models, transaction
from apps.products.models import Product
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer, OrderCreateSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """Order management - create, retrieve, list, update"""
    
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    search_fields = ['order_number']
    filterset_fields = ['status', 'payment_status']

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new order from cart items"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Return the created order details
        output_serializer = OrderSerializer(order, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        """
        Cancel an order (only if pending or confirmed)
        POST /api/v1/orders/{id}/cancel/
        """
        order = self.get_object()

        if order.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only cancel your own orders.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if order.status not in ['pending', 'confirmed']:
            return Response(
                {'error': f'Cannot cancel order with status "{order.status}". Only pending or confirmed orders can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            order.status = 'cancelled'
            order.save()

            # Restore product stock
            for item in order.items.all():
                Product.objects.filter(id=item.product_id).update(
                    stock_quantity=models.F('stock_quantity') + item.quantity
                )

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def create_from_cart(self, request):
        """
        Create order from cart items
        POST /api/v1/orders/create_from_cart/
        """
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            output_serializer = OrderSerializer(order, context={'request': request})
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderItemViewSet(viewsets.ReadOnlyModelViewSet):
    """Order items - read only"""
    
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]
