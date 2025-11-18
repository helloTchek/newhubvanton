# Setup Guide - First Time Login

## Quick Start

Your database is now ready! Follow these steps to create your first user and login.

## Step 1: Create Your First Admin User

### Via Supabase Dashboard (Easiest)

1. **Open your Supabase project**: https://supabase.com/dashboard
2. **Go to Authentication**:
   - Click on **Authentication** in the left sidebar
   - Click on **Users** tab
   - Click **"Add User"** button

3. **Create the user**:
   ```
   Email: admin@tchek.ai
   Password: Admin123!Secure
   ```
   (Or use any email/password you prefer - minimum 8 characters)

4. **Copy the User ID**: After creating, copy the UUID shown in the user list

5. **Create User Profile**:
   - Go to **Table Editor** → **user_profiles**
   - Click **"Insert row"**
   - Fill in:
     ```
     id: [paste the User ID you copied]
     name: Admin User
     role: admin
     company_id: [leave blank/null]
     ```
   - Click **"Save"**

### Via SQL (Alternative)

If you prefer SQL, run this in the SQL Editor:

```sql
-- First, note the user_id after you create the auth user
-- Then run this query replacing YOUR_USER_ID with the actual ID

INSERT INTO user_profiles (id, name, role, company_id)
VALUES ('YOUR_USER_ID', 'Admin User', 'admin', NULL);
```

## Step 2: Login to the Application

1. Start the dev server (if not already running):
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Login with the credentials you created:
   ```
   Email: admin@tchek.ai
   Password: Admin123!Secure
   ```

## Creating Additional Users

### Company Inspector

1. Create auth user in Supabase Dashboard
2. Add user profile:
   ```sql
   INSERT INTO user_profiles (id, name, role, company_id)
   VALUES (
     'USER_ID_HERE',
     'John Inspector',
     'inspector',
     '11111111-1111-1111-1111-111111111111'  -- AutoCorp Solutions
   );
   ```

### Company Manager

```sql
INSERT INTO user_profiles (id, name, role, company_id)
VALUES (
  'USER_ID_HERE',
  'Sarah Manager',
  'manager',
  '22222222-2222-2222-2222-222222222222'  -- Fleet Management Pro
);
```

### Company Viewer

```sql
INSERT INTO user_profiles (id, name, role, company_id)
VALUES (
  'USER_ID_HERE',
  'Mike Viewer',
  'viewer',
  '33333333-3333-3333-3333-333333333333'  -- Urban Transport Ltd
);
```

## Available Companies

Your database has been seeded with these companies:

1. **AutoCorp Solutions** (ID: `11111111-1111-1111-1111-111111111111`)
   - Mother Company: GlobalAuto Holdings
   - Email: contact@autocorp.com

2. **Fleet Management Pro** (ID: `22222222-2222-2222-2222-222222222222`)
   - Email: hello@fleetpro.com

3. **Urban Transport Ltd** (ID: `33333333-3333-3333-3333-333333333333`)
   - Mother Company: CityMove Group
   - Email: info@urbantransport.com

## User Roles Explained

- **admin**: Full access to all companies and data, can manage everything
- **manager**: Can manage vehicles and reports for their assigned company
- **inspector**: Can create and edit their own inspection reports
- **viewer**: Read-only access to their company's data

## Troubleshooting

### "User profile not found" error
- Make sure you created both the auth user AND the user_profile entry
- Verify the IDs match exactly between auth.users and user_profiles

### "Invalid credentials" error
- Check your email and password are correct
- Password must be at least 8 characters

### Can't see any data after login
- Admin users can see all data
- Company users can only see their company's data
- Make sure the user has a company_id set (unless they're admin)

### RLS Policy errors
- This means Row Level Security is working correctly!
- Verify the user has proper role and company_id set
- Check the user is trying to access data they're authorized for

## Next Steps

After logging in as admin:
1. Explore the company selection page
2. Select a company or "All Companies"
3. The vehicles list will be empty initially
4. You can add vehicles through the application (once services are connected)

## Security Notes

- Never share your admin credentials
- Use strong passwords (minimum 8 characters recommended)
- Regularly review user access
- Monitor the Supabase dashboard for unusual activity
- Keep your VITE_SUPABASE_ANON_KEY secure (though RLS protects your data)

## Need Help?

- Check the SECURITY.md file for security documentation
- Review the database schema in the migrations folder
- Check Supabase logs for detailed error messages
