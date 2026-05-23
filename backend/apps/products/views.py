from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Value, IntegerField, Case, When
from .models import Category, Product, ProductMedia, ProductVariant
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductMediaSerializer, ProductVariantSerializer
)


class IsStaffOrReadOnly(permissions.BasePermission):
    """Allow staff to create/edit/delete, but everyone can read"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Product categories"""
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class ProductViewSet(viewsets.ModelViewSet):
    """Product listing, details, and management"""
    
    queryset = Product.objects.all()
    permission_classes = [IsStaffOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'wig_type', 'texture', 'is_featured', 'is_trending', 'is_new']
    search_fields = ['name', 'description', 'color', 'texture', 'wig_type', 'category__name', 'seo_keywords']
    ordering_fields = ['created_at', 'price', 'rating', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Annotate with relevance score for search results"""
        queryset = Product.objects.all()
        if self.action != 'list':
            return queryset
        search_query = self.request.query_params.get('search', '')
        if search_query:
            # Boost exact name matches and name-starting matches
            queryset = queryset.annotate(
                relevance=Case(
                    When(name__iexact=search_query, then=Value(5)),
                    When(name__istartswith=search_query, then=Value(3)),
                    When(name__icontains=search_query, then=Value(2)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
            ).order_by('-relevance', '-rating', '-created_at')
        return queryset
    
    @action(detail=False, methods=['get'])
    def search_suggestions(self, request):
        """
        Returns lightweight product suggestions for live search dropdown.
        Limited to top 6 results with minimal fields.
        """
        query = request.query_params.get('q', '').strip()
        if len(query) < 2:
            return Response([])
        
        products = Product.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(color__icontains=query) |
            Q(category__name__icontains=query)
        ).order_by('-rating', '-is_featured', '-created_at')[:6]
        
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return ProductDetailSerializer
        return ProductListSerializer
    
    def partial_update(self, request, *args, **kwargs):
        """Allow partial updates for staff users"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff can update products'},
                status=status.HTTP_403_FORBIDDEN
            )
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Allow full updates for staff users"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff can update products'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products"""
        products = Product.objects.filter(is_featured=True)[:8]
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending products"""
        products = Product.objects.filter(is_trending=True)[:8]
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Get new arrivals"""
        products = Product.objects.filter(is_new=True).order_by('-created_at')[:12]
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related products"""
        product = self.get_object()
        related = Product.objects.filter(
            Q(category=product.category) | Q(wig_type=product.wig_type)
        ).exclude(id=product.id)[:6]
        serializer = ProductListSerializer(related, many=True)
        return Response(serializer.data)


class ProductMediaViewSet(viewsets.ModelViewSet):
    """Product media management - supports file uploads and URLs"""
    
    queryset = ProductMedia.objects.all()
    serializer_class = ProductMediaSerializer
    permission_classes = [IsStaffOrReadOnly]
    filterset_fields = ['product', 'media_type']
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def create(self, request, *args, **kwargs):
        """Handle both file uploads and URL submissions"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ProductVariantViewSet(viewsets.ReadOnlyModelViewSet):
    """Product variants"""
    
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['product', 'color', 'size']
