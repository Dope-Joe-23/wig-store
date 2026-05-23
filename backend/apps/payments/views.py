import json
import logging

from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from .models import Payment
from .serializers import PaymentInitializeSerializer, PaymentSerializer
from .services import (
    PaystackError,
    complete_verified_payment,
    initialize_transaction,
    mark_failed_payment,
    validate_webhook_signature,
    verify_transaction,
)

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only payment history for customers and staff."""

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.select_related('order', 'user').all()
        return Payment.objects.select_related('order', 'user').filter(user=self.request.user)


class PaymentInitializeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentInitializeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            order = Order.objects.get(id=data['order_id'])
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.user_id != request.user.id and not request.user.is_staff:
            return Response({'error': 'You cannot pay for this order.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            payment = initialize_transaction(
                order=order,
                email=data['email'],
                phone=data['phone'],
                amount=data['amount'],
                payment_method=data['payment_method'],
            )
        except PaystackError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception('Unexpected error initializing payment for order %s', order.id)
            return Response(
                {'error': 'Unable to initialize payment right now.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                'authorization_url': payment.authorization_url,
                'reference': payment.reference,
            },
            status=status.HTTP_201_CREATED,
        )


class PaymentVerifyAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, reference):
        try:
            payment = Payment.objects.select_related('order').get(reference=reference)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment reference not found.'}, status=status.HTTP_404_NOT_FOUND)

        if payment.user_id != request.user.id and not request.user.is_staff:
            return Response({'error': 'You cannot verify this payment.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            transaction_data = verify_transaction(reference)
            payment = complete_verified_payment(reference, transaction_data)
        except PaystackError as exc:
            mark_failed_payment(reference, str(exc))
            return Response(
                {
                    'reference': reference,
                    'status': 'failed',
                    'payment_status': 'pending',
                    'error': str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            logger.exception('Unexpected error verifying payment %s', reference)
            return Response(
                {
                    'reference': reference,
                    'status': 'pending',
                    'payment_status': payment.order.payment_status,
                    'error': 'Unable to verify payment right now.',
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                'reference': payment.reference,
                'status': payment.status,
                'order_id': payment.order_id,
                'order_number': payment.order.order_number,
                'payment_status': payment.order.payment_status,
                'amount': payment.amount,
            },
            status=status.HTTP_200_OK,
        )


@method_decorator(csrf_exempt, name='dispatch')
class PaystackWebhookAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_body = request.body
        signature = request.headers.get('x-paystack-signature', '')

        if not validate_webhook_signature(raw_body, signature):
            logger.warning('Rejected Paystack webhook with invalid signature')
            return Response({'error': 'Invalid signature.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = json.loads(raw_body.decode('utf-8'))
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON payload.'}, status=status.HTTP_400_BAD_REQUEST)

        event = payload.get('event')
        data = payload.get('data') or {}

        if event != 'charge.success':
            return Response({'message': 'Event ignored.'}, status=status.HTTP_200_OK)

        reference = data.get('reference')
        if not reference:
            return Response({'error': 'Missing transaction reference.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                payment = Payment.objects.select_for_update().get(reference=reference)
                if payment.status == 'completed':
                    return Response({'message': 'Payment already processed.'}, status=status.HTTP_200_OK)

            transaction_data = verify_transaction(reference)
            complete_verified_payment(reference, transaction_data)
        except Payment.DoesNotExist:
            logger.warning('Webhook received for unknown Paystack reference %s', reference)
            return Response({'error': 'Payment reference not found.'}, status=status.HTTP_404_NOT_FOUND)
        except PaystackError as exc:
            mark_failed_payment(reference, str(exc))
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception('Unexpected error processing webhook for reference %s', reference)
            return Response({'error': 'Webhook processing failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'Payment processed.'}, status=status.HTTP_200_OK)
