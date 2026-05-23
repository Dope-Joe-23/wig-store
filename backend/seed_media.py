#!/usr/bin/env python
import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product, ProductMedia

image_urls = [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1562572933-2f5a0f822334?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1576957633512-c7db6248d269?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1522339213992-b88fbc36a656?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1634547492710-f40c2a79b48e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1610214174271-a1571bff71be?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
]

products = Product.objects.all()
count = 0
for product in products:
    existing_media = product.media.filter(url__isnull=False).exclude(url='').first()
    if existing_media and existing_media.url and not existing_media.url.startswith('https://'):
        # URL exists but might be broken, update it
        image_url = random.choice(image_urls)
        existing_media.url = image_url
        existing_media.save()
        count += 1

print(f'Updated media for {count} products with new Unsplash URLs')

