#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from apps.products.serializers import ProductListSerializer

# Get first 3 products
products = Product.objects.all()[:3]

print('Testing ProductListSerializer output:\n')
for product in products:
    serializer = ProductListSerializer(product)
    data = serializer.data
    print(f'Product: {data["name"]}')
    if data.get('primary_image'):
        print(f'  Image URL: {data["primary_image"]["url"]}')
    else:
        print(f'  No image')
    print()
