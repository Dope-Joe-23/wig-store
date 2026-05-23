"""
Management command to seed the database with test data using Faker.
Usage: python manage.py seed_test_data
"""

from django.core.management.base import BaseCommand
from faker import Faker
from apps.products.models import Category, Product, ProductMedia
import random

fake = Faker()


class Command(BaseCommand):
    help = 'Seeds the database with test products and categories'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing products and categories before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Product.objects.all().delete()
            Category.objects.all().delete()

        self.stdout.write('Seeding categories...')
        categories = self.seed_categories()

        self.stdout.write('Seeding products...')
        self.seed_products(categories)

        self.stdout.write(self.style.SUCCESS('✓ Test data seeded successfully'))

    def seed_categories(self):
        """Create product categories"""
        category_names = [
            'Human Hair',
            'Synthetic',
            'Lace Front',
            'Full Wig',
            'Half Wig',
            'Hair Accessories',
            'Wig Care',
        ]

        categories = []
        for name in category_names:
            category, created = Category.objects.get_or_create(
                name=name,
                defaults={'slug': name.lower().replace(' ', '-')}
            )
            categories.append(category)
            if created:
                self.stdout.write(f'  Created category: {name}')

        return categories

    def seed_products(self, categories):
        """Create test products"""
        wig_styles = [
            'Straight Long',
            'Wavy Beach',
            'Curly Volume',
            'Bob Cut',
            'Lace Front',
            'HD Lace',
            'Kinky Curly',
            'Loose Wave',
            'Body Wave',
            'Deep Wave',
        ]

        colors = ['Black', 'Brown', 'Blonde', 'Auburn', 'Burgundy', 'Gray', 'Platinum']
        wig_types = ['human_hair', 'synthetic', 'blend']
        textures = ['straight', 'wavy', 'curly', 'coily', 'kinky']

        for i in range(50):  # Create 50 products
            category = random.choice(categories)
            style = random.choice(wig_styles)
            color = random.choice(colors)

            # Generate realistic price based on category
            price_ranges = {
                'Human Hair': (150, 500),
                'Synthetic': (50, 200),
                'Lace Front': (200, 600),
                'Full Wig': (80, 400),
                'Half Wig': (40, 150),
                'Hair Accessories': (10, 50),
                'Wig Care': (15, 60),
            }
            min_price, max_price = price_ranges.get(category.name, (50, 300))
            price = round(random.uniform(min_price, max_price), 2)

            name = f'{style} {color} {category.name} Wig - {fake.bothify(text="??##")}'
            slug = f'{style.lower().replace(" ", "-")}-{color.lower()}-{category.slug}-{i}'

            product, created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'category': category,
                    'price': price,
                    'description': fake.paragraph(nb_sentences=5),
                    'wig_type': random.choice(wig_types),
                    'texture': random.choice(textures),
                    'length': random.choice(['8"', '10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"']),
                    'cap_size': random.choice(['Small', 'Medium', 'Large']),
                    'color': color,
                    'is_featured': random.choice([True, False, False, False]),  # 25% featured
                    'is_trending': random.choice([True, False, False, False]),   # 25% trending
                    'stock_quantity': random.randint(0, 50),
                }
            )

            if created:
                self.stdout.write(f'  Created product: {name}')
                # Add placeholder images for each product
                self.seed_product_media(product)

        self.stdout.write(f'Total products created: {Product.objects.count()}')

    def seed_product_media(self, product):
        """Create placeholder media for a product"""
        # List of placeholder image URLs
        image_urls = [
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
            'https://images.unsplash.com/photo-1562572933-2f5a0f822334?w=500&q=80',
            'https://images.unsplash.com/photo-1576957633512-c7db6248d269?w=500&q=80',
            'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80',
            'https://images.unsplash.com/photo-1522339213992-b88fbc36a656?w=500&q=80',
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&q=80',
        ]
        
        # Create primary image
        image_url = random.choice(image_urls)
        ProductMedia.objects.create(
            product=product,
            media_type='image',
            url=image_url,
            alt_text=f'{product.name} - Primary Image',
            is_primary=True,
            order=0
        )
