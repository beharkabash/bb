# ⚡ Quick Deploy to Render - 5-Minute Setup

## 🎯 Prerequisites (Get These First)

### 1. Sanity CMS (5 minutes)
```bash
npm install -g @sanity/cli
sanity login
cd kroi-auto-center
sanity init
```
📝 **Save**: Project ID & API Token

### 2. Resend Email (2 minutes)
- Go to: https://resend.com/signup
- Get API Key
📝 **Save**: API Key

### 3. NextAuth Secret (30 seconds)
```bash
openssl rand -base64 32
```
📝 **Save**: The output

---

## 🚀 Deploy to Render (10 minutes)

### Step 1: Push Code
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Create Render Service
1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New"** → **"Web Service"**
4. Select your repository
5. Configure:
   - **Root Directory**: `kroi-auto-center`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Add Environment Variables
```bash
# Required (Copy-paste and replace with your values)
NODE_ENV=production
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_token
NEXT_PUBLIC_SITE_URL=https://your-app.onrender.com
RESEND_API_KEY=your_resend_key
FROM_EMAIL=noreply@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=your_generated_secret
```

### Step 4: Deploy
Click **"Create Web Service"** → Wait 5-10 minutes

---

## ✅ Post-Deploy Checklist

```
[ ] Site loads at https://your-app.onrender.com
[ ] Contact form works
[ ] Test drive booking works
[ ] Car listings show up
[ ] No console errors
```

---

## 🔧 Common Issues

### Build Fails?
- Check environment variables are set
- Ensure NODE_ENV=production

### 502 Error?
- Wait 2-3 minutes for app to start
- Check Start Command is `npm start`

### Forms Don't Work?
- Verify Sanity API token
- Check Resend API key
- Add Render domain to Sanity CORS

---

## 📊 What's Deployed

✅ **Working Features**:
- Car listings (from `data/cars.ts`)
- Contact forms
- Test drive bookings
- Financing calculator
- Trade-in estimator
- Search functionality
- Responsive design

⚠️ **Needs Content Setup**:
- Add cars to Sanity CMS
- Configure email templates
- Add testimonials
- Upload car images

---

## 💡 Quick Tips

1. **Free Tier**: Use Render free tier for testing
2. **Custom Domain**: Add in Render → Settings → Custom Domain
3. **HTTPS**: Automatic with Render
4. **Logs**: Check Render dashboard → Logs tab
5. **Redeploy**: Any git push triggers automatic deployment

---

## 📞 Need Help?

- **Render Issues**: https://render.com/docs
- **Sanity Help**: https://www.sanity.io/docs
- **Build Errors**: Check Render logs

---

**That's it! Your site should be live in ~15 minutes total!** 🎉
