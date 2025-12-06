# Supabase Database Setup Guide

## Prerequisites
- Supabase account at https://supabase.com
- Project already created

## Step 1: Access SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

## Step 2: Create Database Tables

Copy and paste the entire contents of `server/schema.sql` into the SQL Editor and click **Run**.

This will create:
- ✅ `users` table - For admin authentication
- ✅ `questions` table - For storing LeetCode questions
- ✅ Indexes for performance
- ✅ Triggers for auto-updating timestamps

## Step 3: Verify Tables Created

1. Click on **Table Editor** in the left sidebar
2. You should see two tables:
   - `users`
   - `questions`

## Step 4: Check Row Level Security (RLS)

By default, Supabase enables RLS. For this application, we need to disable it or add policies:

### Option A: Disable RLS (Simpler for development)

Run this SQL in the SQL Editor:

```sql
-- Disable RLS for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS for questions table
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
```

### Option B: Add RLS Policies (More secure for production)

Run this SQL in the SQL Editor:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert for users (signup)
CREATE POLICY "Allow public signup" ON users
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Policy: Allow select for authenticated users
CREATE POLICY "Allow authenticated read users" ON users
    FOR SELECT
    TO public
    USING (true);

-- Policy: Allow all operations on questions
CREATE POLICY "Allow all on questions" ON questions
    FOR ALL
    TO public
    USING (true);
```

## Step 5: Get Your Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click on **API** section
3. Copy the following:
   - **Project URL** (SUPABASE_URL)
   - **anon public key** (SUPABASE_KEY)

## Step 6: Update Environment Variables

### For Local Development (.env file):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
```

### For Vercel Deployment:
1. Go to Vercel Dashboard
2. Select your backend project
3. Go to Settings → Environment Variables
4. Add/Update:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_KEY` = your anon public key

## Step 7: Test Connection

After setting up, test the connection:

```bash
# Test signup endpoint
curl -X POST https://leet-com-backend.vercel.app/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "securepassword123",
    "secretKey": "$XFqBzy7e2"
  }'
```

## Troubleshooting

### Error: "relation 'users' does not exist"
- **Solution**: Run the schema.sql file in Supabase SQL Editor

### Error: "new row violates row-level security policy"
- **Solution**: Disable RLS or add proper policies (see Step 4)

### Error: "Failed to create account"
- **Solution**: Check Vercel function logs for detailed error
- Verify Supabase credentials are correct in Vercel environment variables

### Error: "Invalid API key"
- **Solution**: Make sure you're using the **anon** public key, not the service_role key

## Quick Setup Commands

If tables already exist and you want to reset:

```sql
-- Drop existing tables (careful!)
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then run the full schema.sql
```

## Verify Setup

Check if tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'questions');
```

Should return:
```
users
questions
```

---

## Security Notes

⚠️ **Important**:
- Never commit your `.env` file with real credentials
- Use environment variables in Vercel for production
- The `ADMIN_SECRET_KEY` protects admin signup
- Consider enabling RLS for production use
- The `anon` key is safe to use in frontend (it respects RLS policies)

---

✅ After completing these steps, your database is ready and your application should work!
