from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
import logging
import time

logger = logging.getLogger(__name__)


def send_otp_email(email: str, code: str, purpose: str = 'login') -> bool:
    """
    Send OTP verification code via email with retry logic.

    Args:
        email: Recipient email address
        code: 6-digit OTP code
        purpose: 'login' or 'register'

    Returns:
        True if email was sent successfully, False otherwise
    """
    subject = 'Your Affordable Hair and More Verification Code'
    purpose_label = 'Sign In' if purpose == 'login' else 'Email Verification'
    max_retries = 3
    initial_retry_delay = 5  # seconds

    for attempt in range(max_retries):
        try:
            html_message = render_to_string('emails/otp_email.html', {
                'code': code,
                'purpose': purpose,
                'year': timezone.now().year,
            })

            send_mail(
                subject=f'{subject} - {purpose_label}',
                message=f'Your Affordable Hair and More verification code is: {code}\n\n'
                        f'This code expires in 10 minutes.\n\n'
                        f'If you didn\'t request this, you can ignore this email.',
                from_email=settings.EMAIL_FROM,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f'OTP email sent successfully to {email} for {purpose}')
            return True
        except Exception as e:
            error_msg = str(e)
            logger.warning(
                f'OTP email attempt {attempt + 1}/{max_retries} failed for {email}: {error_msg}'
            )

            # Don't retry on authentication/configuration errors
            if any(err_type in error_msg for err_type in ['username', 'password', 'auth', 'SMTP 5']):
                logger.error(f'OTP email authentication error (not retrying): {error_msg}')
                break

            # Don't retry on invalid email
            if any(err_type in error_msg for err_type in ['invalid', 'malformed']):
                logger.error(f'OTP email validation error: {error_msg}')
                break

            if attempt < max_retries - 1:
                # Exponential backoff: 5s, 10s, 15s
                wait_time = initial_retry_delay * (attempt + 1)
                logger.info(f'Retrying email send in {wait_time}s (attempt {attempt + 1}/{max_retries})...')
                time.sleep(wait_time)
            else:
                logger.error(f'Failed to send OTP email to {email} after {max_retries} attempts: {error_msg}')

    return False

    return False

