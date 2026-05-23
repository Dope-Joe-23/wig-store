from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q

from apps.products.models import Product
from apps.orders.models import Order
from apps.payments.models import Payment

User = get_user_model()


class AdminDashboardStatsView(APIView):
    """Admin dashboard statistics endpoint"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Check if user is staff
        if not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to access this resource.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Calculate statistics
        total_users = User.objects.count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        
        # Total revenue from completed payments
        total_revenue = Payment.objects.filter(
            status='completed'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Pending orders
        pending_orders = Order.objects.filter(
            status__in=['pending', 'confirmed', 'processing']
        ).count()
        
        # Low stock products (less than 10 units)
        low_stock_products = Product.objects.filter(
            stock_quantity__lt=10
        ).count()
        
        return Response({
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_revenue': str(total_revenue),
            'pending_orders': pending_orders,
            'low_stock_products': low_stock_products,
        })
