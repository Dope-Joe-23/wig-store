#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import ProductMedia

medias = ProductMedia.objects.all()
print(f'Total media: {medias.count()}')

file_count = medias.filter(file__isnull=False).exclude(file='').count()
url_count = medias.filter(url__isnull=False).exclude(url='').count()

print(f'With file: {file_count}')
print(f'With URL: {url_count}')

print('\nFirst 5 media records:')
for i, m in enumerate(medias[:5]):
    print(f'{i+1}. Product: {m.product.name}')
    print(f'   File: {m.file}')
    print(f'   URL: {m.url}')
    print(f'   get_url(): {m.get_url()}')
    print()
