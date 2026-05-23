from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserAddress, UserWishlist, UserOTP

User = get_user_model()


class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = [
            'id', 'type', 'is_default', 'full_name', 'phone', 'email',
            'street_address', 'city', 'state', 'postal_code', 'country'
        ]


class UserSerializer(serializers.ModelSerializer):
    addresses = UserAddressSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone',
            'avatar', 'bio', 'is_staff', 'is_newsletter_subscribed', 'addresses',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_staff']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    name = serializers.CharField(max_length=300, required=True, write_only=True)

    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'password_confirm']
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value

    def validate(self, data):
        password = data.get('password')
        password_confirm = data.pop('password_confirm', None)

        if not password_confirm:
            raise serializers.ValidationError({'password_confirm': 'This field is required.'})

        if password != password_confirm:
            raise serializers.ValidationError({'password': "Passwords don't match."})

        # Split name into first and last name
        name = data.pop('name', '')
        parts = name.strip().split(' ', 1)
        data['first_name'] = parts[0]
        data['last_name'] = parts[1] if len(parts) > 1 else ''

        # Generate username from email prefix
        data['username'] = data['email'].split('@')[0]

        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return user


class UserWishlistSerializer(serializers.ModelSerializer):
    from apps.products.serializers import ProductListSerializer
    from apps.products.models import Product
    products = ProductListSerializer(many=True, read_only=True)
    product_ids = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        write_only=True,
        many=True,
        source='products'
    )

    class Meta:
        model = UserWishlist
        fields = ['id', 'products', 'product_ids', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with user data - accepts username or email"""

    def validate(self, attrs):
        username_or_email = attrs.get('username')

        # Try to find user by email if username lookup fails
        try:
            user = User.objects.get(email=username_or_email)
            attrs['username'] = user.username
        except User.DoesNotExist:
            pass  # Use the username as-is

        data = super().validate(attrs)

        # Add user data to response
        user_serializer = UserSerializer(self.user)
        data['user'] = user_serializer.data

        return data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    """Custom token refresh serializer"""
    pass


class UserRegistrationResponseSerializer(serializers.Serializer):
    """Registration response with tokens"""
    user = UserSerializer(read_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)


class OTPSendSerializer(serializers.Serializer):
    """Serializer for sending OTP - works for both login and registration"""
    email = serializers.EmailField(required=True)
    purpose = serializers.ChoiceField(
        choices=['login', 'register'],
        default='login',
        required=False
    )

    def validate_email(self, value):
        # For registration, email should NOT exist
        # For login, email SHOULD exist
        # We validate this in the view based on purpose
        return value


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for verifying OTP"""
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(min_length=6, max_length=6, required=True)


class GoogleSocialAuthSerializer(serializers.Serializer):
    """Serializer for Google social auth"""
    id_token = serializers.CharField(required=True)


class FacebookSocialAuthSerializer(serializers.Serializer):
    """Serializer for Facebook social auth"""
    access_token = serializers.CharField(required=True)
