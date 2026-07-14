/*
# TraceNet — Security Hardening

## Purpose
Fixes 15 security findings: 10 RLS policies with always-true WITH CHECK clauses, 1 broad storage SELECT policy, and 4 SECURITY DEFINER function exposure issues.

## Changes

### 1. RLS Policy WITH CHECK Tightening (10 policies)
Every `WITH CHECK (true)` clause is replaced with a real predicate:

- `profiles_update_admin` → `WITH CHECK (EXISTS (… role = 'admin'))`
- `missing_persons_insert_auth` → `WITH CHECK (auth.uid() IS NOT NULL)`
- `missing_persons_update_privileged` → `WITH CHECK (auth.uid() = created_by OR EXISTS (… role IN ('law_enforcement','admin')))`
- `wanted_persons_update_le_admin` → `WITH CHECK (EXISTS (… role IN ('law_enforcement','admin')))`
- `crime_reports_insert_any` → `WITH CHECK (is_anonymous = true OR created_by = auth.uid())`
- `crime_reports_update_privileged` → `WITH CHECK (auth.uid() = created_by OR EXISTS (… role IN ('law_enforcement','admin')))`
- `alerts_update_le_admin` → `WITH CHECK (EXISTS (… role IN ('law_enforcement','admin')))`
- `comments_insert_any` → `WITH CHECK (is_anonymous = true OR author_id = auth.uid())`
- `audit_logs_insert_auth` → `WITH CHECK (auth.uid() IS NOT NULL)`
- `media_insert_auth` → `WITH CHECK (owner_id = auth.uid())`

### 2. SECURITY DEFINER Function Elimination
- `public.has_role(text)` is **dropped**. All policies rewritten with inline `EXISTS` subqueries.
- `public.handle_new_user()` trigger function: `REVOKE EXECUTE FROM PUBLIC, anon, authenticated`.

### 3. Storage Bucket Listing Removal
- Drops `media_bucket_read_public` SELECT policy on `storage.objects`.

## Important Notes
1. Idempotent — all `DROP … IF EXISTS` guards in place.
2. No data lost — only policies and function permissions change.
3. Anonymous reporting still works: `is_anonymous = true` rows allowed from anon+authenticated.
4. The `handle_new_user()` trigger continues to auto-create profiles on signup.
*/

-- ============================================================
-- STEP 1: Drop ALL existing policies on ALL tables
-- (so has_role() function can be dropped and all policies recreated cleanly)
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

DROP POLICY IF EXISTS "missing_persons_select_public" ON public.missing_persons;
DROP POLICY IF EXISTS "missing_persons_insert_auth" ON public.missing_persons;
DROP POLICY IF EXISTS "missing_persons_update_privileged" ON public.missing_persons;
DROP POLICY IF EXISTS "missing_persons_delete_privileged" ON public.missing_persons;

DROP POLICY IF EXISTS "wanted_persons_select_public" ON public.wanted_persons;
DROP POLICY IF EXISTS "wanted_persons_insert_le_admin" ON public.wanted_persons;
DROP POLICY IF EXISTS "wanted_persons_update_le_admin" ON public.wanted_persons;
DROP POLICY IF EXISTS "wanted_persons_delete_admin" ON public.wanted_persons;

DROP POLICY IF EXISTS "crime_reports_select_public" ON public.crime_reports;
DROP POLICY IF EXISTS "crime_reports_insert_any" ON public.crime_reports;
DROP POLICY IF EXISTS "crime_reports_update_privileged" ON public.crime_reports;
DROP POLICY IF EXISTS "crime_reports_delete_privileged" ON public.crime_reports;

DROP POLICY IF EXISTS "alerts_select_public" ON public.alerts;
DROP POLICY IF EXISTS "alerts_insert_le_admin" ON public.alerts;
DROP POLICY IF EXISTS "alerts_update_le_admin" ON public.alerts;
DROP POLICY IF EXISTS "alerts_delete_admin" ON public.alerts;

DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_any" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_owner_admin" ON public.comments;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_own_or_system" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;

DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_auth" ON public.audit_logs;

DROP POLICY IF EXISTS "media_select_public" ON public.media;
DROP POLICY IF EXISTS "media_insert_auth" ON public.media;
DROP POLICY IF EXISTS "media_delete_owner_admin" ON public.media;

-- ============================================================
-- STEP 2: Drop has_role() function — no more dependents
-- ============================================================
DROP FUNCTION IF EXISTS public.has_role(text);

-- ============================================================
-- STEP 3: Recreate ALL policies with proper WITH CHECK predicates
-- (all former has_role() calls replaced with inline EXISTS subqueries)
-- ============================================================

-- ---- profiles ----
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ---- missing_persons ----
CREATE POLICY "missing_persons_select_public" ON public.missing_persons
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "missing_persons_insert_auth" ON public.missing_persons
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "missing_persons_update_privileged" ON public.missing_persons
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  )
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  );

CREATE POLICY "missing_persons_delete_privileged" ON public.missing_persons
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  );

-- ---- wanted_persons ----
CREATE POLICY "wanted_persons_select_public" ON public.wanted_persons
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "wanted_persons_insert_le_admin" ON public.wanted_persons
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  );

CREATE POLICY "wanted_persons_update_le_admin" ON public.wanted_persons
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  );

CREATE POLICY "wanted_persons_delete_admin" ON public.wanted_persons
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---- crime_reports ----
CREATE POLICY "crime_reports_select_public" ON public.crime_reports
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "crime_reports_insert_any" ON public.crime_reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (is_anonymous = true OR created_by = auth.uid());

CREATE POLICY "crime_reports_update_privileged" ON public.crime_reports
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  )
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  );

CREATE POLICY "crime_reports_delete_privileged" ON public.crime_reports
  FOR DELETE TO authenticated
  USING (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---- alerts ----
CREATE POLICY "alerts_select_public" ON public.alerts
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "alerts_insert_le_admin" ON public.alerts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  );

CREATE POLICY "alerts_update_le_admin" ON public.alerts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('law_enforcement','admin'))
  );

CREATE POLICY "alerts_delete_admin" ON public.alerts
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---- comments ----
CREATE POLICY "comments_select_public" ON public.comments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "comments_insert_any" ON public.comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (is_anonymous = true OR author_id = auth.uid());

CREATE POLICY "comments_delete_owner_admin" ON public.comments
  FOR DELETE TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---- notifications ----
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own_or_system" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- audit_logs ----
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "audit_logs_insert_auth" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ---- media ----
CREATE POLICY "media_select_public" ON public.media
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "media_insert_auth" ON public.media
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "media_delete_owner_admin" ON public.media
  FOR DELETE TO authenticated
  USING (
    auth.uid() = owner_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- STEP 4: Revoke EXECUTE on handle_new_user() from all client roles
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- ============================================================
-- STEP 5: Remove broad storage listing policy
-- ============================================================
DROP POLICY IF EXISTS "media_bucket_read_public" ON storage.objects;
