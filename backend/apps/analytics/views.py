from rest_framework import viewsets, permissions
from .models import Analytics, PageView, ProductView
from .serializers import AnalyticsSerializer, PageViewSerializer, ProductViewSerializer


class AnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """Analytics overview"""
    
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer
    permission_classes = [permissions.IsAdminUser]


class PageViewViewSet(viewsets.ModelViewSet):
    """Page views tracking"""
    
    queryset = PageView.objects.all()
    serializer_class = PageViewSerializer
    permission_classes = [permissions.AllowAny]


class ProductViewViewSet(viewsets.ModelViewSet):
    """Product views tracking"""
    
    queryset = ProductView.objects.all()
    serializer_class = ProductViewSerializer
    permission_classes = [permissions.AllowAny]
