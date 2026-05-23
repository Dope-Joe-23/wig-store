from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from decouple import config

ADMIN_URL = config('ADMIN_URL', default='portal')

urlpatterns = [
    path(f'{ADMIN_URL}/', admin.site.urls),
    path('api/v1/dashboard/', include('apps.dashboard.urls', namespace='dashboard')),
    path('api/payments/', include('apps.payments.urls', namespace='payments-public')),
    path('api/v1/auth/', include('apps.users.urls', namespace='auth')),
    path('api/v1/products/', include('apps.products.urls', namespace='products')),
    path('api/v1/orders/', include('apps.orders.urls', namespace='orders')),
    path('api/v1/payments/', include('apps.payments.urls', namespace='payments')),
    path('api/v1/shipping/', include('apps.shipping.urls', namespace='shipping')),
    path('api/v1/reviews/', include('apps.reviews.urls', namespace='reviews')),
    path('api/v1/analytics/', include('apps.analytics.urls', namespace='analytics')),
    path('api/v1/customization/', include('apps.customization.urls', namespace='customization')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
