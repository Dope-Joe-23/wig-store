import ssl
import certifi
import smtplib
import logging
import time
import socket

from django.conf import settings
from django.core.mail.backends.smtp import EmailBackend
from django.utils.functional import cached_property

logger = logging.getLogger(__name__)


class CertifiEmailBackend(EmailBackend):
    """
    Custom SMTP email backend that handles SSL certificate verification
    robustly across different environments, with retry logic for transient failures.

    - In development (DEBUG=True): Disables certificate verification because
      local security software (e.g. Avast Antivirus SSL/TLS scanning) often
      intercepts and replaces certificates with self-signed ones.
    - In production (DEBUG=False): Uses certifi's well-maintained CA bundle
      for proper certificate verification instead of the Windows system CA
      store (which has known issues with Python 3.13+ and OpenSSL 3.0).
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Get timeout from settings, default to 45 seconds (increased for SSL handshake)
        self.timeout = getattr(settings, 'EMAIL_TIMEOUT', 45)
        self.max_retries = 3
        self.retry_delay = 5  # seconds - increased from 2 to avoid Gmail rate limiting
        
        # Strip whitespace from credentials (Gmail app passwords have spaces)
        if self.username:
            self.username = self.username.strip()
        if self.password:
            self.password = self.password.strip()
        
        # Ensure EMAIL_USE_SSL is properly set (Django might not read it by default)
        # Port 465 requires SSL; port 587 uses STARTTLS
        if self.port == 465 and not self.use_ssl:
            self.use_ssl = True
            self.use_tls = False
        
        logger.debug(f'Email backend initialized: host={self.host}, port={self.port}, '
                    f'use_tls={self.use_tls}, use_ssl={self.use_ssl}, '
                    f'username={self.username[:5] if self.username else "None"}..., timeout={self.timeout}s')

    @cached_property
    def ssl_context(self):
        if self.ssl_certfile or self.ssl_keyfile:
            ctx = ssl.SSLContext(protocol=ssl.PROTOCOL_TLS_CLIENT)
            ctx.load_cert_chain(self.ssl_certfile, self.ssl_keyfile)
            return ctx

        if settings.DEBUG:
            # Development: skip verification (security software like Avast
            # intercepts SSL connections with self-signed certs)
            ctx = ssl.SSLContext(protocol=ssl.PROTOCOL_TLS_CLIENT)
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            return ctx

        # Production: use certifi's CA bundle for proper verification
        # Avoids Python 3.13+ Windows system CA store issues
        return ssl.create_default_context(cafile=certifi.where())

    def open(self):
        """
        Attempt to open SMTP connection with retry logic for transient failures.
        Handles "Connection unexpectedly closed" and SSL certificate errors gracefully.
        """
        if self.connection is not None:
            try:
                # Test the existing connection
                self.connection.noop()
                return False
            except Exception:
                # Connection is dead, close and reconnect
                try:
                    self.connection.close()
                except Exception:
                    pass
                self.connection = None

        connection_kwargs = {
            'timeout': self.timeout,
        }

        for attempt in range(self.max_retries):
            try:
                logger.debug(f'SMTP connection attempt {attempt + 1}/{self.max_retries} to {self.host}:{self.port}')
                
                if self.use_ssl:
                    logger.debug(f'Connecting with SMTP_SSL (port {self.port})...')
                    self.connection = smtplib.SMTP_SSL(
                        self.host,
                        self.port,
                        context=self.ssl_context,
                        **connection_kwargs
                    )
                else:
                    logger.debug(f'Connecting with SMTP (port {self.port})...')
                    self.connection = smtplib.SMTP(
                        self.host,
                        self.port,
                        **connection_kwargs
                    )
                    if self.use_tls:
                        logger.debug(f'Initiating STARTTLS...')
                        self.connection.starttls(context=self.ssl_context)

                logger.debug(f'Attempting authentication as {self.username}...')
                if self.username:
                    self.connection.login(self.username, self.password)
                
                logger.info(f'✓ SMTP connection successfully established to {self.host}:{self.port}')
                return True

            except smtplib.SMTPAuthenticationError as e:
                logger.error(f'SMTP Authentication failed for {self.username}: {e}')
                if self.connection is not None:
                    try:
                        self.connection.close()
                    except Exception:
                        pass
                    self.connection = None
                # Don't retry on auth errors - they won't succeed on retry
                raise

            except smtplib.SMTPException as e:
                logger.warning(f'SMTP error on attempt {attempt + 1}/{self.max_retries}: {e}')
                if self.connection is not None:
                    try:
                        self.connection.close()
                    except Exception:
                        pass
                    self.connection = None
                
                if attempt < self.max_retries - 1:
                    wait_time = self.retry_delay * (attempt + 1)
                    logger.info(f'Retrying SMTP connection in {wait_time}s...')
                    time.sleep(wait_time)
                else:
                    logger.error(f'SMTP error after {self.max_retries} attempts: {e}')
                    raise

            except (OSError, socket.error, ssl.SSLError) as e:
                logger.warning(f'Connection error on attempt {attempt + 1}/{self.max_retries}: {type(e).__name__}: {e}')
                if self.connection is not None:
                    try:
                        self.connection.close()
                    except Exception:
                        pass
                    self.connection = None
                
                if attempt < self.max_retries - 1:
                    wait_time = self.retry_delay * (attempt + 1)
                    logger.info(f'Retrying SMTP connection in {wait_time}s...')
                    time.sleep(wait_time)
                else:
                    logger.error(f'Failed to establish SMTP connection after {self.max_retries} attempts: {e}')
                    raise

        return False

    def close(self):
        """Close the SMTP connection gracefully."""
        if self.connection is None:
            return
        try:
            try:
                self.connection.quit()
            except (smtplib.SMTPServerDisconnected, OSError):
                # Server disconnected already, just close the socket
                self.connection.close()
        except Exception as e:
            logger.warning(f'Error closing SMTP connection: {e}')
        finally:
            self.connection = None

