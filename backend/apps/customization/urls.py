from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    HeroSlideViewSet, FeaturedItemViewSet, TestimonialViewSet,
    AboutPageViewSet, ContactPageViewSet,
    VideoContentViewSet, BlogPostViewSet,
)

app_name = 'customization'

router = SimpleRouter()
router.register(r'hero-slides', HeroSlideViewSet, basename='hero-slide')
router.register(r'featured-items', FeaturedItemViewSet, basename='featured-item')
router.register(r'testimonials', TestimonialViewSet, basename='testimonial')
router.register(r'about', AboutPageViewSet, basename='about')
router.register(r'contact', ContactPageViewSet, basename='contact')
router.register(r'videos', VideoContentViewSet, basename='video')
router.register(r'blog', BlogPostViewSet, basename='blog')

urlpatterns = [
    path('', include(router.urls)),
]
