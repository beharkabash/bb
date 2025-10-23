# 🔒 Content Security Policy (CSP) Fix Guide

## Issue: Inline Scripts Blocked in Development

## Date: October 23, 2025

---

## 🚨 The Problem

You're seeing these errors in your browser console:

```
Refused to execute inline script because it violates the following Content Security Policy directive: 
"script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.sanity.io"
```

### Why This Happens:

Your `next.config.ts` has a strict Content Security Policy (CSP) that blocks **inline scripts**. This is good for production security, but in **development mode**, Next.js needs inline scripts for:

1. **Hot Module Replacement (HMR)** - Live reloading
2. **Development tools** - React DevTools integration
3. **Error overlay** - Showing errors in the browser
4. **Fast Refresh** - Instant component updates

---

## ✅ The Solution: Environment-Based CSP

We need **different CSP rules for development vs production**:

- **Development**: Allow inline scripts (for HMR and dev tools)
- **Production**: Strict CSP (for security)

---

## 🔧 Fix: Update next.config.ts

### Current Configuration (Problematic):

```typescript
// In next.config.ts - Lines 125-140
{
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.sanity.io",
    // ❌ This blocks inline scripts in development
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // ... rest of CSP
  ].join("; "),
}
```

### Fixed Configuration:

Replace the CSP section in `next.config.ts` (around line 125) with:

```typescript
{
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    // ✅ Environment-aware script-src
    process.env.NODE_ENV === 'development'
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.sanity.io"
      : "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.sanity.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob: https://cdn.sanity.io",
    "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com https://*.sentry.io https://infragrid.v.network https://*.sanity.io https://cdn.sanity.io",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; "),
}
```

---

## 📝 Step-by-Step Instructions

### Option 1: Manual Fix (Recommended)

1. **Open** `next.config.ts`

2. **Find** the `Content-Security-Policy` section (around line 125)

3. **Replace** the `script-src` line:

   ```typescript
   // BEFORE (Line ~128)
   "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.sanity.io",
   
   // AFTER
   process.env.NODE_ENV === 'development'
     ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.sanity.io"
     : "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.sanity.io",
   ```

4. **Save** the file

5. **Restart** your dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

6. **Refresh** your browser and check console - errors should be gone!

---

## 🎯 Alternative Solutions

### Option 2: Disable CSP in Development (Quick Fix)

If you want a quick fix, disable CSP entirely in development:

```typescript
// In next.config.ts
async headers() {
  // Skip security headers in development
  if (process.env.NODE_ENV === 'development') {
    return [];
  }
  
  // Return full security headers only in production
  return [
    {
      source: "/:path*",
      headers: [
        // ... your security headers
      ],
    },
  ];
},
```

**Pros:** Simple, no CSP errors in dev
**Cons:** Can't test CSP in development

---

### Option 3: Use Nonces (Advanced)

For a more secure approach, use nonces (random tokens):

```typescript
// In next.config.ts
import crypto from 'crypto';

const config: NextConfig = {
  async headers() {
    const nonce = crypto.randomBytes(16).toString('base64');
    
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com`,
              // ... rest
            ].join("; "),
          },
        ],
      },
    ];
  },
};
```

**Note:** Requires middleware to inject nonce into scripts. More complex setup.

---

## 🔍 What Each CSP Directive Means

### Development CSP:
```typescript
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://..."
```

- **'self'** - Allow scripts from your domain
- **'unsafe-inline'** - Allow inline `<script>` tags (needed for HMR)
- **'unsafe-eval'** - Allow `eval()` (needed for dev tools)
- **https://...** - Allow scripts from specific domains

### Production CSP:
```typescript
"script-src 'self' https://..."
```

- **'self'** - Allow scripts from your domain
- **No 'unsafe-inline'** - Block inline scripts (security)
- **No 'unsafe-eval'** - Block eval (security)
- **https://...** - Allow scripts from specific domains

---

## ✅ After Fixing

### Expected Results:

**Before:**
- ❌ 40+ CSP violation errors
- ❌ "Refused to execute inline script"
- ❌ HMR not working properly
- ⚠️ React DevTools warning

**After:**
- ✅ No CSP errors
- ✅ HMR works smoothly
- ✅ React DevTools loads
- ✅ Fast Refresh works
- ✅ Clean console

### Verify:

1. **Open browser DevTools** (F12)
2. **Check Console tab** - Should be clean (except normal warnings)
3. **Make a change to a component** - Should hot reload
4. **Check Network tab** - Scripts should load successfully

---

## 🚀 Production Deployment

### Important: Production will be SECURE

When you deploy to production (Render):

- ✅ `NODE_ENV=production` automatically set
- ✅ Strict CSP applied (no 'unsafe-inline')
- ✅ Inline scripts blocked (security)
- ✅ Your site is protected against XSS attacks

The fix only affects **development mode** - production remains secure!

---

## 🎯 Testing Production CSP Locally

Want to test production CSP before deploying?

```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start

# Visit http://localhost:3000
# Should have NO inline script errors (because production build has no inline scripts)
```

---

## 📊 CSP Best Practices

### ✅ DO:

1. **Use environment checks** for dev vs prod CSP
2. **Allow 'unsafe-inline' in development** for HMR
3. **Keep strict CSP in production** for security
4. **Whitelist specific domains** instead of wildcards
5. **Test production build** before deploying

### ❌ DON'T:

1. ❌ Use `'unsafe-inline'` in production (security risk)
2. ❌ Use `'unsafe-eval'` in production (security risk)
3. ❌ Disable CSP entirely (removes security)
4. ❌ Use `*` wildcards (too permissive)
5. ❌ Forget to test production build

---

## 🔧 Full next.config.ts Reference

Here's the complete fixed `headers()` section:

```typescript
import type { NextConfig } from "next";

const config: NextConfig = {
  // ... other config
  
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // ✅ Environment-aware script-src
              process.env.NODE_ENV === 'development'
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.sanity.io"
                : "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.sanity.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob: https://cdn.sanity.io",
              "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com https://*.sentry.io https://infragrid.v.network https://*.sanity.io https://cdn.sanity.io",
              "frame-src 'self' https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // Cache headers for static assets
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default config;
```

---

## 🐛 Troubleshooting

### Issue: Still seeing CSP errors after fix

**Solution:**
1. Make sure you saved `next.config.ts`
2. **Fully restart** the dev server (don't just reload)
3. **Hard refresh** browser (Ctrl+Shift+R or Cmd+Shift+R)
4. **Clear browser cache**
5. Check `NODE_ENV` is not set to 'production' in your terminal

### Issue: Production build has CSP errors

**Solution:**
This is actually good! Production builds shouldn't have inline scripts. If you see CSP errors in production:
1. Check browser console for actual errors (not just warnings)
2. Your production build is likely working fine
3. CSP errors in production mean your security is working

### Issue: React DevTools not showing

**Solution:**
1. Install React DevTools browser extension
2. Make sure dev server is running
3. Check console for any errors
4. Try restarting browser

---

## 📋 Quick Checklist

- [ ] Opened `next.config.ts`
- [ ] Found `Content-Security-Policy` section (line ~125)
- [ ] Added environment check to `script-src`
- [ ] Saved file
- [ ] Restarted dev server
- [ ] Hard refreshed browser
- [ ] Checked console - no CSP errors
- [ ] Tested HMR - works
- [ ] Tested production build - still secure

---

## ✨ Summary

### The Fix:
```typescript
// In next.config.ts, replace script-src line with:
process.env.NODE_ENV === 'development'
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://..."
  : "script-src 'self' https://...",
```

### Why It Works:
- **Development**: Allows inline scripts for HMR/dev tools
- **Production**: Maintains strict security (no inline scripts)
- **Automatic**: No manual switching needed

### Impact:
- ✅ Development: Clean console, working HMR
- ✅ Production: Still secure, no XSS vulnerabilities
- ✅ SEO: No negative impact
- ✅ Performance: No performance impact

---

## 🎯 Expected Timeline

1. **Open file**: 30 seconds
2. **Make change**: 1 minute
3. **Restart server**: 10 seconds
4. **Test**: 30 seconds
5. **Total**: ~2-3 minutes

---

**Your development environment will be much smoother after this fix!** 🚀

**And your production site will remain secure with strict CSP!** 🔒
