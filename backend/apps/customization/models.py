from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class HeroSlide(models.Model):
    """Slides for the hero section - supports both image and video backgrounds"""
    
    MEDIA_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]
    
    title = models.CharField(max_length=255, default='Elegance Redefined')
    subtitle = models.TextField(blank=True, default='')
    tagline = models.CharField(max_length=255, blank=True, default='Premium Luxury Wigs')
    cta_text = models.CharField(max_length=100, blank=True, default='Explore Collection')
    cta_link = models.CharField(max_length=500, blank=True, default='/products')
    secondary_cta_text = models.CharField(max_length=100, blank=True, default='Watch Our Story')
    secondary_cta_link = models.CharField(max_length=500, blank=True, default='#')
    
    media_type = models.CharField(max_length=10, choices=MEDIA_CHOICES, default='image')
    media_file = models.FileField(
        upload_to='customization/hero/',
        null=True, blank=True,
        help_text='Upload an image or video file from your device'
    )
    media_url = models.URLField(
        null=True, blank=True,
        help_text='Or provide an external URL for the media'
    )
    
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customization_hero_slide'
        ordering = ['order', 'id']
        verbose_name = 'Hero Slide'
        verbose_name_plural = 'Hero Slides'
    
    def get_media_url(self):
        """Return the actual media URL - file takes priority over URL field"""
        if self.media_file:
            return self.media_file.url
        return self.media_url
    
    def __str__(self):
        return self.title


class FeaturedItem(models.Model):
    """Featured products displayed on the homepage"""
    
    title = models.CharField(max_length=255, blank=True, default='')
    subtitle = models.TextField(blank=True, default='')
    badge_text = models.CharField(max_length=100, blank=True, default='')
    
    # Optional custom media override
    media_type = models.CharField(max_length=10, choices=HeroSlide.MEDIA_CHOICES, default='image')
    media_file = models.FileField(
        upload_to='customization/featured/',
        null=True, blank=True,
        help_text='Upload an image from your device'
    )
    media_url = models.URLField(
        null=True, blank=True,
        help_text='Or provide an external image URL'
    )
    
    # Link to a product (optional)
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='featured_items'
    )
    
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customization_featured_item'
        ordering = ['order', 'id']
        verbose_name = 'Featured Item'
        verbose_name_plural = 'Featured Items'
    
    def get_media_url(self):
        """Return the actual media URL"""
        if self.media_file:
            return self.media_file.url
        if self.media_url:
            return self.media_url
        # Fallback to product's primary image
        if self.product:
            primary = self.product.media.filter(is_primary=True).first()
            if primary:
                return primary.get_url()
            media = self.product.media.first()
            if media:
                return media.get_url()
        return None
    
    def get_name(self):
        if self.title:
            return self.title
        return self.product.name if self.product else ''
    
    def get_price(self):
        if self.product:
            return str(self.product.get_price())
        return ''
    
    def __str__(self):
        return self.get_name()


class Testimonial(models.Model):
    """Customer testimonials/recommendations for the homepage"""
    
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255, blank=True, default='')
    quote = models.TextField()
    rating = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    # Optional media (photo or video testimonial)
    media_type = models.CharField(
        max_length=10,
        choices=HeroSlide.MEDIA_CHOICES,
        default='image'
    )
    media_file = models.FileField(
        upload_to='customization/testimonials/',
        null=True, blank=True,
        help_text='Upload a photo or video from your device'
    )
    media_url = models.URLField(
        null=True, blank=True,
        help_text='Or provide an external image/video URL'
    )
    
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customization_testimonial'
        ordering = ['order', 'id']
        verbose_name = 'Testimonial'
        verbose_name_plural = 'Testimonials'
    
    def get_media_url(self):
        """Return the actual media URL"""
        if self.media_file:
            return self.media_file.url
        return self.media_url
    
    def __str__(self):
        return f'Testimonial by {self.name}'


class AboutPage(models.Model):
    """About page content - single configurable entry"""
    
    title = models.CharField(max_length=255, default='About Affordable Hair and More')
    subtitle = models.TextField(blank=True, default='')
    
    # Story section
    story_title = models.CharField(max_length=255, blank=True, default='Our Story')
    story_content = models.TextField(blank=True, default='')
    story_image = models.FileField(
        upload_to='customization/about/',
        null=True, blank=True,
        help_text='Upload an image for the story section'
    )
    story_image_url = models.URLField(
        null=True, blank=True,
        help_text='Or provide an external image URL'
    )
    
    # Mission section
    mission_title = models.CharField(max_length=255, blank=True, default='Our Mission')
    mission_content = models.TextField(blank=True, default='')
    mission_image = models.FileField(
        upload_to='customization/about/',
        null=True, blank=True,
        help_text='Upload an image for the mission section'
    )
    mission_image_url = models.URLField(
        null=True, blank=True,
        help_text='Or provide an external image URL'
    )
    
    # Values (stored as JSON array of {title, description} objects)
    values = models.JSONField(
        default=list, blank=True,
        help_text='List of core values: [{"title": "...", "description": "..."}]'
    )
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customization_about_page'
        verbose_name = 'About Page'
        verbose_name_plural = 'About Pages'
    
    def get_story_image_url(self):
        if self.story_image:
            return self.story_image.url
        return self.story_image_url
    
    def get_mission_image_url(self):
        if self.mission_image:
            return self.mission_image.url
        return self.mission_image_url
    
    def __str__(self):
        return self.title


class VideoContent(models.Model):
    """Tutorial/how-to videos for the Lifestyle section (replacing editorial cards)"""
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    category = models.CharField(
        max_length=50,
        choices=[
            ('how_to_use', 'How to Use'),
            ('care_tips', 'Care Tips'),
            ('styling', 'Styling Guide'),
            ('product_review', 'Product Review'),
            ('general', 'General'),
        ],
        default='general'
    )
    
    video_file = models.FileField(
        upload_to='customization/videos/',
        null=True, blank=True,
        help_text='Upload a video file from your device'
    )
    video_url = models.URLField(
        null=True, blank=True,
        help_text='Or provide an external video URL (YouTube, Vimeo, etc.)'
    )
    thumbnail_file = models.FileField(
        upload_to='customization/video_thumbnails/',
        null=True, blank=True,
        help_text='Upload a thumbnail image for the video'
    )
    thumbnail_url = models.URLField(
        null=True, blank=True,
        help_text='Or provide an external thumbnail URL'
    )
    
    duration = models.CharField(max_length=20, blank=True, default='', help_text='e.g., "3:45"')
    
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customization_video_content'
        ordering = ['order', 'id']
        verbose_name = 'Video Content'
        verbose_name_plural = 'Video Contents'
    
    def get_video_url(self):
        if self.video_file:
            return self.video_file.url
        return self.video_url
    
    def get_thumbnail_url(self):
        if self.thumbnail_file:
            return self.thumbnail_file.url
        return self.thumbnail_url
    
    def __str__(self):
        return self.title


class BlogPost(models.Model):
    """Blog post snippets for the homepage blog section (replacing CTA section)"""
    
    title = models.CharField(max_length=255)
    excerpt = models.TextField(blank=True, default='', help_text='Short snippet shown on the homepage')
    content = models.TextField(blank=True, default='', help_text='Full blog post content')
    author = models.CharField(max_length=255, blank=True, default='')
    category = models.CharField(
        max_length=50,
        choices=[
            ('product', 'Product Spotlight'),
            ('tips', 'Tips & Tricks'),
            ('beauty', 'Beauty & Style'),
            ('news', 'News & Updates'),
            ('general', 'General'),
        ],
        default='general'
    )
    
    cover_image_file = models.FileField(
        upload_to='customization/blog/',
        null=True, blank=True,
        help_text='Upload a cover image'
    )
    cover_image_url = models.URLField(
        null=True, blank=True,
        help_text='Or provide an external image URL'
    )
    
    read_time = models.CharField(max_length=20, blank=True, default='', help_text='e.g., "5 min read"')
    external_link = models.URLField(
        null=True, blank=True,
        help_text='Link to full blog post (if hosted externally)'
    )
    
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customization_blog_post'
        ordering = ['-is_featured', 'order', '-created_at']
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
    
    def get_cover_image_url(self):
        if self.cover_image_file:
            return self.cover_image_file.url
        return self.cover_image_url
    
    def __str__(self):
        return self.title


class ContactPage(models.Model):
    """Contact page content - single configurable entry"""
    
    title = models.CharField(max_length=255, default='Get in Touch')
    subtitle = models.TextField(blank=True, default='')
    
    # Contact info
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    address = models.TextField(blank=True, default='')
    working_hours = models.TextField(blank=True, default='')
    
    # Social links (stored as JSON array of {platform, url, icon} objects)
    social_links = models.JSONField(
        default=list, blank=True,
        help_text='Social media links: [{"platform": "Instagram", "url": "..."}]'
    )
    
    # Map embed URL (e.g., Google Maps iframe src)
    map_embed_url = models.TextField(blank=True, default='')
    
    # Contact form settings
    form_title = models.CharField(max_length=255, blank=True, default='Send Us a Message')
    form_subtitle = models.TextField(blank=True, default='')
    
    # Banner image
    banner_image = models.FileField(
        upload_to='customization/contact/',
        null=True, blank=True,
        help_text='Upload a banner image'
    )
    banner_image_url = models.URLField(
        null=True, blank=True,
        help_text='Or provide an external banner image URL'
    )
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customization_contact_page'
        verbose_name = 'Contact Page'
        verbose_name_plural = 'Contact Pages'
    
    def get_banner_image_url(self):
        if self.banner_image:
            return self.banner_image.url
        return self.banner_image_url
    
    def __str__(self):
        return self.title
