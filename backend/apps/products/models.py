from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator


class Category(models.Model):
    """Product categories"""
    
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    image = models.URLField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products_category'
        ordering = ['name']
        verbose_name_plural = 'categories'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """Main product model"""
    
    WIG_TYPE_CHOICES = [
        ('human_hair', 'Human Hair'),
        ('synthetic', 'Synthetic'),
        ('blend', 'Human Hair Blend'),
    ]
    
    TEXTURE_CHOICES = [
        ('straight', 'Straight'),
        ('wavy', 'Wavy'),
        ('curly', 'Curly'),
        ('coily', 'Coily'),
        ('kinky', 'Kinky'),
    ]
    
    # Basic info
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    
    # Categorization
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    wig_type = models.CharField(max_length=50, choices=WIG_TYPE_CHOICES)
    texture = models.CharField(max_length=50, choices=TEXTURE_CHOICES)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    
    # Physical attributes
    color = models.CharField(max_length=100)
    length = models.CharField(max_length=100)  # e.g., "16 inches"
    cap_size = models.CharField(max_length=100)  # e.g., "Medium (21.5-22.5)"
    
    # Stock
    stock_quantity = models.PositiveIntegerField(default=0)
    
    # Feature flags
    is_featured = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    
    # SEO
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=500, blank=True)
    
    # Stats
    view_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products_product'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['is_trending']),
            models.Index(fields=['category']),
            models.Index(fields=['-created_at']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_price(self):
        return self.sale_price if self.sale_price else self.price
    
    def is_in_stock(self):
        return self.stock_quantity > 0
    
    def __str__(self):
        return self.name


class ProductMedia(models.Model):
    """Product images and videos"""
    
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('model_360', '360 View'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='media')
    media_type = models.CharField(max_length=50, choices=MEDIA_TYPE_CHOICES)
    file = models.FileField(upload_to='products/%Y/%m/%d/', null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'products_media'
        ordering = ['order', 'id']
    
    def get_url(self):
        """Return file URL if file exists, otherwise return url field"""
        if self.file:
            return self.file.url
        return self.url
    
    def __str__(self):
        return f"{self.product.name} - {self.media_type}"


class ProductVariant(models.Model):
    """Product size/color variants"""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    
    color = models.CharField(max_length=100)
    size = models.CharField(max_length=100)
    sku = models.CharField(max_length=100, unique=True)
    
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products_variant'
        unique_together = ['product', 'color', 'size']
    
    def __str__(self):
        return f"{self.product.name} - {self.color} / {self.size}"
