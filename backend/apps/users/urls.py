from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    UserViewSet, UserAddressViewSet, UserWishlistViewSet,
    CustomTokenObtainPairView, CustomTokenRefreshView,
    OTPView, GoogleSocialAuthView, FacebookSocialAuthView
)

app_name = 'users'

router = SimpleRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'addresses', UserAddressViewSet, basename='address')
router.register(r'wishlists', UserWishlistViewSet, basename='wishlist')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('otp/<str:action>/', OTPView.as_view(), name='otp'),
    path('social/google/', GoogleSocialAuthView.as_view(), name='google_auth'),
    path('social/facebook/', FacebookSocialAuthView.as_view(), name='facebook_auth'),
]
