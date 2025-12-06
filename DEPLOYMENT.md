# LeetCom Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Supabase project with PostgreSQL database

## Deployment Steps

### Step 1: Prepare Your Repository
1. Make sure all code is committed to GitHub
2. Ensure `.env` files are NOT committed (they're in `.gitignore`)

### Step 2: Deploy Backend to Vercel

1. Go to https://vercel.com/new
2. Import your `LeetCom` repository
3. Configure the project:
   - **Project Name**: `leetcom-backend` (or any name)
   - **Root Directory**: `server`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. Add Environment Variables (click "Environment Variables"):
   ```
   SUPABASE_URL=https://jqzykdnipvrlvhbliayt.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   JWT_SECRET=$XFqBzy7e2
   ADMIN_SECRET_KEY=$XFqBzy7e2
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
   
   **Important**: Add all variables, then update `CORS_ORIGIN` after frontend deployment

5. Click **Deploy**
6. **Copy the deployed URL** (e.g., `https://leetcom-backend.vercel.app`)

### Step 3: Deploy Frontend to Vercel

1. Click "Add New Project" again
2. Select the same `LeetCom` repository
3. Configure the project:
   - **Project Name**: `leetcom-frontend` (or any name)
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variable:
   ```
   VITE_BACKEND_URL=https://leetcom-backend.vercel.app
   ```
   (Use the backend URL from Step 2)

5. Click **Deploy**
6. **Copy the deployed frontend URL**

### Step 4: Update Backend CORS

1. Go to your backend project in Vercel
2. Go to Settings → Environment Variables
3. Update `CORS_ORIGIN` to include your frontend URL:
   ```
   CORS_ORIGIN=https://your-frontend-url.vercel.app,http://localhost:5173
   ```
4. Redeploy the backend (Deployments → Click three dots → Redeploy)

### Step 5: Verify Deployment

1. Visit your frontend URL
2. Test login/signup functionality
3. Test CSV upload
4. Check browser console for any errors

## Environment Variables Reference

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
ADMIN_SECRET_KEY=your_admin_secret
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:5173
```

### Frontend (.env)
```
VITE_BACKEND_URL=https://your-backend.vercel.app
```

## Troubleshooting

### CORS Errors
- Ensure frontend URL is in backend's `CORS_ORIGIN`
- Redeploy backend after updating CORS_ORIGIN

### API Connection Failed
- Verify `VITE_BACKEND_URL` in frontend environment variables
- Check backend deployment logs in Vercel

### Database Errors
- Verify Supabase credentials are correct
- Ensure Supabase database is accessible

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

## Local Development

### Backend
```bash
cd server
npm install
# Create .env file with your credentials
npm run dev
```

### Frontend
```bash
cd client
npm install
# Create .env file with VITE_BACKEND_URL
npm run dev
```

## Important Notes

1. **Never commit `.env` files** - they contain sensitive credentials
2. **Update CORS** after frontend deployment
3. **Supabase** is your database - ensure it's properly configured
4. **Environment variables** must be set in Vercel dashboard for each deployment
5. **Redeploy** after changing environment variables

## Quick Deploy Checklist

- [ ] Backend deployed with all environment variables
- [ ] Backend URL copied
- [ ] Frontend deployed with VITE_BACKEND_URL
- [ ] Frontend URL copied
- [ ] Backend CORS_ORIGIN updated with frontend URL
- [ ] Backend redeployed
- [ ] Tested login/signup
- [ ] Tested file upload
- [ ] No console errors

## URLs After Deployment

- **Frontend**: https://your-frontend.vercel.app
- **Backend**: https://your-backend.vercel.app
- **Supabase**: https://jqzykdnipvrlvhbliayt.supabase.co

---

Your LeetCom application is now live! 🚀
