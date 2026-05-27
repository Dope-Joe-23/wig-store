#!/usr/bin/env python
"""
Test Gmail SMTP on different ports and configurations
Helps identify firewall/antivirus blocking issues
"""
import smtplib
import ssl
import socket
import time

GMAIL_EMAIL = 'josephnyatefe22@gmail.com'
GMAIL_PASSWORD = 'iovv ddcw kkar qlsi'

# Strip whitespace
GMAIL_PASSWORD = GMAIL_PASSWORD.strip()

TESTS = [
    {
        'name': 'Port 587 with STARTTLS (current)',
        'host': 'smtp.gmail.com',
        'port': 587,
        'use_ssl': False,
        'use_tls': True,
    },
    {
        'name': 'Port 465 with SMTP_SSL (alternative)',
        'host': 'smtp.gmail.com',
        'port': 465,
        'use_ssl': True,
        'use_tls': False,
    },
    {
        'name': 'Port 25 with STARTTLS (rarely works)',
        'host': 'smtp.gmail.com',
        'port': 25,
        'use_ssl': False,
        'use_tls': True,
    },
]

def test_port(config):
    """Test a single configuration"""
    name = config['name']
    host = config['host']
    port = config['port']
    use_ssl = config['use_ssl']
    use_tls = config['use_tls']
    
    print(f"\n{'='*70}")
    print(f"Testing: {name}")
    print(f"{'='*70}")
    print(f"Host: {host}:{port}")
    print(f"Use SSL: {use_ssl}, Use TLS: {use_tls}")
    print('-' * 70)
    
    try:
        # Step 1: Test basic connectivity
        print("[1/4] Testing basic network connectivity...")
        sock = socket.create_connection((host, port), timeout=10)
        print(f"✓ TCP connection successful to {host}:{port}")
        sock.close()
        time.sleep(0.5)
        
        # Step 2: Create SSL context
        print("[2/4] Creating SSL context...")
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        print("✓ SSL context created")
        
        # Step 3: Connect to SMTP
        print("[3/4] Connecting to SMTP server...")
        if use_ssl:
            conn = smtplib.SMTP_SSL(host, port, context=ctx, timeout=10)
            print(f"✓ SMTP_SSL connection successful")
        else:
            conn = smtplib.SMTP(host, port, timeout=10)
            print(f"✓ SMTP connection successful")
            
            if use_tls:
                print("[3b/4] Initiating STARTTLS...")
                conn.starttls(context=ctx)
                print("✓ STARTTLS successful")
        
        # Step 4: Authenticate
        print("[4/4] Authenticating...")
        conn.login(GMAIL_EMAIL, GMAIL_PASSWORD)
        print(f"✓ Authentication successful as {GMAIL_EMAIL}")
        
        conn.quit()
        
        print(f"\n✓ SUCCESS with {name}!")
        return True
        
    except socket.timeout:
        print(f"✗ TIMEOUT: Connection timed out at TCP level")
        print("   → Likely firewall/ISP blocking this port")
        return False
        
    except ConnectionRefusedError:
        print(f"✗ CONNECTION REFUSED: Server not accepting connections on this port")
        print("   → Port is likely blocked or Gmail doesn't listen on this port")
        return False
        
    except ConnectionResetError as e:
        print(f"✗ CONNECTION RESET: {e}")
        print("   → Firewall/antivirus likely blocking this")
        return False
        
    except smtplib.SMTPServerDisconnected as e:
        print(f"✗ SERVER DISCONNECTED: {e}")
        print("   → Server disconnected unexpectedly (firewall/antivirus intercept)")
        return False
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"✗ AUTHENTICATION FAILED: {e}")
        print("   → Credentials are wrong, but connection worked!")
        return False
        
    except smtplib.SMTPException as e:
        print(f"✗ SMTP ERROR: {e}")
        return False
        
    except ssl.SSLError as e:
        print(f"✗ SSL ERROR: {e}")
        print("   → Antivirus SSL inspection or cert issue")
        return False
        
    except Exception as e:
        print(f"✗ ERROR: {type(e).__name__}: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("GMAIL SMTP MULTI-PORT TEST")
    print("="*70)
    print(f"Testing different ports and configurations...")
    print(f"This helps identify firewall/antivirus blocking issues.\n")
    
    results = []
    for config in TESTS:
        success = test_port(config)
        results.append({
            'name': config['name'],
            'port': config['port'],
            'success': success
        })
        time.sleep(1)  # Brief delay between tests
    
    # Summary
    print(f"\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    if successful:
        print(f"\n✓ SUCCESSFUL CONFIGURATIONS ({len(successful)}):")
        for r in successful:
            print(f"  • {r['name']} (port {r['port']})")
        
        print(f"\n→ Use the first successful configuration in .env")
        if successful[0]['port'] == 465:
            print(f"\nRECOMMENDED .env SETTINGS:")
            print(f"  EMAIL_PORT=465")
            print(f"  EMAIL_USE_TLS=False")
            print(f"  EMAIL_USE_SSL=True")
        
    else:
        print(f"\n✗ NO CONFIGURATIONS WORKED")
        print(f"\nThis indicates:")
        print(f"  1. Gmail credentials are invalid")
        print(f"  2. Network/firewall is blocking SMTP ports")
        print(f"  3. ISP is blocking outbound SMTP")
        print(f"  4. Antivirus is blocking connections")
        print(f"\nNEXT STEPS:")
        print(f"  1. Check Windows Defender Firewall")
        print(f"  2. Check if antivirus (Avast, McAfee, etc.) is blocking SMTP")
        print(f"  3. Try from a different network (mobile hotspot)")
        print(f"  4. Contact ISP if issue persists")
        print(f"  5. Use SendGrid/Mailgun as email service instead")

if __name__ == '__main__':
    main()
