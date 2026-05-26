import ssl
import certifi
import smtplib
import logging
import time

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
        # Get timeout from settings, default to 30 seconds
        self.timeout = getattr(settings, 'EMAIL_TIMEOUT', 30)
        self.max_retries = 3
        self.retry_delay = 2  # seconds

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
            return False

        connection_kwargs = {
            'timeout': self.timeout,
        }

        for attempt in range(self.max_retries):
            try:
                if self.use_ssl:
                    self.connection = smtplib.SMTP_SSL(
                        self.host,
                        self.port,
                        context=self.ssl_context,
                        **connection_kwargs
                    )
                else:
                    self.connection = smtplib.SMTP(
                        self.host,
                        self.port,
                        **connection_kwargs
                    )
                    if self.use_tls:
                        self.connection.starttls(context=self.ssl_context)

                if self.username:
                    self.connection.login(self.username, self.password)

                logger.debug(f'SMTP connection established to {self.host}:{self.port}')
                return True

            except (smtplib.SMTPException, OSError, ssl.SSLError) as e:
                logger.warning(
                    f'SMTP connection attempt {attempt + 1}/{self.max_retries} failed: {e}'
                )
                if self.connection is not None:
                    try:
                        self.connection.quit()
                    except Exception:
                        pass
                    self.connection = None

                if attempt < self.max_retries - 1:
                    logger.info(f'Retrying SMTP connection in {self.retry_delay}s...')
                    time.sleep(self.retry_delay)
                else:
                    logger.error(
                        f'Failed to establish SMTP connection after {self.max_retries} attempts: {e}'
                    )
                    raise

        return False

