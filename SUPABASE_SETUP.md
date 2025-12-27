# Supabase Database Setup Guide

This guide will help you set up Supabase for long-term data storage in OptiDopa.

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Free tier includes:
   - 500MB database storage
   - 2GB bandwidth/month
   - Unlimited API requests
   - **Perfect for years of personal medical data**

## Step 2: Create a New Project

1. Click "New Project"
2. Choose a name (e.g., "optidopa")
3. Create a **strong database password** (save this!)
4. Select a region close to you
5. Click "Create new project" (takes ~2 minutes)

## Step 3: Run Database Schema

Once your project is ready:

1. Go to the **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy and paste the SQL schema below
4. Click "Run" (bottom right)

### Database Schema (SQL)

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create doses table
CREATE TABLE doses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  datetime TIMESTAMPTZ NOT NULL,
  medication TEXT NOT NULL CHECK (medication IN ('Carbilev', 'Sinemet CR')),
  dose_amount TEXT NOT NULL CHECK (dose_amount IN ('Full', 'Half')),
  dose_mg INTEGER NOT NULL,
  formulation TEXT NOT NULL CHECK (formulation IN ('IR', 'CR')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patient_profile table
CREATE TABLE patient_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Therapeutic ranges
  observed_min_effective REAL,
  observed_optimal_range_min REAL,
  observed_optimal_range_max REAL,
  observed_dyskinesia_threshold REAL,

  -- Wearing-off symptoms (0-4 severity)
  tremor_returns INTEGER CHECK (tremor_returns BETWEEN 0 AND 4),
  slowness_returns INTEGER CHECK (slowness_returns BETWEEN 0 AND 4),
  stiffness_rigidity INTEGER CHECK (stiffness_rigidity BETWEEN 0 AND 4),
  difficulty_getting_up INTEGER CHECK (difficulty_getting_up BETWEEN 0 AND 4),
  smaller_handwriting INTEGER CHECK (smaller_handwriting BETWEEN 0 AND 4),
  shuffling_freezing INTEGER CHECK (shuffling_freezing BETWEEN 0 AND 4),

  -- Non-motor symptoms (0-4 severity)
  anxiety_panic INTEGER CHECK (anxiety_panic BETWEEN 0 AND 4),
  fatigue_low_energy INTEGER CHECK (fatigue_low_energy BETWEEN 0 AND 4),
  pain_aching INTEGER CHECK (pain_aching BETWEEN 0 AND 4),
  sweating INTEGER CHECK (sweating BETWEEN 0 AND 4),
  mood_changes INTEGER CHECK (mood_changes BETWEEN 0 AND 4),

  -- Dyskinesia symptoms (0-4 severity)
  involuntary_movements INTEGER CHECK (involuntary_movements BETWEEN 0 AND 4),
  restlessness INTEGER CHECK (restlessness BETWEEN 0 AND 4),
  feeling_jittery INTEGER CHECK (feeling_jittery BETWEEN 0 AND 4),
  head_bobbing INTEGER CHECK (head_bobbing BETWEEN 0 AND 4),
  trunk_swaying INTEGER CHECK (trunk_swaying BETWEEN 0 AND 4),

  -- Timing information
  hours_until_best_response REAL,
  hours_until_symptoms_return REAL,
  duration_of_good_time REAL,
  current_motor_state TEXT CHECK (current_motor_state IN ('ON', 'OFF', 'ON_WITH_DYSKINESIA', 'OFF_WITH_DYSKINESIA')),

  -- Clinical notes
  notes TEXT,
  last_assessment_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_doses_user_id ON doses(user_id);
CREATE INDEX idx_doses_datetime ON doses(datetime DESC);
CREATE INDEX idx_patient_profile_user_id ON patient_profile(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profile ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can view their own doses"
  ON doses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own doses"
  ON doses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doses"
  ON doses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own doses"
  ON doses FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
  ON patient_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON patient_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON patient_profile FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_doses_updated_at
  BEFORE UPDATE ON doses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_profile_updated_at
  BEFORE UPDATE ON patient_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Get Your API Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll need two values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 5: Configure Environment Variables

1. In your `optidopa-web` folder, create a file named `.env.local`
2. Add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Important:** Never commit this file to git (it's already in `.gitignore`)

## Step 6: Deploy to Vercel (Free Hosting)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Add Supabase integration"
   git branch -M main
   git remote add origin https://github.com/yourusername/optidopa.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign up
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

Your app will be live at `https://your-app.vercel.app`

## Step 7: Create Your User Account

1. Visit your deployed app (or localhost:3000)
2. Click "Sign Up"
3. Enter your email and password
4. Check your email for confirmation link
5. Click the link to activate your account
6. Log in and start tracking!

## What You Get

✅ **Years of data storage** - PostgreSQL database with 500MB free
✅ **Access anywhere** - Phone, tablet, desktop - same data
✅ **Automatic backups** - Supabase backs up your data
✅ **Secure** - Row Level Security ensures only you see your data
✅ **Fast** - Indexed queries for quick loading
✅ **Export anytime** - Excel export still works

## Data Security

- Your data is encrypted in transit (HTTPS)
- Row Level Security prevents unauthorized access
- Only you can see your doses and symptoms
- Supabase is HIPAA-compliant capable
- Regular backups on Supabase's infrastructure

## Free Tier Limits

- 500MB database (enough for decades of dose data)
- 2GB bandwidth/month (very generous for personal use)
- Unlimited API requests
- 50,000 monthly active users (you only need 1!)

## Troubleshooting

**Can't connect to database:**
- Check `.env.local` has correct URL and key
- Restart Next.js dev server (`npm run dev`)

**Authentication not working:**
- Verify email confirmation was clicked
- Check email settings in Supabase dashboard

**Data not saving:**
- Check browser console for errors
- Verify Row Level Security policies are created

## Migration from localStorage

The app will automatically detect existing localStorage data and offer to migrate it to Supabase on first login. This is a one-time process that preserves all your existing doses and patient profile.
