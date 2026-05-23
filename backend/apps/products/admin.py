from django.contrib import admin
from .models import Category, Product, ProductMedia, ProductVariant


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_product_count']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    
    def get_product_count(self, obj):
        return obj.products.count()
    get_product_count.short_description = 'Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock_quantity', 'is_featured', 'created_at']
    list_filter = ['category', 'wig_type', 'texture', 'is_featured', 'is_trending', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at', 'view_count']
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug', 'description', 'category')
        }),
        ('Product Details', {
            'fields': ('wig_type', 'texture', 'color', 'length', 'cap_size')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'sale_price', 'stock_quantity')
        }),
        ('Visibility', {
            'fields': ('is_featured', 'is_trending', 'is_new')
        }),
        ('SEO', {
            'fields': ('seo_title', 'seo_description', 'seo_keywords'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('rating', 'review_count', 'view_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProductMedia)
class ProductMediaAdmin(admin.ModelAdmin):
    list_display = ['product', 'media_type', 'is_primary', 'order']
    list_filter = ['media_type', 'is_primary']
    search_fields = ['product__name']


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'color', 'size', 'sku', 'stock']
    list_filter = ['product', 'color', 'size']
    search_fields = ['product__name', 'sku']
