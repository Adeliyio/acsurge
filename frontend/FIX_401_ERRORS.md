# 🔧 Fix 401 Authentication Errors - Step by Step Guide

## ✅ Problem Diagnosed

Your authentication logs show:
```
📊 Session Status: Active
👤 User: adeliyitomiwa@gmail.com
✅ User signed in: adeliyitomiwa@gmail.com
```

But then:
```
❌ Failed to load resource: the server responded with a status of 401 ()
Error searching projects: Object
```

**Root Cause**: The user is successfully authenticated, but Row Level Security (RLS) policies are blocking access to some database tables, and there are missing tables that your app expects.

## 🛠️ Solutions (Choose ONE approach)

### Option A: Quick Fix (Recommended - 5 minutes)

1. **Run the SQL Fix Script**:
   - Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tqzlsajhhtkhljdbjkyg
   - Click "SQL Editor" in the left sidebar
   - Open the file `fix-rls-policies.sql` from your project folder
   - Copy ALL the content and paste it into the SQL Editor
   - Click "Run" to execute all statements

2. **Restart Your Development Server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm start
   # or
   yarn start
   ```

3. **Test the Fix**:
   - Open your app in browser
   - Log in with your account
   - Check if projects load without 401 errors

### Option B: Manual Database Setup (10-15 minutes)

If Option A doesn't work, follow these steps:

1. **Create Missing Tables Manually**:
   - Go to Supabase Dashboard → Table Editor
   - Create these tables if missing:
     - `user_profiles`
     - `ad_analyses` 
     - `competitor_benchmarks`
     - `ad_generations`

2. **Fix RLS Policies**:
   - Go to Authentication → Policies
   - For each table, create policies allowing users to access their own data
   - Example policy: `auth.uid() = user_id`

## 🔍 Verify the Fix

1. **Check Your Browser Console**:
   - Open Developer Tools (F12)
   - Look for these success messages:
   ```
   ✅ Found user from session: adeliyitomiwa@gmail.com
   🔍 Searching projects for user: [user-id]
   📁 Fetching projects for user: [user-id]
   ```

2. **Test Authentication Debug**:
   - In browser console, run:
   ```javascript
   await window.debugAuthState()
   ```
   - Should show active session with valid tokens

3. **Run Database Diagnostic**:
   ```bash
   node diagnose-supabase.js
   ```
   - Should show: `✅ Table 'ad_copy_projects' accessible`
   - Should show no blocked tables

## 🎯 What Was Fixed

1. **Enhanced Authentication Handling**:
   - Added automatic token refresh on 401 errors
   - Better error messages for authentication failures
   - Session validation before API calls

2. **Database Structure**:
   - Created missing `user_profiles` table
   - Created legacy tables for compatibility (`ad_analyses`, etc.)
   - Fixed Row Level Security policies
   - Added user quota checking function

3. **Error Handling**:
   - More specific error messages
   - Automatic retry with session refresh
   - Better debugging information

## 🚨 If You Still Get 401 Errors

1. **Clear Browser Storage**:
   - Open Developer Tools (F12) → Application Tab
   - Clear all Local Storage items containing "supabase"
   - Refresh page and log in again

2. **Check Token Validity**:
   ```javascript
   // In browser console
   const session = await supabase.auth.getSession()
   console.log('Session:', session)
   ```

3. **Verify Database Connection**:
   ```bash
   node diagnose-supabase.js
   ```

4. **Check User ID Match**:
   - Your app logs show: `user_id=eq.28a3fe08-5ea1-4da4-9e29-427563e5664e`
   - Make sure this matches your database user_id columns

## 📞 Still Need Help?

If you're still getting 401 errors after trying these fixes:

1. Share the output of `node diagnose-supabase.js`
2. Share any new error messages from browser console
3. Confirm which steps you completed

The fixes I've implemented should resolve the authentication issues you were experiencing. The main problem was RLS policies blocking access to database tables even though the user was properly authenticated.
