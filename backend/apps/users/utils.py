from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


def send_otp_email(email: str, code: str, purpose: str = 'login') -> bool:
    """
    Send OTP verification code via email.

    Args:
        email: Recipient email address
        code: 6-digit OTP code
        purpose: 'login' or 'register'

    Returns:
        True if email was sent successfully, False otherwise
    """
    subject = 'Your Wiggle Verification Code'
    purpose_label = 'Sign In' if purpose == 'login' else 'Email Verification'

    try:
        html_message = render_to_string('emails/otp_email.html', {
            'code': code,
            'purpose': purpose,
            'year': timezone.now().year,
        })

        send_mail(
            subject=f'{subject} - {purpose_label}',
            message=f'Your Wiggle verification code is: {code}\n\n'
                    f'This code expires in 10 minutes.\n\n'
                    f'If you didn\'t request this, you can ignore this email.',
            from_email=settings.EMAIL_FROM,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f'OTP email sent to {email} for {purpose}')
        return True
    except Exception as e:
        logger.error(f'Failed to send OTP email to {email}: {e}')
        return False
