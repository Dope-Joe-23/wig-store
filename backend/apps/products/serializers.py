from rest_framework import serializers
from .models import Category, Product, ProductMedia, ProductVariant


class ProductMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    file = serializers.FileField(required=False, allow_null=True)
    
    class Meta:
        model = ProductMedia
        fields = ['id', 'product', 'media_type', 'file', 'url', 'alt_text', 'is_primary', 'order']
    
    def get_url(self, obj):
        """Return the actual URL (file or external)"""
        return obj.get_url()
    
    def to_representation(self, instance):
        """Override to ensure file is not included in response, only url"""
        ret = super().to_representation(instance)
        # Remove file from response, use url instead
        ret.pop('file', None)
        return ret


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'color', 'size', 'sku', 'price_adjustment', 'stock']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product lists"""
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    current_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'sale_price', 'current_price',
            'category', 'color', 'length', 'primary_image', 'rating',
            'review_count', 'stock_quantity', 'is_featured', 'is_trending', 'is_new'
        ]
    
    def get_primary_image(self, obj):
        primary = obj.media.filter(is_primary=True).first()
        if primary:
            return ProductMediaSerializer(primary).data
        media = obj.media.first()
        if media:
            return ProductMediaSerializer(media).data
        return None
    
    def get_current_price(self, obj):
        return str(obj.get_price())


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full product details with write capability for staff"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    media = ProductMediaSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    current_price = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'category_id', 'wig_type',
            'texture', 'price', 'sale_price', 'current_price', 'color', 'length', 'cap_size',
            'stock_quantity', 'is_featured', 'is_trending', 'is_new',
            'rating', 'review_count', 'media', 'primary_image', 'variants', 'created_at',
            'seo_title', 'seo_description', 'seo_keywords'
        ]
        read_only_fields = ['id', 'slug', 'rating', 'review_count', 'created_at', 'category']
    
    def get_primary_image(self, obj):
        primary = obj.media.filter(is_primary=True).first()
        if primary:
            return ProductMediaSerializer(primary).data
        media = obj.media.first()
        if media:
            return ProductMediaSerializer(media).data
        return None
    
    def get_current_price(self, obj):
        return str(obj.get_price())
    
    def update(self, instance, validated_data):
        """Handle category_id translation"""
        category_id = validated_data.pop('category_id', None)
        if category_id is not None:
            try:
                instance.category_id = category_id
            except:
                pass
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
