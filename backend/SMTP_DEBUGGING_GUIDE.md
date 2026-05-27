# SMTP Connection Debugging Guide

## Issue
Getting "Connection unexpectedly closed" errors when trying to send OTP emails via Gmail SMTP.

## Root Causes
This typically happens due to:
1. **Invalid Gmail credentials** - App password is wrong or expired
2. **Account security issues** - Gmail blocking the connection
3. **Network/Firewall issues** - Port 587 being blocked
4. **Antivirus/SSL scanning** - Avast, McAfee, etc. intercepting SSL
5. **Configuration issues** - Wrong port, TLS settings, etc.

## Diagnosis Steps (Run in Order)

### Step 1: Test Raw SMTP Connection (No Django)
```bash
cd backend
python test_smtp_connection.py
```

**Expected Output:**
- ✓ SSL context created
- ✓ Connected to smtp.gmail.com:587
- ✓ STARTTLS successful
- ✓ Authentication successful

**If this fails:**
- **Auth error** → Gmail credentials are wrong
- **Connection error** → Network/firewall/antivirus issue
- **SSL error** → Antivirus intercepting SSL

### Step 2: Test Django Email Backend
```bash
cd backend
python manage.py test_email_backend
```

**Expected Output:**
- ✓ Connection successful!
- ✓ Test email sent successfully!

**If this fails but Step 1 succeeds:**
- Django backend configuration issue
- Check .env file for extra spaces/typos

### Step 3: Check Django Logs
```bash
# In a separate terminal
tail -f backend/logs/django.log
```

Look for:
- `SMTP connection established` ← Good sign
- `SMTP Authentication failed` ← Credentials wrong
- `Connection unexpectedly closed` ← Network/firewall/antivirus issue

### Step 4: Test OTP API Endpoint
```bash
curl -X POST http://localhost:8000/api/v1/auth/otp/send/ \
  -H "Content-Type: application/json" \
  -d '{"email":"josephnyatefe22@gmail.com"}'
```

## Common Solutions

### Solution 1: Gmail App Password
Gmail's 2FA requires using an **app-specific password**, not your regular password.

**Steps:**
1. Enable 2FA on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password (Gmail removes spaces automatically)
5. Update .env: `EMAIL_HOST_PASSWORD=<paste-here>`
6. Restart Django

### Solution 2: Check Gmail Security Alerts
1. Go to: https://myaccount.google.com/security
2. Look for "Recent security events"
3. Check "Connected apps & sites" - allow if needed
4. Check "Less secure app access" - NOT needed with app passwords

### Solution 3: Firewall/Antivirus Issues
**Windows with Avast/McAfee:**
1. Check Antivirus settings for "SSL/TLS scanning"
2. Temporarily disable it
3. Try sending email again
4. If it works, add Django to antivirus exceptions

**Or use Gmail's SMTP over SSL (port 465):**
- Update .env:
  ```
  EMAIL_PORT=465
  EMAIL_USE_TLS=False
  EMAIL_USE_SSL=True
  ```

### Solution 4: Network/ISP Issues
- Test from mobile hotspot (different network)
- Use VPN if ISP blocks port 587
- Contact ISP if needed

## Configuration Check

### Current Settings (.env)
```
EMAIL_BACKEND=apps.users.email_backend.CertifiEmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=josephnyatefe22@gmail.com
EMAIL_FROM=josephnyatefe22@gmail.com
EMAIL_HOST_PASSWORD=iovv ddcw kkar qlsi  ← Check this!
EMAIL_TIMEOUT=45
```

### Verify Your Credentials
1. Login to Gmail: https://myaccount.google.com
2. Check email address is exactly: `josephnyatefe22@gmail.com`
3. Verify you have 2FA enabled
4. Get app password from: https://myaccount.google.com/apppasswords

## Email Backend Changes

The updated `CertifiEmailBackend` now:
- ✓ Strips whitespace from credentials
- ✓ Uses exponential backoff (5s → 10s → 15s)
- ✓ Better error logging and debugging
- ✓ Separates auth errors from connection errors
- ✓ Handles SSL/TLS properly on dev and production
- ✓ Timeout increased to 45 seconds

## Next Steps

If issues persist after trying all solutions:
1. Collect logs from `test_smtp_connection.py` output
2. Collect logs from `test_email_backend` management command
3. Check Django error logs with detailed SMTP errors
4. Consider using a different email service (SendGrid, Mailgun, AWS SES)

## Alternative Email Services (If Gmail doesn't work)

### SendGrid (Recommended)
- Free tier: 100 emails/day
- Setup: https://app.sendgrid.com/settings/api_keys
- Update .env:
  ```
  EMAIL_BACKEND=sendgrid_backend.SendgridBackend
  SENDGRID_API_KEY=<your-key>
  ```

### Mailgun
- Free tier: 5,000 emails/month
- Easy SMTP setup
- https://www.mailgun.com

### AWS SES
- Very affordable
- Production-grade reliability
- Requires AWS account setup

