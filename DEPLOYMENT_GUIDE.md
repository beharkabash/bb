# 🚀 KROI AUTO CENTER - Production Deployment Guide for Render

## 📋 Table of Contents
1. [Manual Configuration Required](#manual-configuration-required)
2. [Missing Features for Production](#missing-features-for-production)
3. [Render Deployment Steps](#render-deployment-steps)
4. [Sanity CMS Setup](#sanity-cms-setup)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## 🔧 Manual Configuration Required

### 1. **Git Repository Access**
Your changes are committed locally. To push to GitHub:

```bash
# Option A: If you own the repository
git remote set-url origin https://github.com/beharkabash/bb.git
git push origin main

# Option B: If repository is under different account
# You'll need to fork or get push access from the owner
```

### 2. **Sanity CMS Setup** (CRITICAL)

#### Step 1: Create Sanity Project
```bash
cd kroi-auto-center
npm install -g @sanity/cli
sanity login
sanity init --project-plan free
```

#### Step 2: Deploy Sanity Schemas
```bash
cd sanity
sanity deploy
# Follow prompts to create studio subdomain
```

#### Step 3: Configure CORS
1. Go to https://www.sanity.io/manage
2. Select your project
3. Navigate to "API" → "CORS Origins"
4. Add these origins:
   - `http://localhost:3000` (for development)
   - `https://your-render-domain.onrender.com` (for production)
   - `https://your-custom-domain.com` (if you have one)

#### Step 4: Get API Credentials
1. In Sanity dashboard → "API" → "Tokens"
2. Create a new token with "Editor" permissions
3. Copy the token (you won't see it again!)
4. Note your Project ID (visible in dashboard)

### 3. **Email Service Setup (Resend)**

#### Step 1: Create Resend Account
1. Go to https://resend.com/signup
2. Sign up for free account (100 emails/day)

#### Step 2: Verify Domain (Optional but Recommended)
1. Add your domain in Resend dashboard
2. Add DNS records they provide
3. Wait for verification

#### Step 3: Get API Key
1. Go to "API Keys" in Resend dashboard
2. Create new API key
3. Copy and save it securely

### 4. **NextAuth Secret Generation**
```bash
# Generate a secure secret
openssl rand -base64 32

# Copy the output and use it as NEXTAUTH_SECRET
```

---

## 🔍 Missing Features for Production

### 1. **Database for Sessions** (Optional but Recommended)
Currently using JWT sessions. For production, consider:

**Option A: Add PostgreSQL (Recommended)**
```bash
# Install Prisma
npm install prisma @prisma/client
npm install @next-auth/prisma-adapter

# Initialize Prisma
npx prisma init
```

Create `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Option B: Use Existing JWT (Current)**
- Already configured
- No additional setup needed
- Less secure for production at scale

### 2. **Redis for Caching** (Recommended for Production)

**Option A: Use Upstash Redis (Free tier available)**
```bash
# Install Redis client (already in package.json)
# No additional packages needed
```

1. Go to https://upstash.com/
2. Create free Redis database
3. Copy the Redis URL
4. Add to environment variables

**Option B: Skip Redis**
- In-memory caching will work
- Less efficient at scale
- Already configured as fallback

### 3. **Error Tracking - Sentry** (Highly Recommended)

#### Setup Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Follow the wizard and add these env vars:
```bash
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_auth_token
```

### 4. **Analytics** (Recommended)

**Option A: Google Analytics**
Add to `app/layout.tsx`:
```typescript
import Script from 'next/script';

// In the layout component
{process.env.NEXT_PUBLIC_GA_ID && (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
      `}
    </Script>
  </>
)}
```

**Option B: Plausible Analytics** (Privacy-friendly)
```bash
npm install next-plausible
```

### 5. **Image Optimization** (Important)

**Current State**: Using Next.js Image Optimization
**For Render**: Already configured with remote patterns

**Recommendations**:
1. Upload car images to Sanity CMS
2. Use Sanity's built-in CDN
3. Or use Cloudinary for external images

### 6. **Content Management**

**What's Ready**:
- ✅ Sanity schemas created (leads, test-drive bookings, financing applications)
- ✅ API routes configured
- ✅ Validation in place

**What You Need to Do**:
1. Create schema for `car` documents in Sanity:

Create `sanity/schemas/car.ts`:
```typescript
import type { SanityRule } from './types';

const carSchema = {
  name: 'car',
  title: 'Cars',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Car Name',
      type: 'string',
      validation: (Rule: SanityRule) => Rule.required()
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
      validation: (Rule: SanityRule) => Rule.required()
    },
    {
      name: 'model',
      title: 'Model',
      type: 'string',
      validation: (Rule: SanityRule) => Rule.required()
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule: SanityRule) => Rule.required().min(1990).max(2030)
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule: SanityRule) => Rule.required().min(0)
    },
    {
      name: 'mileage',
      title: 'Mileage (km)',
      type: 'number',
      validation: (Rule: SanityRule) => Rule.required().min(0)
    },
    {
      name: 'fuelType',
      title: 'Fuel Type',
      type: 'string',
      options: {
        list: [
          { title: 'Bensiini', value: 'gasoline' },
          { title: 'Diesel', value: 'diesel' },
          { title: 'Sähkö', value: 'electric' },
          { title: 'Hybridi', value: 'hybrid' },
          { title: 'Plug-in Hybridi', value: 'plugin-hybrid' }
        ]
      }
    },
    {
      name: 'transmission',
      title: 'Transmission',
      type: 'string',
      options: {
        list: [
          { title: 'Automaatti', value: 'automatic' },
          { title: 'Manuaali', value: 'manual' }
        ]
      }
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }],
      validation: (Rule: SanityRule) => Rule.required().min(1)
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Premium', value: 'premium' },
          { title: 'Family', value: 'family' },
          { title: 'SUV', value: 'suv' },
          { title: 'Sport', value: 'sport' },
          { title: 'Electric', value: 'electric' },
          { title: 'Compact', value: 'compact' },
          { title: 'Luxury', value: 'luxury' }
        ]
      }
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Available', value: 'available' },
          { title: 'Sold', value: 'sold' },
          { title: 'Reserved', value: 'reserved' }
        ]
      },
      initialValue: 'available'
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: (Rule: SanityRule) => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'price',
      media: 'images.0'
    },
    prepare({ title, subtitle, media }: { title: string; subtitle: number; media: unknown }) {
      return {
        title,
        subtitle: `€${subtitle?.toLocaleString('fi-FI')}`,
        media
      }
    }
  }
};

export default carSchema;
```

2. Update your Sanity schema index to include car schema
3. Deploy to Sanity Studio
4. Migrate existing car data from `app/data/cars.ts` to Sanity

### 7. **Security Enhancements**

**Implement CSRF Protection**:
```bash
npm install csrf
```

Add to API routes:
```typescript
import csrf from 'csrf';
const tokens = new csrf();
// Implement token validation
```

**Add Rate Limiting** (Already configured, but needs Redis):
- Current: In-memory (resets on deployment)
- Production: Needs Redis/Upstash for persistence

---

## 🚀 Render Deployment Steps

### Step 1: Prepare Repository
```bash
# Push your changes
git add .
git commit -m "Production ready deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com/
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Create New Web Service

1. **Click "New" → "Web Service"**
2. **Connect your repository**: `beharkabash/bb` or your fork
3. **Configure the service**:

   - **Name**: `kroi-auto-center`
   - **Region**: Choose closest to your users (Europe recommended)
   - **Branch**: `main`
   - **Root Directory**: `kroi-auto-center`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter ($7/month)

### Step 4: Add Environment Variables

In Render dashboard → Environment → Add Environment Variables:

```bash
# Node Environment
NODE_ENV=production

# Sanity CMS (REQUIRED)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-app.onrender.com

# Email (Resend) (REQUIRED)
RESEND_API_KEY=re_your_actual_key
FROM_EMAIL=noreply@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com

# Authentication (REQUIRED)
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=your_generated_secret_from_openssl

# Database (OPTIONAL)
DATABASE_URL=postgresql://user:password@host:5432/db

# Redis (OPTIONAL - for caching)
REDIS_URL=redis://default:password@host:6379

# Security
ENABLE_RATE_LIMITING=true
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000

# Error Tracking (OPTIONAL)
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_token

# Analytics (OPTIONAL)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Render will:
   - Clone your repository
   - Install dependencies
   - Run build command
   - Start your application
3. Monitor the logs for any errors

### Step 6: Custom Domain (Optional)
1. In Render dashboard → Settings → Custom Domain
2. Add your domain: `www.kroiautocenter.fi`
3. Update DNS records at your domain registrar:
   ```
   Type: CNAME
   Name: www
   Value: your-app.onrender.com
   ```
4. Enable "Automatic TLS/SSL"

---

## 📧 Email Configuration

### Resend Setup for Production

1. **Verify Sender Domain**:
   ```
   Domain: kroiautocenter.fi
   Add these DNS records:
   
   TXT Record:
   Name: @
   Value: [provided by Resend]
   
   CNAME Records:
   Name: resend._domainkey
   Value: [provided by Resend]
   
   Name: resend2._domainkey
   Value: [provided by Resend]
   ```

2. **Update Email Templates**:
   - Templates are in `app/lib/email/` directory
   - Customize with your branding
   - Test before going live

3. **Set Production Email Addresses**:
   ```bash
   FROM_EMAIL=noreply@kroiautocenter.fi
   CONTACT_EMAIL=info@kroiautocenter.fi
   ```

---

## ✅ Post-Deployment Checklist

### Immediate Actions:
- [ ] Verify deployment is successful
- [ ] Test all pages load correctly
- [ ] Check Sanity CMS connection
- [ ] Test contact form submission
- [ ] Test test drive booking
- [ ] Test financing application
- [ ] Verify email delivery
- [ ] Test all API endpoints
- [ ] Check mobile responsiveness
- [ ] Verify SSL certificate is active

### Within 24 Hours:
- [ ] Monitor error logs in Render
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure backup strategy for Sanity data
- [ ] Test performance with Lighthouse
- [ ] Set up Google Search Console
- [ ] Submit sitemap to search engines
- [ ] Test all forms with real data
- [ ] Configure email alerts for errors

### Within 1 Week:
- [ ] Implement Sentry error tracking
- [ ] Set up analytics dashboard
- [ ] Monitor conversion rates
- [ ] Optimize images if needed
- [ ] Set up database backups (if using PostgreSQL)
- [ ] Create admin documentation
- [ ] Train team on Sanity CMS
- [ ] Plan content migration strategy

---

## 🔧 Troubleshooting Common Issues

### 1. Build Fails on Render
**Solution**: Check build logs for specific errors
```bash
# Common fixes:
- Ensure all environment variables are set
- Check Node.js version compatibility
- Verify all dependencies are in package.json
```

### 2. 502 Bad Gateway
**Solution**: Check Start Command
```bash
# Should be:
npm start

# Not:
npm run dev
```

### 3. Environment Variables Not Working
**Solution**: 
- Must start with `NEXT_PUBLIC_` for client-side access
- Restart service after adding new variables
- Check for typos in variable names

### 4. Images Not Loading
**Solution**:
- Verify Sanity CDN is accessible
- Check Next.js image configuration
- Ensure remote patterns include your domains

### 5. API Routes Failing
**Solution**:
- Verify Sanity API token has correct permissions
- Check CORS settings in Sanity
- Ensure rate limiting isn't blocking requests

---

## 📊 Performance Optimization

### Recommended After Deployment:

1. **Enable CDN** (Render includes this)
2. **Optimize Images**:
   ```bash
   # Use Sanity image transformations
   urlFor(image).width(800).quality(80).format('webp')
   ```

3. **Implement Caching**:
   - Static pages: Already cached
   - API responses: Add Redis
   - Images: Sanity CDN handles this

4. **Monitor Performance**:
   - Use Lighthouse CI
   - Set up Core Web Vitals monitoring
   - Monitor bundle size

---

## 💰 Cost Estimate

### Free Tier (Good for testing):
- **Render**: Free (with limitations)
- **Sanity**: Free (100K API requests/month)
- **Resend**: Free (100 emails/day)
- **Total**: €0/month

### Production Tier (Recommended):
- **Render Starter**: $7/month
- **Sanity Growth**: Free (upgrade if needed)
- **Resend Pro**: €10/month (10K emails/month)
- **Upstash Redis**: Free tier or $0.20/month
- **Sentry**: Free tier
- **Total**: ~€17-20/month

### Scalable Tier:
- **Render Pro**: $25/month
- **Sanity Team**: $99/month
- **Resend Business**: €80/month
- **Upstash Redis**: ~$5/month
- **Sentry Team**: $26/month
- **Total**: ~€235/month

---

## 🎯 Quick Start Checklist

To deploy TODAY, you need:

### Absolutely Required (30 minutes):
1. ✅ **Sanity Account & Project** (10 min)
   - Create project
   - Deploy schemas
   - Get API credentials

2. ✅ **Resend Account** (5 min)
   - Sign up
   - Get API key
   - Verify domain (or use resend.dev)

3. ✅ **Generate NextAuth Secret** (1 min)
   ```bash
   openssl rand -base64 32
   ```

4. ✅ **Push Code to GitHub** (2 min)
   ```bash
   git push origin main
   ```

5. ✅ **Create Render Service** (12 min)
   - Connect repository
   - Add environment variables
   - Deploy

### Nice to Have (Additional time):
- Custom domain (10 min + DNS propagation)
- Sentry error tracking (15 min)
- Analytics setup (10 min)
- Redis cache (10 min)

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Sanity Docs**: https://www.sanity.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Resend Docs**: https://resend.com/docs

---

**Ready to deploy? Follow the steps above and your site will be live! 🚀**

**Need help? Create an issue in your repository or contact your team!**
