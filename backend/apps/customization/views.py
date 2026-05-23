from rest_framework import viewsets, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import HeroSlide, FeaturedItem, Testimonial, AboutPage, ContactPage, VideoContent, BlogPost
from .serializers import (
    HeroSlideSerializer, FeaturedItemSerializer, TestimonialSerializer,
    AboutPageSerializer, ContactPageSerializer,
    VideoContentSerializer, BlogPostSerializer,
)


class IsStaffOrReadOnly(permissions.BasePermission):
    """Allow staff to create/edit/delete, but everyone can read"""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class HeroSlideViewSet(viewsets.ModelViewSet):
    """Manage hero slides - supports file uploads and URL references"""

    queryset = HeroSlide.objects.all()
    serializer_class = HeroSlideSerializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = HeroSlide.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Only staff can reorder'}, status=status.HTTP_403_FORBIDDEN)
        items = request.data.get('items', [])
        for item in items:
            HeroSlide.objects.filter(id=item['id']).update(order=item['order'])
        return Response({'status': 'ok'})


class FeaturedItemViewSet(viewsets.ModelViewSet):
    """Manage featured products on the homepage"""

    queryset = FeaturedItem.objects.all()
    serializer_class = FeaturedItemSerializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = FeaturedItem.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Only staff can reorder'}, status=status.HTTP_403_FORBIDDEN)
        items = request.data.get('items', [])
        for item in items:
            FeaturedItem.objects.filter(id=item['id']).update(order=item['order'])
        return Response({'status': 'ok'})


class TestimonialViewSet(viewsets.ModelViewSet):
    """Manage customer testimonials/recommendations"""

    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = Testimonial.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Only staff can reorder'}, status=status.HTTP_403_FORBIDDEN)
        items = request.data.get('items', [])
        for item in items:
            Testimonial.objects.filter(id=item['id']).update(order=item['order'])
        return Response({'status': 'ok'})


class AboutPageViewSet(viewsets.ModelViewSet):
    """Manage about page content - single entry"""

    queryset = AboutPage.objects.all()
    serializer_class = AboutPageSerializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = AboutPage.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs


class VideoContentViewSet(viewsets.ModelViewSet):
    """Manage tutorial/how-to videos for the homepage"""

    queryset = VideoContent.objects.all()
    serializer_class = VideoContentSerializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = VideoContent.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Only staff can reorder'}, status=status.HTTP_403_FORBIDDEN)
        items = request.data.get('items', [])
        for item in items:
            VideoContent.objects.filter(id=item['id']).update(order=item['order'])
        return Response({'status': 'ok'})


class BlogPostViewSet(viewsets.ModelViewSet):
    """Manage blog posts for the homepage"""

    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = BlogPost.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Only staff can reorder'}, status=status.HTTP_403_FORBIDDEN)
        items = request.data.get('items', [])
        for item in items:
            BlogPost.objects.filter(id=item['id']).update(order=item['order'])
        return Response({'status': 'ok'})


class ContactPageViewSet(viewsets.ModelViewSet):
    """Manage contact page content - single entry"""

    queryset = ContactPage.objects.all()
    serializer_class = ContactPageSerializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = ContactPage.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs
