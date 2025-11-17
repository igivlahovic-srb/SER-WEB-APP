# 🛡️ Production Security Checklist

Comprehensive security guide for deploying Vibecode mobile app to production.

## ✅ Pre-Deployment Checklist

### 1. Dependencies & Vulnerabilities

- [ ] Run `bun run security:audit` to check for vulnerabilities
- [ ] Run `bun pm audit` and fix all HIGH and CRITICAL vulnerabilities
- [ ] Update all dependencies: `bun update`
- [ ] Review dependency licenses for compatibility
- [ ] Remove unused dependencies to reduce attack surface

```bash
# Run security audit
bun run security:audit

# Check for vulnerabilities
bun pm audit

# Update dependencies
bun update
```

### 2. Environment Variables & API Keys

- [ ] Verify `.env` file is in `.gitignore`
- [ ] Never commit API keys to git repository
- [ ] Use environment-specific `.env` files (`.env.production`, `.env.staging`)
- [ ] Rotate API keys before production deployment
- [ ] Use secret management services (AWS Secrets Manager, Azure Key Vault)
- [ ] Implement API key rotation policy (quarterly)

**Environment Variables Required:**
```bash
# OpenAI API
EXPO_PUBLIC_OPENAI_API_KEY=sk-...

# Anthropic API
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...

# Grok API
EXPO_PUBLIC_GROK_API_KEY=xai-...

# Web Portal URL (MUST be HTTPS in production)
EXPO_PUBLIC_WEB_PORTAL_URL=https://your-portal.com
```

### 3. HTTPS & Network Security

- [ ] **All API endpoints MUST use HTTPS in production**
- [ ] Verify SSL/TLS certificates are valid
- [ ] Implement certificate pinning for critical APIs
- [ ] Use TLS 1.2 or higher
- [ ] Disable HTTP fallback in production

**Check API URLs:**
```typescript
// ❌ NEVER in production
const API_URL = "http://api.example.com";

// ✅ ALWAYS use HTTPS
const API_URL = "https://api.example.com";
```

### 4. Authentication & Authorization

- [ ] Implement JWT token-based authentication (see `src/services/auth-service.ts`)
- [ ] Enable automatic token refresh
- [ ] Set appropriate token expiration (15-60 minutes for access tokens)
- [ ] Use refresh tokens with longer expiration (7-30 days)
- [ ] Implement secure session management
- [ ] Enable 2FA for admin users
- [ ] Hash passwords using bcrypt or Argon2 (never store plain text)
- [ ] Implement rate limiting on login attempts (5 attempts per 5 minutes)

**Current Implementation:**
```typescript
// Rate limiter for auth
authRateLimiter = 5 requests per 5 minutes

// Token refresh
AuthService.refreshAccessToken() - automatic on expiration
```

### 5. Data Encryption

- [ ] Use `SecureStorage` for sensitive data (see `src/utils/secure-storage.ts`)
- [ ] Encrypt passwords, API keys, tokens
- [ ] **PRODUCTION UPGRADE:** Replace XOR encryption with `expo-secure-store`
- [ ] Enable encryption at rest for databases
- [ ] Use HTTPS for encryption in transit

**Upgrade to Hardware Encryption (Production):**
```bash
# Install expo-secure-store
bun add expo-secure-store

# Replace src/utils/secure-storage.ts implementation
```

```typescript
// Production implementation
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('secure_token', token);
const token = await SecureStore.getItemAsync('secure_token');
```

### 6. Input Validation & Sanitization

- [ ] All user inputs are sanitized (implemented in `src/utils/security.ts`)
- [ ] Email validation enabled
- [ ] Phone number validation enabled
- [ ] URL validation enabled
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (React automatic escaping + sanitization)
- [ ] File upload validation (type, size, content)

**Usage:**
```typescript
import { InputSanitizer, InputValidator } from '../utils/security';

// Sanitize user input
const clean = InputSanitizer.sanitizeString(userInput);

// Validate email
if (!InputValidator.isValidEmail(email)) {
  // Show error
}
```

### 7. Rate Limiting & DDoS Protection

- [ ] API rate limiting enabled (`src/utils/security.ts`)
- [ ] Login rate limiting: 5 attempts per 5 minutes
- [ ] API calls: 100 requests per minute
- [ ] Sync operations: 20 requests per minute
- [ ] Implement server-side rate limiting
- [ ] Use CDN for DDoS protection (Cloudflare, AWS CloudFront)

**Rate Limiters:**
```typescript
apiRateLimiter = 100 requests/min
authRateLimiter = 5 requests/5min
syncRateLimiter = 20 requests/min
```

### 8. Error Handling & Logging

- [ ] Secure error handler implemented (`SecureErrorHandler`)
- [ ] Never expose internal error details to users
- [ ] Log errors for debugging (only in development)
- [ ] Implement centralized logging (Sentry, LogRocket)
- [ ] Monitor failed requests with `RequestLogger`
- [ ] Set up alerting for security events

**Usage:**
```typescript
import { SecureErrorHandler, RequestLogger } from '../utils/security';

// Get user-friendly error message
const message = SecureErrorHandler.getUserMessage(error);

// Log for debugging (only in dev)
SecureErrorHandler.logError(error, 'contextInfo');

// Monitor requests
RequestLogger.getFailedRequests();
```

### 9. Code Security

- [ ] Remove all `console.log()` statements in production
- [ ] Remove debug code and comments
- [ ] Obfuscate JavaScript code (Expo EAS build does this)
- [ ] Enable ProGuard for Android
- [ ] Enable code signing for iOS
- [ ] Implement jailbreak/root detection
- [ ] Disable developer menu in production

**Remove Debug Code:**
```typescript
// Use __DEV__ flag
if (__DEV__) {
  console.log('Debug info');
}
```

### 10. App Permissions

- [ ] Request minimum necessary permissions
- [ ] Explain permission usage to users
- [ ] Handle permission denials gracefully
- [ ] Review `app.json` permissions before deployment

**Critical Permissions to Review:**
- Camera
- Location
- Contacts
- Storage
- Network

---

## 🔒 Security Features Implemented

### ✅ Rate Limiting
- API rate limiter: 100 req/min
- Auth rate limiter: 5 attempts/5min
- Sync rate limiter: 20 req/min
- **Location:** `src/utils/security.ts`

### ✅ Input Validation & Sanitization
- String sanitization (XSS prevention)
- Email validation
- Phone validation
- URL validation
- Object sanitization (recursive)
- **Location:** `src/utils/security.ts`

### ✅ Secure Error Handling
- User-friendly error messages
- No internal details exposed
- Development-only logging
- **Location:** `src/utils/security.ts`

### ✅ Request Logging & Monitoring
- Track all API requests
- Log failed requests
- Monitor performance
- **Location:** `src/utils/security.ts`

### ✅ Encrypted Storage
- Sensitive data encryption
- Password hash storage
- API key encryption
- 2FA secret storage
- **Location:** `src/utils/secure-storage.ts`

### ✅ Token Management
- JWT token support
- Automatic token refresh
- Token expiration check
- Refresh token rotation
- **Location:** `src/services/auth-service.ts`

### ✅ Security Audit Script
- Dependency vulnerability scanning
- Outdated package detection
- Security config checks
- Automated reporting
- **Run:** `bun run security:audit`

---

## 🚀 Deployment Steps

### Step 1: Pre-Deployment Audit
```bash
# Run full security audit
bun run security:audit

# Check vulnerabilities
bun pm audit

# Update dependencies
bun update

# Run type checking
bun run typecheck

# Run linting
bun run lint
```

### Step 2: Environment Configuration
```bash
# Create production .env
cp .env.example .env.production

# Edit and add production values
nano .env.production

# Verify .env is in .gitignore
cat .gitignore | grep .env
```

### Step 3: Security Hardening
```typescript
// Update API URLs to HTTPS
// src/api/web-admin-sync.ts
const DEFAULT_API_URL = 'https://your-production-portal.com';

// Disable dev mode features
// app.json
{
  "expo": {
    "developmentClient": {
      "silentLaunch": true
    }
  }
}
```

### Step 4: Build & Deploy
```bash
# Build for Android
bun run build:android

# Build for iOS
bun run build:ios

# Or use EAS Build
eas build --platform all --profile production
```

### Step 5: Post-Deployment
- [ ] Monitor crash reports (Sentry)
- [ ] Monitor API errors
- [ ] Check security logs
- [ ] Review user feedback
- [ ] Schedule security updates (monthly)

---

## 📊 Security Monitoring

### Tools to Implement:

1. **Crash Reporting:** Sentry, Bugsnag
2. **Analytics:** Mixpanel, Amplitude
3. **Performance:** Firebase Performance
4. **Security:** Snyk, WhiteSource
5. **Logging:** Loggly, Papertrail

### Metrics to Track:

- Failed login attempts
- API error rates
- Response times
- Crash rates
- Security incidents

---

## ⚠️ Known Limitations (Upgrade for Production)

### 1. Encryption Method
**Current:** XOR encryption (basic)
**Upgrade to:** expo-secure-store (hardware-backed)

```bash
bun add expo-secure-store
```

### 2. Authentication System
**Current:** Local username/password
**Upgrade to:** JWT with backend API

### 3. Rate Limiting
**Current:** Client-side only
**Upgrade to:** Server-side + client-side

### 4. Session Management
**Current:** AsyncStorage
**Upgrade to:** Secure tokens with expiration

---

## 🔐 Security Best Practices

### DO ✅
- Use HTTPS for all API calls
- Validate and sanitize all user input
- Implement rate limiting
- Use secure storage for sensitive data
- Enable 2FA for admin users
- Rotate API keys regularly
- Monitor security logs
- Update dependencies monthly
- Use strong passwords (8+ chars, mixed case, numbers)
- Implement proper error handling

### DON'T ❌
- Never commit `.env` files to git
- Never store passwords in plain text
- Never expose internal error details
- Never use HTTP in production
- Never disable SSL verification
- Never hardcode API keys in code
- Never skip input validation
- Never trust client-side data
- Never log sensitive information
- Never skip security updates

---

## 📞 Security Incident Response

### If Security Breach Detected:

1. **Immediate Actions:**
   - Rotate all API keys
   - Invalidate all user sessions
   - Enable maintenance mode
   - Document incident details

2. **Investigation:**
   - Review security logs
   - Identify breach source
   - Assess data exposure
   - Document timeline

3. **Remediation:**
   - Fix vulnerability
   - Update security measures
   - Deploy patches
   - Notify affected users (if required by law)

4. **Post-Incident:**
   - Conduct security audit
   - Update security policies
   - Train team on lessons learned
   - Implement additional monitoring

---

## 📚 Additional Resources

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## 🔄 Regular Maintenance Schedule

### Daily
- Monitor error logs
- Check API uptime

### Weekly
- Review failed login attempts
- Check security alerts

### Monthly
- Run `bun run security:audit`
- Update dependencies
- Review access logs
- Test backup restoration

### Quarterly
- Rotate API keys
- Security team review
- Penetration testing
- Update security documentation

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
**Maintained by:** Vibecode Security Team
