"""
Management command to seed default customization data (hero slides, featured items,
testimonials, blog posts, and video content) so the homepage has content on a fresh install.
Usage: python manage.py seed_customization
"""

from django.core.management.base import BaseCommand
from apps.customization.models import (
    HeroSlide,
    FeaturedItem,
    Testimonial,
    BlogPost,
    VideoContent,
)


class Command(BaseCommand):
    help = 'Seeds default hero slides, featured items, testimonials, blog posts, and video content'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing customization data before seeding',
        )
        parser.add_argument(
            '--blog-only',
            action='store_true',
            help='Only seed blog posts',
        )
        parser.add_argument(
            '--videos-only',
            action='store_true',
            help='Only seed video content',
        )

    def handle(self, *args, **options):
        blog_only = options['blog_only']
        videos_only = options['videos_only']

        if options['clear']:
            self.stdout.write('Clearing existing customization data...')
            if not blog_only and not videos_only:
                HeroSlide.objects.all().delete()
                FeaturedItem.objects.all().delete()
                Testimonial.objects.all().delete()
            BlogPost.objects.all().delete()
            VideoContent.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('  [OK] All cleared'))

        if not blog_only and not videos_only:
            self.stdout.write('\nSeeding hero slides...')
            self.seed_hero_slides()

            self.stdout.write('\nSeeding featured items...')
            self.seed_featured_items()

            self.stdout.write('\nSeeding testimonials...')
            self.seed_testimonials()

        self.stdout.write('\nSeeding blog posts...')
        self.seed_blog_posts()

        self.stdout.write('\nSeeding video content...')
        self.seed_video_content()

        self.stdout.write(self.style.SUCCESS('\n[OK] Customization data seeded successfully'))

    def seed_hero_slides(self):
        """Create default hero slides"""
        slides = [
            {
                'title': 'Elegance Redefined',
                'subtitle': 'Discover the artistry of premium wigs crafted for the modern woman who demands perfection',
                'tagline': 'Premium Luxury Wigs',
                'cta_text': 'Explore Collection',
                'cta_link': '/products',
                'secondary_cta_text': 'Watch Our Story',
                'secondary_cta_link': '/about',
                'media_type': 'image',
                'media_url': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&q=80',
                'is_active': True,
                'order': 0,
            },
            {
                'title': 'Confidence in Every Strand',
                'subtitle': 'Premium quality wigs that bring out your natural beauty and elevate your style effortlessly',
                'tagline': 'Uncompromising Quality',
                'cta_text': 'Shop Now',
                'cta_link': '/products',
                'secondary_cta_text': 'Learn More',
                'secondary_cta_link': '/about',
                'media_type': 'image',
                'media_url': 'https://images.unsplash.com/photo-1562572933-2f5a0f822334?w=1920&q=80',
                'is_active': True,
                'order': 1,
            },
        ]

        for data in slides:
            _, created = HeroSlide.objects.get_or_create(
                title=data['title'],
                defaults=data,
            )
            if created:
                self.stdout.write(f'  Created hero slide: {data["title"]}')

        count = HeroSlide.objects.count()
        self.stdout.write(f'  Total hero slides: {count}')

    def seed_featured_items(self):
        """Create default featured items (without product links)"""
        items = [
            {
                'title': 'Silky Straight Human Hair',
                'subtitle': 'Premium quality straight wigs for a sleek, sophisticated look',
                'badge_text': 'Best Seller',
                'media_type': 'image',
                'media_url': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
                'product': None,
                'is_active': True,
                'order': 0,
            },
            {
                'title': 'Kinky Curly Blend',
                'subtitle': 'Voluminous curly wigs that celebrate your natural texture',
                'badge_text': 'New',
                'media_type': 'image',
                'media_url': 'https://images.unsplash.com/photo-1487412912498-491d3b3be5f5?w=600&q=80',
                'product': None,
                'is_active': True,
                'order': 1,
            },
            {
                'title': 'Deep Wave Luxury',
                'subtitle': 'Elegant deep wave wigs for a glamorous, red-carpet ready look',
                'badge_text': 'Premium',
                'media_type': 'image',
                'media_url': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80',
                'product': None,
                'is_active': True,
                'order': 2,
            },
        ]

        for data in items:
            _, created = FeaturedItem.objects.get_or_create(
                title=data['title'],
                defaults=data,
            )
            if created:
                self.stdout.write(f'  Created featured item: {data["title"]}')

        count = FeaturedItem.objects.count()
        self.stdout.write(f'  Total featured items: {count}')

    def seed_testimonials(self):
        """Create default customer testimonials"""
        testimonials = [
            {
                'name': 'Amara Johnson',
                'title': 'Fashion Influencer',
                'quote': 'Affordable Hair and More transformed my confidence. The quality is unmatched — every wig feels like it was made just for me.',
                'rating': 5,
                'media_type': 'image',
                'media_url': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
                'is_active': True,
                'order': 0,
            },
            {
                'name': 'Sofia Martinez',
                'title': 'Entrepreneur',
                'quote': 'Best investment in my personal style. Game changer! The variety and craftsmanship are outstanding.',
                'rating': 5,
                'media_type': 'image',
                'media_url': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
                'is_active': True,
                'order': 1,
            },
            {
                'name': 'Zara Williams',
                'title': 'Hairstylist',
                'quote': 'I recommend Affordable Hair and More to all my clients. Impeccable craftsmanship that rivals the best salons in the industry.',
                'rating': 5,
                'media_type': 'image',
                'media_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
                'is_active': True,
                'order': 2,
            },
        ]

        for data in testimonials:
            _, created = Testimonial.objects.get_or_create(
                name=data['name'],
                defaults=data,
            )
            if created:
                self.stdout.write(f'  Created testimonial: {data["name"]}')

        count = Testimonial.objects.count()
        self.stdout.write(f'  Total testimonials: {count}')

    def seed_blog_posts(self):
        """Create sample blog posts"""
        posts = [
            {
                'title': 'The Ultimate Guide to Choosing the Perfect Wig',
                'excerpt': 'From lace fronts to full wigs, find out which style suits your face shape, lifestyle, and budget. Our comprehensive guide covers everything you need to know.',
                'content': (
                    'Choosing the perfect wig can feel overwhelming with so many options available. '
                    'In this guide, we break down everything you need to consider.\n\n'
                    '## Face Shape Matters\n'
                    'Your face shape plays a huge role in which wig style will look best on you. '
                    'Round faces benefit from longer styles that elongate, while oval faces can pull off almost any look.\n\n'
                    '## Cap Construction\n'
                    'Lace front wigs offer the most natural hairline, while full lace wigs allow for '
                    'versatile parting. Monofilament tops give the illusion of hair growing from the scalp.\n\n'
                    '## Hair Type\n'
                    'Human hair wigs offer the most natural look and can be styled with heat tools. '
                    'Synthetic wigs are more affordable and hold their style through rain and humidity.\n\n'
                    '## Maintenance\n'
                    'Proper care extends the life of your wig significantly. Use sulfate-free products, '
                    'store on a wig stand, and wash every 6-8 wears for optimal longevity.'
                ),
                'author': 'Affordable Hair and More Team',
                'category': 'tips',
                'cover_image_url': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
                'read_time': '8 min read',
                'is_active': True,
                'is_featured': True,
                'order': 0,
            },
            {
                'title': '5 Trending Wig Styles for This Season',
                'excerpt': 'Stay ahead of the curve with our curated list of the hottest wig trends. From bold colors to classic cuts with a twist.',
                'content': (
                    'This season is all about bold self-expression through your hair. Here are the top 5 wig trends dominating the scene.\n\n'
                    '## 1. The Long Bob (Lob)\n'
                    'This universally flattering cut hits just above the shoulders and works with both '
                    'straight and wavy textures. Perfect for a fresh, modern look.\n\n'
                    '## 2. Honey Blonde Highlights\n'
                    'Warm honey tones are taking over. Whether you go full blonde or add subtle highlights, '
                    'this color adds dimension and brightness to any style.\n\n'
                    '## 3. Deep Side Parts\n'
                    'Ditch the middle part and go deep. A dramatic side part adds instant volume and '
                    'old-Hollywood glamour to any wig.\n\n'
                    '## 4. Textured Curls\n'
                    'Embrace your natural texture with voluminous curly wigs. The bigger and bouncier, the better. '
                    'This look screams confidence.\n\n'
                    '## 5. Bold Burgundy\n'
                    'Rich burgundy and wine shades are the go-to color for those wanting to make a statement '
                    'without going too wild. It\'s sophisticated and edgy at the same time.'
                ),
                'author': 'Style Desk',
                'category': 'beauty',
                'cover_image_url': 'https://images.unsplash.com/photo-1567894340315-735d7c361db7?w=800&q=80',
                'read_time': '5 min read',
                'is_active': True,
                'is_featured': True,
                'order': 1,
            },
            {
                'title': 'How to Care for Your Lace Front Wig',
                'excerpt': 'Extend the life of your lace front wig with these professional care tips. Proper maintenance can double your wig\'s lifespan.',
                'content': (
                    'A lace front wig is an investment, and with proper care, it can last 6-12 months or even longer. '
                    'Here\'s how to keep yours looking flawless.\n\n'
                    '## Washing\n'
                    'Wash your wig every 6-8 wears using cool water and a sulfate-free shampoo. '
                    'Gently squeeze — never twist or wring. Apply conditioner from mid-length to ends.\n\n'
                    '## Drying\n'
                    'Pat dry with a microfiber towel and place on a wig stand to air dry. '
                    'Avoid heat styling while wet. Never sleep in a wet wig.\n\n'
                    '## Styling\n'
                    'Use heat protectant before using hot tools. Keep the temperature below 350°F (175°C) '
                    'for human hair wigs. Synthetic wigs should not be heat-styled unless labeled as heat-resistant.\n\n'
                    '## Storage\n'
                    'Store on a wig stand or mannequin head away from direct sunlight. '
                    'Keep in a silk or satin bag when traveling to prevent tangling.\n\n'
                    '## Lace Care\n'
                    'Replace the lace adhesive every 2-3 weeks. Clean the lace gently with alcohol wipes '
                    'to remove residue before reapplying.'
                ),
                'author': 'Affordable Hair and More Care Team',
                'category': 'product',
                'cover_image_url': 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=800&q=80',
                'read_time': '6 min read',
                'is_active': True,
                'is_featured': False,
                'order': 2,
            },
            {
                'title': 'New Collection Launch: Summer Breeze Edition',
                'excerpt': 'We\'re excited to announce our newest collection featuring lightweight, breathable wigs perfect for the warmer months ahead.',
                'content': (
                    'Summer is here, and we\'ve designed a collection that keeps you stylish without the heat. '
                    'Introducing the Summer Breeze Edition.\n\n'
                    '## What\'s New\n'
                    'Our Summer Breeze collection features lighter cap constructions with enhanced breathability. '
                    'Each wig uses our new ventilated cap design that keeps air flowing while maintaining a natural look.\n\n'
                    '## Colors to Love\n'
                    'This season we\'re introducing caramel highlights, honey blonde, and sun-kissed brown — '
                    'colors that catch the light and mimic natural sun-lightened hair.\n\n'
                    '## Limited Edition\n'
                    'The Summer Breeze collection is available for a limited time. Each wig comes in a '
                    'special-edition packaging with a complimentary silk wig cap.\n\n'
                    'Visit our collection page to explore the full range and find your summer look.'
                ),
                'author': 'Affordable Hair and More Newsroom',
                'category': 'news',
                'cover_image_url': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
                'read_time': '3 min read',
                'is_active': True,
                'is_featured': False,
                'order': 3,
            },
            {
                'title': 'Wig Cap Sizes: Finding Your Perfect Fit',
                'excerpt': 'A well-fitted wig cap makes all the difference in comfort and natural appearance. Learn how to measure your head for the perfect fit.',
                'content': (
                    'One of the most overlooked aspects of wig shopping is cap size. A wig that doesn\'t fit properly '
                    'will never look or feel right, no matter how beautiful the hair is.\n\n'
                    '## How to Measure\n'
                    'Use a flexible measuring tape and measure around your head at the hairline — '
                    'across the forehead, above the ears, and around the nape of your neck. '
                    'This is your circumference measurement.\n\n'
                    '## Standard Sizes\n'
                    'Small: 21-21.5 inches\n'
                    'Medium: 21.5-22.5 inches (most common)\n'
                    'Large: 22.5-23.5 inches\n\n'
                    '## Adjustable Caps\n'
                    'Most modern wigs feature adjustable straps at the nape, allowing you to customize '
                    'the fit by up to an inch in either direction.\n\n'
                    '## Signs of a Bad Fit\n'
                    'If your wig shifts when you move your head, leaves red marks on your forehead, '
                    'or feels tight enough to cause headaches, the size is wrong.'
                ),
                'author': 'Affordable Hair and More Team',
                'category': 'tips',
                'cover_image_url': 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&q=80',
                'read_time': '4 min read',
                'is_active': True,
                'is_featured': False,
                'order': 4,
            },
        ]

        for data in posts:
            _, created = BlogPost.objects.get_or_create(
                title=data['title'],
                defaults=data,
            )
            if created:
                self.stdout.write(f'  Created blog post: {data["title"]}')

        count = BlogPost.objects.count()
        featured_count = BlogPost.objects.filter(is_featured=True).count()
        self.stdout.write(f'  Total blog posts: {count} ({featured_count} featured)')

    def seed_video_content(self):
        """Create sample video content"""
        videos = [
            {
                'title': 'How to Apply a Lace Front Wig',
                'description': 'Step-by-step tutorial on applying a lace front wig for beginners. Learn how to prepare your natural hair, apply adhesive, and achieve a seamless, natural-looking hairline.',
                'category': 'how_to_use',
                'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url': 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=600&q=80',
                'duration': '8:25',
                'is_active': True,
                'order': 0,
            },
            {
                'title': '3 Easy Hairstyles with Your Wig',
                'excerpt': 'Quick and stylish ways to switch up your wig look without needing extra tools or products.',
                'description': 'Get three fresh looks from one wig! In this video, we show you how to create a chic half-up style, a sleek low ponytail, and voluminous side-swept waves.',
                'category': 'styling',
                'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
                'duration': '6:40',
                'is_active': True,
                'order': 1,
            },
            {
                'title': 'Wig Care Routine: Wash & Condition',
                'description': 'Watch our complete wig care routine from start to finish. Learn the right products to use, proper washing techniques, and drying methods that extend your wig\'s lifespan.',
                'category': 'care_tips',
                'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url': 'https://images.unsplash.com/photo-1567894340315-735d7c361db7?w=600&q=80',
                'duration': '12:15',
                'is_active': True,
                'order': 2,
            },
            {
                'title': 'Wig Review: Silky Straight HD Lace',
                'description': 'An honest, in-depth review of our Silky Straight HD Lace Wig. We test the comfort, movement, and natural look, plus compare it side-by-side with other top brands.',
                'category': 'product_review',
                'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
                'duration': '10:30',
                'is_active': True,
                'order': 3,
            },
            {
                'title': 'Summer Wig Tips: Staying Cool & Stylish',
                'description': 'Hot weather doesn\'t mean you have to sacrifice style. Discover our top tips for wearing wigs in summer — from breathable cap choices to light colors that reflect heat.',
                'category': 'care_tips',
                'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
                'duration': '5:50',
                'is_active': True,
                'order': 4,
            },
            {
                'title': 'How to Choose the Right Wig Color',
                'description': 'Picking the perfect wig color can be tricky. We explain skin tone analysis, color theory, and how to use our virtual try-on tool to find your ideal shade.',
                'category': 'how_to_use',
                'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url': 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80',
                'duration': '7:20',
                'is_active': True,
                'order': 5,
            },
        ]

        for data in videos:
            _, created = VideoContent.objects.get_or_create(
                title=data['title'],
                defaults={k: v for k, v in data.items() if k != 'excerpt'},
            )
            if created:
                self.stdout.write(f'  Created video: {data["title"]}')

        count = VideoContent.objects.count()
        self.stdout.write(f'  Total videos: {count}')
