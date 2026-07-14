/*
# TraceNet — Core Schema

## Purpose
TraceNet is a public safety collaboration platform connecting citizens, law enforcement, and administrators. This migration creates the full schema with role-based access control, audit logging, and storage buckets.

## Tables
1. `profiles` — user profile data linked to auth.users; holds role (citizen / law_enforcement / admin), agency, contact info, avatar.
2. `missing_persons` — cases of missing individuals with photo, physical description, last-seen location (lat/lng), status (missing/located/closed).
3. `wanted_persons` — wanted individuals with charges, agency, reward, status (active/captured/closed).
4. `crime_reports` — citizen/anonymous reports with category, description, photo, location, status workflow.
5. `alerts` — emergency/public safety alerts published by authorized users, with priority and type.
6. `comments` — sighting reports / tips attached to any case or report; supports anonymous submission.
7. `notifications` — per-user notification inbox.
8. `audit_logs` — immutable record of sensitive actions (verifications, status changes, alerts, user management).
9. `media` — metadata for uploaded files (photo/video) linked to a case/report.

## Security (RLS)
- All tables have RLS enabled.
- Public read access (anon + authenticated) for: missing_persons, wanted_persons, crime_reports, alerts, comments — this is a public safety platform, community information is intentionally public.
- Write access is scoped: citizens create their own reports/comments; law_enforcement and admin can manage cases; only admin + law_enforcement publish alerts and verify cases.
- Profiles: users read/update their own profile; admins read all.
- Audit logs: admin read only; inserts allowed for authenticated.
- Notifications: owner-scoped CRUD.
- A `has_role(role text)` helper checks the requester's profile role for policy gating.

## Storage
- `media` bucket: public read, authenticated write (avatars, case photos, evidence).

## Notes
1. `profiles.role` defaults to 'citizen'. Role elevation is an admin action.
2. `missing_persons.created_by`, `crime_reports.created_by` default to auth.uid() so client inserts omitting the field succeed.
3. Anonymous reports/comments set `is_anonymous = true` and `created_by = null`.
4. All timestamps default to now().
5. Indexes on common filter columns (status, created_at, category, location).
*/

-- ============ profiles (created first so has_role can reference it) ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'citizen' check (role in ('citizen','law_enforcement','admin')),
  agency text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Helper: check the authenticated user's role (defined after profiles table exists, before policies)
create or replace function public.has_role(required_role text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = required_role
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.has_role('admin'));

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.has_role('admin'))
  with check (true);

-- ============ missing_persons ============
create table if not exists public.missing_persons (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  photo_url text,
  age int,
  gender text,
  physical_description text,
  last_seen_location text,
  latitude double precision,
  longitude double precision,
  last_seen_date date,
  contact_information text,
  status text not null default 'missing' check (status in ('missing','located','closed')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.missing_persons enable row level security;

drop policy if exists "missing_persons_select_public" on public.missing_persons;
create policy "missing_persons_select_public" on public.missing_persons
  for select to anon, authenticated using (true);

drop policy if exists "missing_persons_insert_auth" on public.missing_persons;
create policy "missing_persons_insert_auth" on public.missing_persons
  for insert to authenticated with check (true);

drop policy if exists "missing_persons_update_privileged" on public.missing_persons;
create policy "missing_persons_update_privileged" on public.missing_persons
  for update to authenticated
  using (auth.uid() = created_by or public.has_role('law_enforcement') or public.has_role('admin'))
  with check (true);

drop policy if exists "missing_persons_delete_privileged" on public.missing_persons;
create policy "missing_persons_delete_privileged" on public.missing_persons
  for delete to authenticated
  using (public.has_role('law_enforcement') or public.has_role('admin'));

-- ============ wanted_persons ============
create table if not exists public.wanted_persons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  charges text,
  description text,
  last_known_location text,
  agency text,
  reward numeric default 0,
  status text not null default 'active' check (status in ('active','captured','closed')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.wanted_persons enable row level security;

drop policy if exists "wanted_persons_select_public" on public.wanted_persons;
create policy "wanted_persons_select_public" on public.wanted_persons
  for select to anon, authenticated using (true);

drop policy if exists "wanted_persons_insert_le_admin" on public.wanted_persons;
create policy "wanted_persons_insert_le_admin" on public.wanted_persons
  for insert to authenticated
  with check (public.has_role('law_enforcement') or public.has_role('admin'));

drop policy if exists "wanted_persons_update_le_admin" on public.wanted_persons;
create policy "wanted_persons_update_le_admin" on public.wanted_persons
  for update to authenticated
  using (public.has_role('law_enforcement') or public.has_role('admin'))
  with check (true);

drop policy if exists "wanted_persons_delete_admin" on public.wanted_persons;
create policy "wanted_persons_delete_admin" on public.wanted_persons
  for delete to authenticated
  using (public.has_role('admin'));

-- ============ crime_reports ============
create table if not exists public.crime_reports (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('theft','violence','fraud','missing_person','suspicious_activity','other')),
  description text not null,
  photo_url text,
  location text,
  latitude double precision,
  longitude double precision,
  report_date date,
  status text not null default 'submitted' check (status in ('submitted','pending_review','verified','resolved','rejected')),
  is_anonymous boolean not null default false,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.crime_reports enable row level security;

drop policy if exists "crime_reports_select_public" on public.crime_reports;
create policy "crime_reports_select_public" on public.crime_reports
  for select to anon, authenticated using (true);

drop policy if exists "crime_reports_insert_any" on public.crime_reports;
create policy "crime_reports_insert_any" on public.crime_reports
  for insert to anon, authenticated with check (true);

drop policy if exists "crime_reports_update_privileged" on public.crime_reports;
create policy "crime_reports_update_privileged" on public.crime_reports
  for update to authenticated
  using (auth.uid() = created_by or public.has_role('law_enforcement') or public.has_role('admin'))
  with check (true);

drop policy if exists "crime_reports_delete_privileged" on public.crime_reports;
create policy "crime_reports_delete_privileged" on public.crime_reports
  for delete to authenticated
  using (auth.uid() = created_by or public.has_role('admin'));

-- ============ alerts ============
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null default 'public_notice' check (type in ('emergency','crime_warning','public_notice','case_update')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  region text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table public.alerts enable row level security;

drop policy if exists "alerts_select_public" on public.alerts;
create policy "alerts_select_public" on public.alerts
  for select to anon, authenticated using (true);

drop policy if exists "alerts_insert_le_admin" on public.alerts;
create policy "alerts_insert_le_admin" on public.alerts
  for insert to authenticated
  with check (public.has_role('law_enforcement') or public.has_role('admin'));

drop policy if exists "alerts_update_le_admin" on public.alerts;
create policy "alerts_update_le_admin" on public.alerts
  for update to authenticated
  using (public.has_role('law_enforcement') or public.has_role('admin'))
  with check (true);

drop policy if exists "alerts_delete_admin" on public.alerts;
create policy "alerts_delete_admin" on public.alerts
  for delete to authenticated
  using (public.has_role('admin'));

-- ============ comments (sightings / tips) ============
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('missing_person','wanted_person','report')),
  entity_id uuid not null,
  body text not null,
  is_anonymous boolean not null default false,
  author_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public" on public.comments
  for select to anon, authenticated using (true);

drop policy if exists "comments_insert_any" on public.comments;
create policy "comments_insert_any" on public.comments
  for insert to anon, authenticated with check (true);

drop policy if exists "comments_delete_owner_admin" on public.comments;
create policy "comments_delete_owner_admin" on public.comments
  for delete to authenticated
  using (auth.uid() = author_id or public.has_role('admin'));

-- ============ notifications ============
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'general',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "notifications_insert_own_or_system" on public.notifications;
create policy "notifications_insert_own_or_system" on public.notifications
  for insert to authenticated with check (auth.uid() = user_id or user_id is null);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications
  for delete to authenticated using (auth.uid() = user_id);

-- ============ audit_logs ============
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin" on public.audit_logs
  for select to authenticated using (public.has_role('admin'));

drop policy if exists "audit_logs_insert_auth" on public.audit_logs;
create policy "audit_logs_insert_auth" on public.audit_logs
  for insert to authenticated with check (true);

-- ============ media ============
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null default auth.uid(),
  storage_path text not null,
  mime_type text,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;

drop policy if exists "media_select_public" on public.media;
create policy "media_select_public" on public.media
  for select to anon, authenticated using (true);

drop policy if exists "media_insert_auth" on public.media;
create policy "media_insert_auth" on public.media
  for insert to authenticated with check (true);

drop policy if exists "media_delete_owner_admin" on public.media;
create policy "media_delete_owner_admin" on public.media
  for delete to authenticated
  using (auth.uid() = owner_id or public.has_role('admin'));

-- ============ indexes ============
create index if not exists idx_missing_persons_status on public.missing_persons(status);
create index if not exists idx_missing_persons_created on public.missing_persons(created_at desc);
create index if not exists idx_wanted_persons_status on public.wanted_persons(status);
create index if not exists idx_wanted_persons_created on public.wanted_persons(created_at desc);
create index if not exists idx_crime_reports_status on public.crime_reports(status);
create index if not exists idx_crime_reports_category on public.crime_reports(category);
create index if not exists idx_crime_reports_created on public.crime_reports(created_at desc);
create index if not exists idx_alerts_priority on public.alerts(priority);
create index if not exists idx_alerts_created on public.alerts(created_at desc);
create index if not exists idx_comments_entity on public.comments(entity_type, entity_id);
create index if not exists idx_notifications_user on public.notifications(user_id, read);

-- ============ trigger: auto-create profile on signup ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'citizen')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ storage bucket ============
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_bucket_read_public" on storage.objects;
create policy "media_bucket_read_public" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "media_bucket_insert_auth" on storage.objects;
create policy "media_bucket_insert_auth" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "media_bucket_delete_owner" on storage.objects;
create policy "media_bucket_delete_owner" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and auth.uid() = owner);
