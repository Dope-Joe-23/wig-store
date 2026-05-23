#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from apps.products.serializers import ProductDetailSerializer

# Get the first product with a file
product = Product.objects.filter(media__file__isnull=False).exclude(media__file='').first()

if product:
    serializer = ProductDetailSerializer(product)
    data = serializer.data
    
    print(f'Product: {data["name"]}')
    print(f'Primary Image:')
    if data.get('primary_image'):
        print(f'  URL: {data["primary_image"]["url"]}')
        print(f'  Alt Text: {data["primary_image"]["alt_text"]}')
    print(f'\nAll Media:')
    for media in data.get('media', []):
        print(f'  - {media["url"]}')
else:
    print('No products with file media found')
