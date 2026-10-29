# Google OAuth Setup Guide

This guide will help you enable Google sign-in for your OptiDopa application.

## Prerequisites

- Supabase project set up (see [SUPABASE_SETUP.md](optidopa-web/SUPABASE_SETUP.md))
- Google account

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Navigate to [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project** (or select existing)
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it: `OptiDopa` or similar
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select **External** user type
   - Click "Create"

   Fill in the required fields:
   - **App name**: `OptiDopa`
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - Click "Save and Continue"

   On the Scopes page:
   - Click "Save and Continue" (default scopes are fine)

   On Test users page:
   - Click "Add Users"
   - Add your email address (you can add more later)
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `OptiDopa Web Client`

   **Authorized JavaScript origins:**
   - Add: `http://localhost:3001` (for local development)
   - Add: `https://your-app.vercel.app` (after you deploy to Vercel)

   **Authorized redirect URIs:**
   - Add: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - ⚠️ Replace `uwidcecvsrnucowcolwm` with your actual Supabase project reference
     - You can find this in your Supabase project URL

   - Click "Create"

6. **Copy Your Credentials**
   - You'll see a popup with your **Client ID** and **Client Secret**
   - **IMPORTANT**: Copy both of these - you'll need them in Step 2

## Step 2: Configure Google OAuth in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your OptiDopa project

2. **Enable Google Provider**
   - Go to "Authentication" → "Providers" (in left sidebar)
   - Find "Google" in the list
   - Toggle it to **Enabled**

3. **Add Google OAuth Credentials**
   - Paste your **Client ID** from Step 1
   - Paste your **Client Secret** from Step 1
   - Click "Save"

## Step 3: Test the Integration

1. **Start your development server** (if not already running)
   ```bash
   cd optidopa-web
   npm run dev
   ```

2. **Open the app**
   - Navigate to [http://localhost:3001](http://localhost:3001)

3. **Try Google Sign-In**
   - Click the sign-in button in your app
   - Click "Sign in with Google"
   - You should be redirected to Google's login page
   - After signing in, you should be redirected back to the app
   - You should now be logged in!

## Step 4: Add Production URLs (When You Deploy)

After deploying to Vercel:

1. **Update Google Cloud Console**
   - Go back to your OAuth client credentials
   - Add your production URL to **Authorized JavaScript origins**:
     - `https://your-app.vercel.app`
   - The redirect URI should already work (it's the Supabase callback URL)

2. **Test production**
   - Visit your deployed app
   - Try signing in with Google
   - It should work the same as local development

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Make sure you added your email as a test user in the OAuth consent screen
- Double-check that the redirect URI in Google Cloud Console matches your Supabase callback URL exactly

### "redirect_uri_mismatch"
- Verify the redirect URI in Google Cloud Console is:
  `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes

### Google sign-in button doesn't appear
- Check that Supabase is properly configured (check `.env.local`)
- Check browser console for errors
- Make sure you restarted the dev server after adding `.env.local`

### "Invalid OAuth client"
- Double-check that you copied the correct Client ID and Client Secret
- Make sure you saved the changes in Supabase dashboard

## Security Notes

- Your **Client Secret** should be kept private - it's safely stored in Supabase, not in your code
- The OAuth flow happens entirely through Supabase - your app never sees the user's Google password
- Row Level Security (RLS) policies ensure each user can only access their own data

## Optional: Publishing Your OAuth App

By default, your OAuth app is in "Testing" mode and only works for test users you've added. To make it available to anyone:

1. Go to OAuth consent screen in Google Cloud Console
2. Click "Publish App"
3. You may need to go through Google's verification process if you plan to have many users

For a single-user app, staying in testing mode is fine - just make sure you're added as a test user!

---

**Need Help?**
- Check the [Supabase Auth documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- Check the browser console for error messages
- Make sure all URLs are exactly correct (no typos, no trailing slashes)
