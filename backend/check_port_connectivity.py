#!/usr/bin/env python
"""
Simple port connectivity test
Tests if ports are reachable at TCP level
"""
import socket
import sys

def check_port(host, port, timeout=5):
    """Test if a port is reachable"""
    try:
        sock = socket.create_connection((host, port), timeout=timeout)
        sock.close()
        return True, None
    except socket.timeout:
        return False, f"Timeout (port likely blocked or firewall)"
    except ConnectionRefusedError:
        return False, f"Connection refused (service not listening)"
    except ConnectionResetError:
        return False, f"Connection reset (firewall blocking)"
    except OSError as e:
        return False, str(e)

def main():
    print("\n" + "="*70)
    print("SMTP PORT CONNECTIVITY CHECK")
    print("="*70 + "\n")
    
    ports_to_check = [
        (25, 'SMTP (unencrypted)'),
        (587, 'SMTP with STARTTLS'),
        (465, 'SMTP with SSL'),
    ]
    
    host = 'smtp.gmail.com'
    print(f"Testing connectivity to {host}...\n")
    
    for port, description in ports_to_check:
        print(f"Port {port} ({description})...", end=' ', flush=True)
        success, error = check_port(host, port)
        
        if success:
            print(f"✓ REACHABLE")
        else:
            print(f"✗ BLOCKED: {error}")
    
    print("\n" + "="*70)
    print("INTERPRETATION:")
    print("="*70)
    print(f"""
✓ All ports reachable → Issue is authentication or Gmail config
✓ Only port 465 reachable → Use SMTP_SSL on port 465 in .env
✗ No ports reachable → Your network/firewall is blocking SMTP
                      Try:
                      1. Check Windows Defender Firewall
                      2. Disable antivirus temporarily
                      3. Try on mobile hotspot
                      4. Use different email service
""")

if __name__ == '__main__':
    main()
