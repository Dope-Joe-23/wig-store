#!/usr/bin/env python
"""
Direct SMTP connection test for Gmail - bypass Django settings
Helps diagnose connection issues before trying to send through Django
"""
import os
import sys
import smtplib
import ssl
import certifi

# Gmail SMTP Configuration
GMAIL_SMTP_HOST = 'smtp.gmail.com'
GMAIL_SMTP_PORT = 587  # TLS port
GMAIL_EMAIL = 'josephnyatefe22@gmail.com'
GMAIL_APP_PASSWORD = 'iovv ddcw kkar qlsi'  # App-specific password from .env

def test_smtp_connection():
    print("=" * 70)
    print("GMAIL SMTP CONNECTION TEST")
    print("=" * 70)
    print(f"\nConfiguration:")
    print(f"  Host: {GMAIL_SMTP_HOST}")
    print(f"  Port: {GMAIL_SMTP_PORT}")
    print(f"  Email: {GMAIL_EMAIL}")
    print(f"  Password: {'*' * len(GMAIL_APP_PASSWORD)}")
    print(f"  Timeout: 45 seconds")
    print("\n" + "-" * 70)
    
    try:
        print("\n[1/4] Creating SSL context (disabling cert verification for dev)...")
        ctx = ssl.SSLContext(protocol=ssl.PROTOCOL_TLS_CLIENT)
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        print("✓ SSL context created")
        
        print("\n[2/4] Connecting to SMTP server...")
        connection = smtplib.SMTP(GMAIL_SMTP_HOST, GMAIL_SMTP_PORT, timeout=45)
        print(f"✓ Connected to {GMAIL_SMTP_HOST}:{GMAIL_SMTP_PORT}")
        
        print("\n[3/4] Initiating STARTTLS...")
        connection.starttls(context=ctx)
        print("✓ STARTTLS successful")
        
        print("\n[4/4] Authenticating...")
        # Strip whitespace from password (Gmail app passwords have spaces)
        password = GMAIL_APP_PASSWORD.strip()
        connection.login(GMAIL_EMAIL, password)
        print(f"✓ Authentication successful as {GMAIL_EMAIL}")
        
        print("\n" + "-" * 70)
        print("\n✓ SUCCESS! Gmail SMTP connection is working.\n")
        print("The issue is likely in Django's email backend configuration.")
        print("Check the following:")
        print("  1. Verify EMAIL_HOST_PASSWORD in .env is exactly the app password")
        print("  2. Check that 2FA is enabled on the Gmail account")
        print("  3. Ensure 'Less secure app access' is NOT enabled (not needed with app password)")
        print("  4. Check Gmail's 'Security' settings for any 'Suspicious login attempt' blocks")
        
        connection.quit()
        
    except smtplib.SMTPAuthenticationError as e:
        print("\n" + "-" * 70)
        print(f"\n✗ AUTHENTICATION FAILED: {e}")
        print("\nPossible causes:")
        print("  1. Gmail app password is incorrect or expired")
        print("  2. 2FA is not enabled on the Gmail account")
        print("  3. Email address in .env is incorrect")
        print("  4. Gmail is blocking the connection (check your Gmail security alerts)")
        print("\nAction items:")
        print("  1. Generate a NEW app password from Gmail:")
        print("     https://myaccount.google.com/apppasswords")
        print("  2. Ensure 2FA is enabled first")
        print("  3. Copy the 16-character password (without spaces) and set EMAIL_HOST_PASSWORD")
        
    except smtplib.SMTPException as e:
        print("\n" + "-" * 70)
        print(f"\n✗ SMTP ERROR: {e}")
        print("\nThis is usually a transient connection issue.")
        print("Try again in a few moments, or check:")
        print("  1. Your internet connection")
        print("  2. Firewall/antivirus blocking port 587")
        print("  3. Gmail server status")
        
    except (OSError, ssl.SSLError) as e:
        print("\n" + "-" * 70)
        print(f"\n✗ CONNECTION ERROR: {type(e).__name__}: {e}")
        print("\nThis could be caused by:")
        print("  1. Network/firewall blocking port 587")
        print("  2. Antivirus software intercepting SSL connections (Avast, etc.)")
        print("  3. ISP or network blocking SMTP")
        print("\nTroubleshooting:")
        print("  1. Test from another network (mobile hotspot)")
        print("  2. Temporarily disable antivirus SSL scanning")
        print("  3. Check if your ISP blocks SMTP")
        
    except Exception as e:
        print("\n" + "-" * 70)
        print(f"\n✗ UNEXPECTED ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_smtp_connection()
