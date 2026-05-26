import hashlib
import hmac
import logging
import uuid
from decimal import Decimal

import requests
from django.conf import settings
from django.db import models, transaction
from django.utils.dateparse import parse_datetime
from django.utils import timezone

from apps.products.models import Product
from apps.orders.models import Order
from .models import Payment

logger = logging.getLogger(__name__)


class PaystackError(Exception):
    """Raised when Paystack cannot initialize or verify a transaction."""


PAYSTACK_BASE_URL = 'https://api.paystack.co'
PAYSTACK_TIMEOUT_SECONDS = 15


def generate_reference() -> str:
    return f"PSK-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex}"


def amount_to_pesewas(amount: Decimal) -> int:
    return int((Decimal(amount).quantize(Decimal('0.01')) * 100).to_integral_value())


def paystack_headers() -> dict:
    if not settings.PAYSTACK_SECRET_KEY:
        raise PaystackError('Paystack secret key is not configured.')

    return {
        'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
        'Content-Type': 'application/json',
    }


def normalize_payment_method(channel, authorization=None) -> str:
    authorization = authorization or {}
    bank = (authorization.get('bank') or '').lower()

    if channel == 'card':
        return 'card'
    if channel == 'mobile_money':
        if 'mtn' in bank:
            return 'mtn_momo'
        if 'telecel' in bank or 'vodafone' in bank:
            return 'telecel_momo'
        if 'airtel' in bank or 'tigo' in bank:
            return 'airteltigo_momo'
        return 'mobile_money'
    return channel or 'paystack'


def initialize_transaction(*, order: Order, email: str, phone: str, amount: Decimal, payment_method: str) -> Payment:
    if order.payment_status == 'paid':
        raise PaystackError('This order has already been paid.')

    if Decimal(amount).quantize(Decimal('0.01')) != order.total.quantize(Decimal('0.01')):
        raise PaystackError('Payment amount does not match the order total.')

    reference = generate_reference()
    channels = ['card'] if payment_method == 'card' else ['mobile_money']

    payload = {
        'email': email,
        'amount': amount_to_pesewas(order.total),
        'currency': 'GHS',
        'reference': reference,
        'channels': channels,
        'callback_url': settings.PAYSTACK_CALLBACK_URL,
        'metadata': {
            'order_id': order.id,
            'order_number': order.order_number,
            'phone': phone,
            'requested_payment_method': payment_method,
        },
    }

    response = requests.post(
        f'{PAYSTACK_BASE_URL}/transaction/initialize',
        json=payload,
        headers=paystack_headers(),
        timeout=PAYSTACK_TIMEOUT_SECONDS,
    )

    try:
        body = response.json()
    except ValueError as exc:
        logger.exception('Paystack initialize returned invalid JSON for order %s', order.id)
        raise PaystackError('Payment provider returned an invalid response.') from exc

    if response.status_code >= 400 or not body.get('status'):
        logger.warning('Paystack initialize failed for order %s: %s', order.id, body)
        raise PaystackError(body.get('message', 'Unable to initialize payment.'))

    with transaction.atomic():
        payment, _ = Payment.objects.update_or_create(
            order=order,
            defaults={
                'user': order.user,
                'amount': order.total,
                'currency': 'GHS',
                'provider': 'paystack',
                'payment_method': payment_method,
                'status': 'pending',
                'reference': reference,
                'phone_number': phone,
                'network_operator': payment_method,
            },
        )
        order.payment_reference = reference
        order.payment_status = 'pending'
        order.save(update_fields=['payment_reference', 'payment_status', 'updated_at'])

    payment.authorization_url = body['data']['authorization_url']
    return payment


def verify_transaction(reference: str) -> dict:
    response = requests.get(
        f'{PAYSTACK_BASE_URL}/transaction/verify/{reference}',
        headers=paystack_headers(),
        timeout=PAYSTACK_TIMEOUT_SECONDS,
    )

    try:
        body = response.json()
    except ValueError as exc:
        logger.exception('Paystack verify returned invalid JSON for reference %s', reference)
        raise PaystackError('Payment provider returned an invalid response.') from exc

    if response.status_code >= 400 or not body.get('status'):
        logger.warning('Paystack verify failed for reference %s: %s', reference, body)
        raise PaystackError(body.get('message', 'Unable to verify payment.'))

    return body['data']


def complete_verified_payment(reference: str, transaction_data: dict) -> Payment:
    status = transaction_data.get('status')
    provider_reference = transaction_data.get('reference')

    if status != 'success' or provider_reference != reference:
        raise PaystackError('Payment was not successful.')

    with transaction.atomic():
        payment = Payment.objects.select_for_update().select_related('order').get(reference=reference)
        order = Order.objects.select_for_update().get(id=payment.order_id)
        expected_amount = amount_to_pesewas(order.total)

        if int(transaction_data.get('amount') or 0) != expected_amount:
            logger.error(
                'Paystack amount mismatch for reference %s. Expected %s, got %s',
                reference,
                expected_amount,
                transaction_data.get('amount'),
            )
            payment.status = 'failed'
            payment.save(update_fields=['status', 'updated_at'])
            raise PaystackError('Payment amount does not match the order total.')

        if payment.status == 'completed' and order.payment_status == 'paid':
            return payment

        # If payment had failed before, stock was restored by mark_failed_payment.
        # Re-decrement it now since the payment is confirmed.
        was_previously_failed = payment.status == 'failed'

        authorization = transaction_data.get('authorization') or {}
        paid_at_value = (
            transaction_data.get('paid_at')
            or transaction_data.get('paidAt')
            or transaction_data.get('created_at')
            or transaction_data.get('createdAt')
        )

        payment.status = 'completed'
        payment.provider = 'paystack'
        payment.currency = transaction_data.get('currency') or payment.currency
        payment.payment_method = normalize_payment_method(transaction_data.get('channel'), authorization)
        payment.transaction_id = str(transaction_data.get('id') or transaction_data.get('transaction_id') or '') or None
        payment.paid_at = parse_datetime(paid_at_value) if paid_at_value else timezone.now()
        payment.save(
            update_fields=[
                'status', 'provider', 'currency', 'payment_method', 'transaction_id',
                'paid_at', 'updated_at'
            ]
        )

        # If payment had failed before, stock was restored by mark_failed_payment.
        # Re-decrement it now that the payment is confirmed.
        if was_previously_failed:
            for item in order.items.all():
                Product.objects.filter(id=item.product_id).update(
                    stock_quantity=models.F('stock_quantity') - item.quantity
                )

        order.payment_status = 'paid'
        order.payment_reference = reference
        order.status = 'confirmed'
        order.save(update_fields=['payment_status', 'payment_reference', 'status', 'updated_at'])

    return payment


def mark_failed_payment(reference: str, reason: str = '') -> None:
    from apps.orders.models import OrderItem

    with transaction.atomic():
        payment = Payment.objects.select_for_update().filter(reference=reference).first()
        if not payment:
            Payment.objects.filter(reference=reference).update(status='failed', notes=reason)
            Order.objects.filter(payment_reference=reference).update(payment_status='pending')
            return

        payment.status = 'failed'
        payment.notes = reason
        payment.save(update_fields=['status', 'notes', 'updated_at'])

        # Restore product stock from unresolvable failed payments
        if payment.order:
            order = Order.objects.select_for_update().get(id=payment.order_id)
            order.payment_status = 'pending'
            order.save(update_fields=['payment_status', 'updated_at'])

            # Only restore stock if the order has NOT been cancelled (which already restores stock)
            if order.status != 'cancelled':
                items = OrderItem.objects.filter(order=order).select_related('product')
                for item in items:
                    Product.objects.filter(id=item.product_id).update(
                        stock_quantity=models.F('stock_quantity') + item.quantity
                    )


def validate_webhook_signature(raw_body: bytes, signature: str) -> bool:
    secret = settings.PAYSTACK_WEBHOOK_SECRET or settings.PAYSTACK_SECRET_KEY
    if not secret or not signature:
        return False

    digest = hmac.new(secret.encode('utf-8'), raw_body, hashlib.sha512).hexdigest()
    return hmac.compare_digest(digest, signature)
