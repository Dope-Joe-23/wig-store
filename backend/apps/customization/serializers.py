from rest_framework import serializers
from .models import HeroSlide, FeaturedItem, Testimonial, AboutPage, ContactPage, VideoContent, BlogPost


class HeroSlideSerializer(serializers.ModelSerializer):
    media_url_display = serializers.SerializerMethodField()
    
    class Meta:
        model = HeroSlide
        fields = [
            'id', 'title', 'subtitle', 'tagline',
            'cta_text', 'cta_link', 'secondary_cta_text', 'secondary_cta_link',
            'media_type', 'media_file', 'media_url', 'media_url_display',
            'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_media_url_display(self, obj):
        return obj.get_media_url()


class FeaturedItemSerializer(serializers.ModelSerializer):
    media_url_display = serializers.SerializerMethodField()
    product_name = serializers.CharField(source='product.name', read_only=True, default=None)
    product_slug = serializers.CharField(source='product.slug', read_only=True, default=None)
    product_price = serializers.SerializerMethodField()
    
    class Meta:
        model = FeaturedItem
        fields = [
            'id', 'title', 'subtitle', 'badge_text',
            'media_type', 'media_file', 'media_url', 'media_url_display',
            'product', 'product_name', 'product_slug', 'product_price',
            'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_media_url_display(self, obj):
        return obj.get_media_url()
    
    def get_product_price(self, obj):
        if obj.product:
            return str(obj.product.get_price())
        return None


class TestimonialSerializer(serializers.ModelSerializer):
    media_url_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'name', 'title', 'quote', 'rating',
            'media_type', 'media_file', 'media_url', 'media_url_display',
            'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_media_url_display(self, obj):
        return obj.get_media_url()


class AboutPageSerializer(serializers.ModelSerializer):
    story_image_display = serializers.SerializerMethodField()
    mission_image_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AboutPage
        fields = [
            'id', 'title', 'subtitle',
            'story_title', 'story_content', 'story_image', 'story_image_url', 'story_image_display',
            'mission_title', 'mission_content', 'mission_image', 'mission_image_url', 'mission_image_display',
            'values', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_story_image_display(self, obj):
        return obj.get_story_image_url()
    
    def get_mission_image_display(self, obj):
        return obj.get_mission_image_url()


class VideoContentSerializer(serializers.ModelSerializer):
    video_url_display = serializers.SerializerMethodField()
    thumbnail_url_display = serializers.SerializerMethodField()
    thumbnail_clear = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = VideoContent
        fields = [
            'id', 'title', 'description', 'category',
            'video_file', 'video_url', 'video_url_display',
            'thumbnail_file', 'thumbnail_url', 'thumbnail_url_display',
            'thumbnail_clear',
            'duration', 'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_video_url_display(self, obj):
        return obj.get_video_url()

    def get_thumbnail_url_display(self, obj):
        return obj.get_thumbnail_url()

    def update(self, instance, validated_data):
        if validated_data.pop('thumbnail_clear', False):
            instance.thumbnail_file = None
            instance.thumbnail_url = ''
        return super().update(instance, validated_data)

    def create(self, validated_data):
        validated_data.pop('thumbnail_clear', None)
        return super().create(validated_data)


class BlogPostSerializer(serializers.ModelSerializer):
    cover_image_display = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'excerpt', 'content', 'author', 'category',
            'cover_image_file', 'cover_image_url', 'cover_image_display',
            'read_time', 'external_link',
            'is_active', 'is_featured', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_cover_image_display(self, obj):
        return obj.get_cover_image_url()


class ContactPageSerializer(serializers.ModelSerializer):
    banner_image_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ContactPage
        fields = [
            'id', 'title', 'subtitle',
            'email', 'phone', 'address', 'working_hours',
            'social_links', 'map_embed_url',
            'form_title', 'form_subtitle',
            'banner_image', 'banner_image_url', 'banner_image_display',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_banner_image_display(self, obj):
        return obj.get_banner_image_url()
