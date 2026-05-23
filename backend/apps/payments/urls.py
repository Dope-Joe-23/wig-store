from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    PaymentInitializeAPIView,
    PaymentVerifyAPIView,
    PaymentViewSet,
    PaystackWebhookAPIView,
)

app_name = 'payments'

router = SimpleRouter()
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = [
    path('initialize/', PaymentInitializeAPIView.as_view(), name='initialize'),
    path('verify/<str:reference>/', PaymentVerifyAPIView.as_view(), name='verify'),
    path('webhook/', PaystackWebhookAPIView.as_view(), name='webhook'),
    path('', include(router.urls)),
]
