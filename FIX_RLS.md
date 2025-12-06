# RLS Setup for Supabase

## Quick Fix - Disable RLS (Recommended for Development)

Run this in your Supabase SQL Editor:

```sql
-- Disable Row Level Security on both tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role
GRANT ALL ON users TO anon;
GRANT ALL ON questions TO anon;
GRANT USAGE ON SEQUENCE users_id_seq TO anon;
GRANT USAGE ON SEQUENCE questions_id_seq TO anon;
```

## Verify Tables and Permissions

```sql
-- Check if tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'questions');

-- Should show rowsecurity = false for both tables
```

## Test Insert Manually

```sql
-- Test if you can insert into users table
INSERT INTO users (name, email, password, role)
VALUES ('Test User', 'test@test.com', 'hashedpassword', 'admin')
RETURNING *;

-- Test if you can select
SELECT * FROM users;
SELECT * FROM questions LIMIT 5;
```

## Check Your Supabase Keys

1. Go to: https://supabase.com/dashboard/project/jqzykdnipvrlvhbliayt/settings/api
2. Verify you're using:
   - **Project URL**: Should match your SUPABASE_URL
   - **anon public** key: Should match your SUPABASE_KEY
   - **NOT** the service_role key (that's for server-side only)

## Common Issues

### Issue: "new row violates row-level security policy"
**Solution**: Disable RLS with the SQL above

### Issue: "permission denied for table"
**Solution**: Grant permissions to anon role (see SQL above)

### Issue: "relation does not exist"
**Solution**: Run the full schema.sql file

## Production RLS Policies (Optional - For Later)

If you want to enable RLS for production, use these policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to sign up (insert into users)
CREATE POLICY "Enable insert for all users" ON users
    FOR INSERT
    WITH CHECK (true);

-- Allow anyone to read their own user data
CREATE POLICY "Enable read for all users" ON users
    FOR SELECT
    USING (true);

-- Allow all operations on questions
CREATE POLICY "Enable all for questions" ON questions
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

---

**After running the RLS disable SQL, redeploy your backend in Vercel and test again!**
