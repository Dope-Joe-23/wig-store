#!/usr/bin/env python
"""
Django management command to test the email backend
Run with: python manage.py test_email_backend
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test the email backend connection and send a test email'

    def add_arguments(self, parser):
        parser.add_argument(
            '--recipient',
            type=str,
            default=settings.EMAIL_HOST_USER,
            help='Email recipient for test email'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 70))
        self.stdout.write(self.style.SUCCESS('DJANGO EMAIL BACKEND TEST'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        
        recipient = options['recipient']
        
        self.stdout.write(f'\nEmail Configuration:')
        self.stdout.write(f'  Backend: {settings.EMAIL_BACKEND}')
        self.stdout.write(f'  Host: {settings.EMAIL_HOST}')
        self.stdout.write(f'  Port: {settings.EMAIL_PORT}')
        self.stdout.write(f'  Use TLS: {settings.EMAIL_USE_TLS}')
        self.stdout.write(f'  Use SSL: {settings.EMAIL_USE_SSL}')
        self.stdout.write(f'  From: {settings.EMAIL_FROM}')
        self.stdout.write(f'  Recipient: {recipient}')
        self.stdout.write(f'  Timeout: {getattr(settings, "EMAIL_TIMEOUT", 30)}s')
        
        self.stdout.write('\n' + '-' * 70)
        
        try:
            self.stdout.write('\n[1/2] Attempting to establish SMTP connection...')
            
            from django.core.mail import get_connection
            connection = get_connection()
            connection.open()
            
            self.stdout.write(self.style.SUCCESS('✓ Connection successful!'))
            connection.close()
            
            self.stdout.write('\n[2/2] Sending test email...')
            
            send_mail(
                subject='Test Email from Wiggle Backend',
                message='This is a test email from the Django email backend.',
                from_email=settings.EMAIL_FROM,
                recipient_list=[recipient],
                html_message='<p>This is a <strong>test email</strong> from the Django email backend.</p>',
                fail_silently=False,
            )
            
            self.stdout.write(self.style.SUCCESS('✓ Test email sent successfully!'))
            self.stdout.write('\n' + '-' * 70)
            self.stdout.write(self.style.SUCCESS('\n✓ EMAIL BACKEND IS WORKING!\n'))
            
        except Exception as e:
            self.stdout.write('\n' + '-' * 70)
            self.stdout.write(self.style.ERROR(f'\n✗ ERROR: {type(e).__name__}'))
            self.stdout.write(self.style.ERROR(f'   {e}\n'))
            
            self.stdout.write('Debugging tips:')
            self.stdout.write('  1. Check logs with: tail -f logs/django.log')
            self.stdout.write('  2. Run direct SMTP test: python test_smtp_connection.py')
            self.stdout.write('  3. Verify .env credentials are correct and have no typos')
            self.stdout.write('  4. Check for Gmail security alerts at:')
            self.stdout.write('     https://myaccount.google.com/security')
