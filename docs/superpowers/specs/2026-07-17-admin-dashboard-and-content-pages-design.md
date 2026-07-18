# Admin Dashboard & Content Pages — Design

**Date:** 2026-07-17
**Status:** Approved

## 1. Overview & Goals

Two problems with the current build:

1. Achievements, Experience, and About are still "under construction" placeholders on the public site, and have no admin management at all — only Projects is fully wired up (this was explicitly deferred to a follow-up plan in the original design spec, §2).
2. The admin dashboard (`/admin`) is just a bare link list ("Manage Projects"). It doesn't resemble the site, gives no way to see what a section will look like while editing it, and has no way to set the cover photo shown on each of the 4 homepage tiles.

This spec closes both gaps: full CRUD for Achievements, Experience, and About; real public pages for all three; and an admin dashboard that mirrors the public site's structure (same 4 tiles on `/admin` as on `/`), where every content screen looks like its public counterpart with edit affordances layered on top.

## 2. Data Model

Achievements and Experience already have complete tables from `supabase/migrations/0001_init.sql` (`achievements`: title, description, image_url, position; `experience`: role, organization, date_range, description, image_url, position). About is already a singleton table (`about`: photo_url, bio). None of these need schema changes.

One new table, added in `supabase/migrations/0002_homepage_settings.sql`, following the same singleton pattern as `about`:

```sql
create table homepage_settings (
  id uuid primary key default gen_random_uuid(),
  is_singleton boolean not null default true unique,
  projects_cover_url text,
  achievements_cover_url text,
  about_cover_url text,
  experience_cover_url text,
  updated_at timestamptz not null default now()
);

insert into homepage_settings default values;

alter table homepage_settings enable row level security;
create policy "public read homepage_settings" on homepage_settings for select using (true);
create policy "admin write homepage_settings" on homepage_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

This holds the 4 homepage tile cover photos, independent of any individual project/achievement/experience entry.

## 3. Public Pages

Fills in the three placeholder routes per the original design spec (§6), all as server components reading directly from Supabase (same pattern as the existing `/projects` page):

- **`/achievements`** — grid of cards (image, title, description), ordered by `position`. Same grid layout as `/projects`.
- **`/experience`** — vertical resume-style timeline: each entry shows role, organization, date range, description, and optional image, ordered by `position`.
- **`/about`** — single-column bio text + photo, read from the `about` singleton row.

Empty states match the existing convention ("No `<x>` yet — check back soon.").

## 4. Shared Card/View Components + Admin Controls

Each content type gets one presentational component used by **both** the public page and the admin page:

- `ProjectCard` (existing, extended) — projects grid card
- `AchievementCard` (new) — achievements grid card
- `ExperienceEntryCard` (new) — timeline entry
- `AboutView` (new) — bio + photo block

Each accepts an optional `adminControls?: React.ReactNode` prop. Public pages never pass it, so there is no code path on the live public site that can ever render an edit/delete affordance. Admin pages pass a small control cluster (Edit link, Delete button, drag handle) into that slot. This guarantees the admin view is visually identical to the public one — any future visual change to a card only has to be made once — and keeps "who can see edit controls" enforced structurally (by what's imported/rendered), not just by CSS or auth checks.

## 5. Admin List + Form Screens

For Projects, Achievements, and Experience, each gets:

- **`/admin/<type>`** — renders using the same shared card component as the public page, wrapped in the existing `SortableList` for drag-reorder, each card given `adminControls` (Edit link, Delete button). An "Add new" button sits above the list. This replaces the current plain-list Projects admin screen with the same real-page-styled treatment for all three types.
- **`/admin/<type>/new`** and **`/admin/<type>/[id]/edit`** — the actual entry form, in its own route (unchanged pattern from today's `ProjectForm`). Projects keeps its existing form (title, description, cover photo, gallery, custom sections). Achievements and Experience get new, simpler forms (Achievements: title, description, image; Experience: role, organization, date range, description, image) — no gallery or custom sections, since those aren't part of their data model. On save, redirects back to `/admin/<type>` (existing `router.push` + `router.refresh()` pattern).

About is a singleton, so no add/delete/reorder:

- **`/admin/about`** — renders `AboutView` (same as public `/about`) with a single Edit button.
- **`/admin/about/edit`** — form for bio + photo, saves via `updateRecord`, redirects back to `/admin/about`.

## 6. Admin Home + Tile Cover Photos

`/admin` is restyled to show the same 4 tiles as the public homepage (Projects/Achievements/About/Experience), reusing `SectionTile`, each linking into that type's `/admin/<type>` screen. Each tile additionally gets a small "Change cover" control (reuses the existing `ImageUploader`) that writes directly to the relevant column on the `homepage_settings` singleton row via `updateRecord` — no separate settings page, no navigation away from `/admin`.

`SectionTile` (public-facing, used on `/`) is updated to accept an optional `coverUrl` prop: when set, it renders as the tile's background image (with the existing dark gradient overlaid for text legibility); when not set, it falls back to today's plain gradient background. The homepage (`app/(public)/page.tsx`) fetches `homepage_settings` server-side and passes the relevant URL to each tile.

## 7. Out of Scope

- Hero photo/name editing (still a static asset + hardcoded text) — not part of this round.
- Draft/unpublished states — content still publishes immediately on save, per the original design spec.
- Reordering the 4 homepage tiles themselves — their order stays fixed (Projects, Achievements, About, Experience).
