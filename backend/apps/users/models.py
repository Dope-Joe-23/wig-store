from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """Extended user model for Affordable Hair and More platform"""
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    preferred_language = models.CharField(
        max_length=10,
        default='en',
        choices=[('en', 'English'), ('fr', 'French')]
    )
    
    # Social auth
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    facebook_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    
    # Profile
    bio = models.TextField(blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)
    
    # Account info
    is_newsletter_subscribed = models.BooleanField(default=True)
    phone_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_custom_user'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} ({self.get_full_name()})"


class UserAddress(models.Model):
    """User delivery/billing addresses"""
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='addresses')
    
    type = models.CharField(
        max_length=20,
        choices=[('billing', 'Billing'), ('shipping', 'Shipping'), ('both', 'Both')],
        default='shipping'
    )
    is_default = models.BooleanField(default=False)
    
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_address'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.full_name} - {self.city}, {self.country}"


class UserOTP(models.Model):
    """OTP codes for passwordless login and registration"""

    user = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.CASCADE, related_name='otps')
    email = models.EmailField()
    code = models.CharField(max_length=6)
    purpose = models.CharField(
        max_length=20,
        choices=[('login', 'Login'), ('register', 'Register')],
        default='login'
    )
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users_otp'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} - {self.code}"


class UserWishlist(models.Model):
    """User wishlist"""
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='wishlist')
    products = models.ManyToManyField('products.Product', related_name='wishlists')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_wishlist'
    
    def __str__(self):
        return f"{self.user.email} wishlist"
