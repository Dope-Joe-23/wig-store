from django.conf import settings
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
import random
import string
import logging

logger = logging.getLogger(__name__)
from .models import UserAddress, UserWishlist, UserOTP
from .utils import send_otp_email
from .serializers import (
    UserSerializer, UserAddressSerializer, UserRegistrationSerializer,
    UserWishlistSerializer, CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer,
    UserRegistrationResponseSerializer, OTPSendSerializer, OTPVerifySerializer,
    GoogleSocialAuthSerializer, FacebookSocialAuthSerializer
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """User management ViewSet"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_me(self, request):
        """Update current user profile"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """Register new user and return tokens"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate tokens for new user
            refresh = RefreshToken.for_user(user)

            response_data = {
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }

            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserAddressViewSet(viewsets.ModelViewSet):
    """User address management"""

    queryset = UserAddress.objects.all()
    serializer_class = UserAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserWishlistViewSet(viewsets.ModelViewSet):
    """User wishlist management"""

    queryset = UserWishlist.objects.all()
    serializer_class = UserWishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, created = UserWishlist.objects.get_or_create(user=self.request.user)
        return obj

    @action(detail=False, methods=['get'])
    def my_wishlist(self, request):
        wishlist, created = UserWishlist.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_to_wishlist(self, request):
        """Add a product to wishlist"""
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        wishlist, created = UserWishlist.objects.get_or_create(user=request.user)
        from apps.products.models import Product
        try:
            product = Product.objects.get(id=product_id)
            wishlist.products.add(product)
            return Response({'status': 'added'})
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def remove_from_wishlist(self, request):
        """Remove a product from wishlist"""
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        wishlist, created = UserWishlist.objects.get_or_create(user=request.user)
        from apps.products.models import Product
        try:
            product = Product.objects.get(id=product_id)
            wishlist.products.remove(product)
            return Response({'status': 'removed'})
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain view with user data"""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenRefreshView(TokenRefreshView):
    """Custom token refresh view"""
    serializer_class = CustomTokenRefreshSerializer
    permission_classes = [permissions.AllowAny]


class OTPView(APIView):
    """OTP generation and verification"""
    permission_classes = [permissions.AllowAny]

    def post(self, request, action):
        if action == 'send':
            return self.send_otp(request)
        elif action == 'verify':
            return self.verify_otp(request)
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    def send_otp(self, request):
        serializer = OTPSendSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        purpose = serializer.validated_data.get('purpose', 'login')

        # For login: user must exist. For register: user must NOT exist.
        user_exists = User.objects.filter(email=email).exists()

        if purpose == 'login' and not user_exists:
            return Response(
                {'error': 'No account found with this email.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if purpose == 'register' and user_exists:
            return Response(
                {'error': 'An account with this email already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user for login purpose
        user = User.objects.filter(email=email).first() if user_exists else None

        # Generate 6-digit OTP
        code = ''.join(random.choices(string.digits, k=6))

        # Store OTP
        UserOTP.objects.create(
            user=user,
            email=email,
            code=code,
            purpose=purpose,
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        # Send OTP via email
        email_sent = send_otp_email(email, code, purpose)

        if not email_sent:
            logger.warning(f'Failed to send OTP email to {email}')

        response_data = {
            'message': 'OTP sent successfully',
            'expires_in': 600,
        }

        # Only include code in response when using console email backend (dev mode)
        if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
            response_data['code'] = code

        return Response(response_data)

    def verify_otp(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = serializer.validated_data['otp']

        # Find OTP by email (works for both login and registration)
        try:
            otp = UserOTP.objects.filter(
                email=email,
                code=code,
                is_used=False,
                expires_at__gte=timezone.now()
            ).latest('created_at')

            # Mark OTP as used
            otp.is_used = True
            otp.save()

            # For login: generate tokens
            if otp.purpose == 'login' and otp.user:
                refresh = RefreshToken.for_user(otp.user)

                return Response({
                    'user': UserSerializer(otp.user).data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                })

            # For registration: just confirm OTP is valid
            return Response({
                'status': 'verified',
                'message': 'Email verified successfully'
            })

        except UserOTP.DoesNotExist:
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)


class FacebookSocialAuthView(APIView):
    """Facebook social authentication using access token verification"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = FacebookSocialAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        access_token = serializer.validated_data['access_token']

        try:
            import requests as http_requests

            # Verify the access token with Facebook's Graph API
            graph_url = 'https://graph.facebook.com/me'
            params = {
                'access_token': access_token,
                'fields': 'id,name,email,picture.type(large)',
            }

            resp = http_requests.get(graph_url, params=params, timeout=10)
            data = resp.json()

            if 'error' in data:
                return Response(
                    {'error': data['error'].get('message', 'Invalid Facebook token')},
                    status=status.HTTP_400_BAD_REQUEST
                )

            facebook_id = data.get('id')
            email = data.get('email', '')
            name = data.get('name', '')
            picture = data.get('picture', {}).get('data', {}).get('url', '')

            if not email:
                return Response(
                    {'error': 'Facebook account must have an email address.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Find or create user
            # 1. Try by facebook_id
            user = User.objects.filter(facebook_id=facebook_id).first()

            # 2. Try by email
            if not user:
                user = User.objects.filter(email=email).first()
                if user:
                    user.facebook_id = facebook_id
                    if picture and not user.avatar:
                        user.avatar = picture
                    user.save()

            # 3. Create new user
            if not user:
                parts = name.strip().split(' ', 1)
                first_name = parts[0]
                last_name = parts[1] if len(parts) > 1 else ''

                username = email.split('@')[0]
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f'{base_username}{counter}'
                    counter += 1

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    facebook_id=facebook_id,
                    avatar=picture or '',
                )

            if not user.email:
                user.email = email
            user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })

        except Exception as e:
            return Response(
                {'error': f'Facebook authentication failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class GoogleSocialAuthView(APIView):
    """Google social authentication using ID token verification"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleSocialAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        id_token_str = serializer.validated_data['id_token']

        try:
            # Verify the Google ID token
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests

            idinfo = google_id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            # Extract user info from verified token
            google_id = idinfo.get('sub')
            email = idinfo.get('email', '')
            name = idinfo.get('name', '')
            picture = idinfo.get('picture', '')

            if not email:
                return Response(
                    {'error': 'Google account must have an email address.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if token is from this app's client ID
            if idinfo['aud'] != settings.GOOGLE_CLIENT_ID:
                return Response(
                    {'error': 'Invalid token audience.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Find or create user
            # 1. Try to find by google_id first
            user = User.objects.filter(google_id=google_id).first()

            # 2. Try to find by email if no google_id match
            if not user:
                user = User.objects.filter(email=email).first()
                # Link existing account to Google
                if user:
                    user.google_id = google_id
                    if picture and not user.avatar:
                        user.avatar = picture
                    user.save()

            # 3. Create new user if not found
            if not user:
                # Split name into first and last
                parts = name.strip().split(' ', 1)
                first_name = parts[0]
                last_name = parts[1] if len(parts) > 1 else ''

                # Generate username from email
                username = email.split('@')[0]
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f'{base_username}{counter}'
                    counter += 1

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    google_id=google_id,
                    avatar=picture or '',
                )

            # Mark email as verified since Google has verified it
            if not user.email:
                user.email = email
            user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })

        except ValueError as e:
            # Invalid token
            return Response(
                {'error': f'Invalid Google token: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Authentication failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
