import ssl
import certifi

from django.conf import settings
from django.core.mail.backends.smtp import EmailBackend
from django.utils.functional import cached_property


class CertifiEmailBackend(EmailBackend):
    """
    Custom SMTP email backend that handles SSL certificate verification
    robustly across different environments.

    - In development (DEBUG=True): Disables certificate verification because
      local security software (e.g. Avast Antivirus SSL/TLS scanning) often
      intercepts and replaces certificates with self-signed ones.
    - In production (DEBUG=False): Uses certifi's well-maintained CA bundle
      for proper certificate verification instead of the Windows system CA
      store (which has known issues with Python 3.13+ and OpenSSL 3.0).
    """

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
