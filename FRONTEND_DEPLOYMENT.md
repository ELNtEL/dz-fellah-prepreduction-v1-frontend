# DZ-Fellah Frontend Deployment Guide

## Quick Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Push your code to GitHub** (if not already done)

2. **Go to [Vercel](https://vercel.com)**
   - Sign in with GitHub
   - Click "Add New Project"
   - Select your `dz-fellah` repository

3. **Configure Build Settings:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variable:**
   - Name: `VITE_API_URL`
   - Value: `https://your-backend.railway.app` (your Railway backend URL)

5. **Deploy!**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your site will be live at `https://your-project.vercel.app`

---

### Option 2: Netlify

1. **Go to [Netlify](https://netlify.com)**
   - Sign in with GitHub
   - Click "Add new site" > "Import an existing project"
   - Select your `dz-fellah` repository

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables:**
   - Go to Site Settings > Build & deploy > Environment
   - Add: `VITE_API_URL` = `https://your-backend.railway.app`

4. **Deploy!**

---

### Option 3: Railway (Same platform as backend)

1. **In Railway Dashboard:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `dz-fellah` repository

2. **Add Build Settings:**
   - Build Command: `npm run build`
   - Start Command: `npm run preview`

3. **Environment Variables:**
   - Add `VITE_API_URL` with your backend URL

4. **Generate Domain:**
   - Go to Settings > Networking
   - Click "Generate Domain"

---

## Local Production Preview

Before deploying, test the production build locally:

```bash
# Build the production bundle
npm run build

# Preview the production build
npm run preview
```

Visit `http://localhost:4173` to test.

---

## Post-Deployment Checklist

After deploying both backend and frontend:

1. **Update `.env.production`** with your actual Railway backend URL:
   ```
   VITE_API_URL=https://your-actual-backend.railway.app
   ```

2. **Update Backend CORS Settings:**
   - Add your Vercel/Netlify URL to `ALLOWED_HOSTS` in Django settings
   - Add to `CORS_ALLOWED_ORIGINS`

3. **Test the Deployment:**
   - Visit your frontend URL
   - Try logging in: `client1@example.com` / `Client123`
   - Browse products
   - Check subscriptions
   - Verify images load correctly

---

## Troubleshooting

### Images not loading?
- Check `VITE_API_URL` is set correctly
- Verify backend URL is accessible
- Check browser console for CORS errors

### API calls failing?
- Ensure backend `ALLOWED_HOSTS` includes your frontend domain
- Check `CORS_ALLOWED_ORIGINS` in backend settings
- Verify `VITE_API_URL` has no trailing slash

### Build failing?
- Run `npm install` to ensure all dependencies are installed
- Check for console errors
- Verify `package.json` scripts are correct

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Railway Docs:** https://docs.railway.app
