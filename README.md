# TraceNet — Together for Safer Communities

A production-grade Progressive Web Application (PWA) connecting citizens, law enforcement agencies, and administrators to collaborate on public safety: finding missing persons, locating wanted individuals, reporting suspicious activity, publishing verified safety alerts, and improving community security.

## Tech Stack

**Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, TanStack Query (React Query), React Hook Form, Zod, React Router, Lucide React, Inter font.

**Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions).

**PWA:** manifest.json, service worker, offline caching, install prompt, push notifications, app icons, splash screen.

## Features

- **Splash + Onboarding** — animated splash, 3-screen onboarding flow.
- **Authentication** — email/password, Google OAuth, anonymous reporting. Three roles: Citizen, Law Enforcement, Administrator.
- **Citizen Dashboard** — emergency banner, missing persons, wanted individuals, recent alerts, nearby reports, quick actions.
- **Missing Persons Module** — create/view/edit cases, photo upload, map location, status workflow, sighting reports, share.
- **Wanted Persons Module** — search/filter, detail view, anonymous tips, reward display, share.
- **Crime Reporting Module** — anonymous + registered reporting, categories, photo evidence, geolocation, status workflow (submitted → pending → verified → resolved).
- **Emergency Alert System** — priority levels (low/medium/high/critical), full-screen banner, sound toggle, LE/admin publishing.
- **Global Search** — across people, cases, reports, alerts with tabbed filters.
- **Share System** — Web Share API + direct links to WhatsApp, Facebook, Messenger, X, TikTok.
- **Notifications** — per-user inbox, unread badge, mark-all-read.
- **Settings** — profile editing, notification toggles, language, privacy, logout.
- **Admin Dashboard** — overview stats, user management (role changes), report approval/rejection, case management, alert management, audit logs.
- **PWA** — installable, offline fallback page, cached public info, background sync, push notification handler.

## Database

Supabase PostgreSQL with full RLS:

| Table | Purpose |
|---|---|
| `profiles` | User data linked to `auth.users`, role-based access |
| `missing_persons` | Missing person cases with location, photo, status |
| `wanted_persons` | Wanted notices with charges, reward, agency |
| `crime_reports` | Citizen/anonymous reports with category workflow |
| `alerts` | Emergency/public safety alerts with priority levels |
| `comments` | Sighting reports / tips on any case or report |
| `notifications` | Per-user notification inbox |
| `audit_logs` | Immutable record of admin/LE actions |
| `media` | Uploaded file metadata |

**RLS Strategy:** Public safety data (missing persons, wanted, reports, alerts, comments) is publicly readable (`anon, authenticated`). Write access is role-scoped via a `has_role()` helper. Profiles are owner-scoped with admin read. Notifications are owner-scoped. Audit logs are admin-read-only.

A `handle_new_user()` trigger auto-creates a profile on signup.

## Project Structure

```
src/
  components/
    auth/         — ProtectedRoute
    brand/        — Logo
    layouts/      — AppLayout (bottom nav)
    shared/       — Cards, Badges, ShareButton, ImageUploader, SightingForm, CommentsSection, EmergencyBanner
    ui/           — Button, Card, Input, Badge, Modal, Feedback (Skeleton/EmptyState/ErrorState)
  hooks/          — queries.ts (TanStack Query), usePwa.ts
  lib/            — supabase.ts, utils.ts, share.ts
  pages/
    auth/         — Login, Register, ForgotPassword
    missing/      — List, Detail, Create
    wanted/       — List, Detail
    reports/      — List, Detail, Create
    admin/         — AdminPage
    DashboardPage, SearchPage, AlertsPage, NotificationsPage, ProfilePage, SettingsPage, AboutPage, SplashPage, OnboardingPage
  services/       — Supabase data services (missing, wanted, reports, alerts, comments, notifications, users, audit, storage, location)
  store/          — Zustand stores (auth, ui)
  types/          — TypeScript domain types
public/
  manifest.json, service-worker.js, offline.html, icon.svg, icon-192.png, icon-512.png
```

## Environment Variables

All Supabase credentials are pre-populated in `.env`:

```
VITE_SUPABASE_URL=<project-url>
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Development

```bash
npm install      # install dependencies
npm run dev      # start dev server (runs automatically in this environment)
npm run build    # production build
npm run typecheck # TypeScript check
npm run preview  # preview production build
```

## Deployment

### Frontend (Vercel / Netlify / Firebase Hosting)

1. Run `npm run build` — outputs to `dist/`.
2. Deploy the `dist/` folder.
3. Configure SPA redirect: all routes → `/index.html`.

**Vercel:** Framework preset = Vite, Build command = `npm run build`, Output = `dist`.

**Netlify:** Build command = `npm run build`, Publish = `dist`. Add `_redirects` file with `/* /index.html 200`.

**Firebase Hosting:** `firebase deploy` with `public: "dist"` and a rewrite rule for SPA.

### Backend (Supabase)

The Supabase project is already provisioned. Migrations and seed data are applied via the Supabase MCP tools. The `media` storage bucket is created with public read and authenticated write policies.

## Security Checklist

- [x] Row Level Security on every table
- [x] Role-based access control via `has_role()` helper
- [x] Protected routes (redirect to login if unauthenticated)
- [x] Input validation with Zod on all forms
- [x] Anonymous reporting supported (no auth required for public reports)
- [x] Audit logging for admin/LE actions
- [x] No service-role key exposed to client
- [x] Image compression before upload
- [x] PWA service worker with offline fallback

## Testing Strategy

- **Unit:** Form validation (Zod schemas), utility functions (formatDate, distanceKm, slugify).
- **Integration:** Supabase RLS policy verification — test that anon can read public data, authenticated users can create owned data, cross-user access is denied.
- **E2E:** Critical flows — signup → dashboard, create missing person case, submit anonymous report, admin approve report, publish alert.
- **PWA:** Lighthouse audit for installability, offline support, and performance scores.

## License

Built for public safety collaboration. © TraceNet.
