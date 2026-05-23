from django.contrib import admin
from .models import CustomUser, UserAddress, UserWishlist, UserOTP


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'get_full_name', 'phone_verified', 'created_at']
    list_filter = ['is_newsletter_subscribed', 'phone_verified', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'user', 'city', 'country', 'is_default']
    list_filter = ['type', 'is_default', 'country']
    search_fields = ['full_name', 'user__email', 'city']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserWishlist)
class UserWishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'get_product_count']
    search_fields = ['user__email']
    
    def get_product_count(self, obj):
        return obj.products.count()
    get_product_count.short_description = 'Products'


@admin.register(UserOTP)
class UserOTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'purpose', 'is_used', 'expires_at', 'created_at']
    list_filter = ['purpose', 'is_used']
    search_fields = ['user__email', 'code']
    readonly_fields = ['code', 'created_at']
