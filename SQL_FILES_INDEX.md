# 📋 AdCopySurge SQL Files Index

This document maps all SQL files in your project to help you understand your database setup and avoid conflicts.

## 📂 Existing SQL Files

### 1. `supabase-schema.sql` - **Main Database Schema**
**Purpose:** Complete database schema with all tables and functions
**Status:** ✅ Complete
**Contains:**
- `user_profiles` table with subscription management
- `ad_analyses` table (your existing working table)
- `competitor_benchmarks` table
- `ad_generations` table  
- All RLS policies for existing tables
- User signup triggers
- Analysis count tracking

**Missing:** `ad_copy_projects` table (causing 401 errors)

### 2. `frontend/fix-rls-policies.sql` - **RLS Policy Fixes**
**Purpose:** Fix Row Level Security policies
**Status:** ⚠️ Partial (missing ad_copy_projects)
**Contains:**
- Creates missing tables if they don't exist
- Updates RLS policies
- `check_user_quota()` function (returns JSON)

**Note:** Has existing `check_user_quota` function that conflicts with new versions

### 3. `supabase-schema-corrected.sql` - **Schema Corrections** 
**Purpose:** Corrected version of main schema
**Status:** ❓ Unknown contents

### 4. `clean-supabase-schema.sql` - **Schema Cleanup**
**Purpose:** Clean up and reset schema
**Status:** ❓ Unknown contents  

### 5. `database/init.sql` - **Database Initialization**
**Purpose:** Initial database setup
**Status:** ❓ Unknown contents

### 6. `database_migration_safe.sql` - **Safe Migration (NEW)**
**Purpose:** Safe migration handling existing tables
**Status:** ⚠️ Has function conflicts
**Contains:**
- All table creation with existence checks
- `check_user_quota()` function (returns JSONB) - **CONFLICTS with existing**

### 7. `minimal_401_fix.sql` - **Minimal Fix (RECOMMENDED)**
**Purpose:** Only fix 401 errors without conflicts  
**Status:** ✅ Ready to use
**Contains:**
- **ONLY creates missing `ad_copy_projects` table**
- No function conflicts
- Works with your existing schema

## 🚨 **Current Issue: Function Conflicts**

Your existing `fix-rls-policies.sql` has:
```sql
CREATE OR REPLACE FUNCTION public.check_user_quota(user_uuid UUID)
RETURNS JSON AS $$
```

But newer migration scripts try to create:
```sql
CREATE OR REPLACE FUNCTION check_user_quota(user_id UUID)  
RETURNS JSONB AS $$
```

**PostgreSQL Error:** Cannot change return type from JSON to JSONB

## ✅ **RECOMMENDED SOLUTION**

**Use the `minimal_401_fix.sql` file** - it only creates the missing table without any function conflicts.

### Steps:
1. Go to Supabase Dashboard → SQL Editor
2. Run `minimal_401_fix.sql` 
3. Restart your dev server
4. Test the app - 401 errors should be gone

## 📊 **Database Table Status**

| Table Name | Status | Purpose | Notes |
|------------|--------|---------|-------|
| `user_profiles` | ✅ Exists | User data & subscriptions | May need onboarding columns |
| `ad_analyses` | ✅ Exists | Legacy analysis results | Working correctly |
| `competitor_benchmarks` | ✅ Exists | Competitor data | Working correctly |
| `ad_generations` | ✅ Exists | Generated ad variants | Working correctly |  
| **`ad_copy_projects`** | ❌ **MISSING** | **New project workflow** | **CAUSES 401 ERRORS** |
| `tool_analysis_results` | ❌ Missing | Individual tool results | Future feature |
| `analysis_pipeline_runs` | ❌ Missing | Batch analysis tracking | Future feature |

## 🎯 **Root Cause of 401 Errors**

The missing `ad_copy_projects` table is referenced in your app code but doesn't exist in the database. When your app tries to query this table, Supabase returns a 401 error because the table doesn't exist.

## 🛠️ **Migration Strategy**

### Option A: Minimal Fix (Recommended)
✅ Run `minimal_401_fix.sql` only
- Creates just the missing `ad_copy_projects` table
- No conflicts with existing functions
- Preserves all existing data
- Fixes 401 errors immediately

### Option B: Full Migration (Not Recommended)  
❌ Don't use the comprehensive migration scripts
- They have function conflicts
- Risk of data loss
- Complex to troubleshoot

## 📝 **Future SQL File Management**

1. **Keep existing working files:**
   - `supabase-schema.sql` - Your main schema
   - `fix-rls-policies.sql` - Your working RLS setup

2. **Only run minimal fixes:**
   - Create single-purpose SQL files for specific issues
   - Avoid large migration scripts with multiple changes

3. **Document changes:**
   - Update this index when adding new SQL files
   - Note what each file does and dependencies

## 🔧 **Next Steps After Fixing 401 Errors**

1. **Immediate (after running minimal_401_fix.sql):**
   - Restart dev server
   - Test project creation - should work
   - Verify no 401 errors in console

2. **Future enhancements:**
   - Add `tool_analysis_results` table when needed
   - Add `analysis_pipeline_runs` table for batch processing
   - Add project collaboration features

3. **Code updates needed:**
   - Update API endpoints to use `ad_copy_projects` table
   - Migrate existing data if needed
   - Update frontend to use new project workflow

---

## 🚀 **Quick Fix Summary**

**To fix 401 errors right now:**
1. Run `minimal_401_fix.sql` in Supabase SQL Editor
2. Restart your development server  
3. Test your app - 401 errors should be resolved

This creates only the missing table without touching your existing working database setup.
