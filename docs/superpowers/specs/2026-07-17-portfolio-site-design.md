# Austin Salt Portfolio Website — Design

**Date:** 2026-07-17
**Status:** Approved

## 1. Overview & Goals

A personal portfolio website for Austin Salt, a mechanical engineering student, to showcase projects, achievements, experience, and a bio to potential employers/collaborators. The site must be fully editable by Austin through a private admin dashboard — adding a new project (with photos/videos, descriptions, and custom sections) should require no code changes or file editing.

Business cards (digital or printable) are explicitly out of scope for this design — to be revisited later as a separate spec.

## 2. Tech Stack & Architecture

- **Next.js (App Router) + React + TypeScript** — the site itself, hosted on **Vercel**, connected to the GitHub repo `austinsalt99-hash/Austin-Salt-website` for auto-deploy on push to `main`.
- **Supabase**:
  - **Postgres** — stores all content (projects, achievements, experience, about, contact submissions)
  - **Auth** — protects `/admin`; single user (Austin), email/password, no public sign-up
  - **Storage** — holds all uploaded photos/videos, served via Supabase's CDN
- Public pages are server-rendered from the database for speed and shareability. The admin dashboard is a client app behind login that performs CRUD and drag-and-drop media upload.
- All services used stay within free-tier limits at this scale; nothing here requires a paid tier to launch.

## 3. Content Model

- **Projects** (collection, orderable)
  - `title`, `slug`, `cover_photo` (used for the homepage tile and project card), `description`
  - `gallery`: multiple photos/videos for the project
  - `sections`: a flexible, orderable list of `{ title, description }` blocks the user defines per project (e.g. "Design Process," "Manufacturing," "Testing Results") — arbitrary in number and naming
- **Achievements** (collection, orderable)
  - `title`, `description`, optional single `image`
- **Experience** (collection, orderable)
  - `title/role`, `organization`, `date_range`, `description`, optional single `image`
- **About** (singleton)
  - `photo`, freeform `bio` text — edited in place, not a repeatable list
- **Contact submissions** (collection, admin-visible only)
  - `name`, `email`, `message`, `submitted_at`

There is no draft/unpublished state in this version — content goes live as soon as it's saved in the admin dashboard. Reordering within a collection controls its display order on the public site.

## 4. Admin Dashboard

- Route: `/admin`, protected by Supabase Auth (Austin's account only — no public sign-up flow).
- One management view per content type (Projects, Achievements, Experience, About):
  - List view of existing entries with drag-to-reorder
  - "Add new" form: title, description, custom sections (Projects only), drag-and-drop media upload with preview
  - Edit and Delete on existing entries
- Uploaded images are automatically resized/optimized for web on upload so galleries stay fast. Large videos are uploaded directly to Supabase Storage; if a video is large enough to strain the free tier, the admin UI should support pasting a YouTube/Vimeo embed link as an alternative to direct upload.
- Contact submissions are viewable in the admin dashboard (in addition to being emailed).

## 5. Visual Design Direction

- **Palette (confirmed against a live preview):** cream `#F6F2E7` base, beige `#EAE0CC` surfaces, brown `#33271C` primary text/ink, soft brown `#7C6A54` secondary text, gray `#A79C8A` borders/muted, accent rust-orange `#DD6B20`. Dark-mode equivalents defined as CSS custom properties (swap under `prefers-color-scheme`/`data-theme`). No green. Easy to retune later since it's just the CSS variable values.
- **Typography:** Inter only, throughout — hierarchy comes from weight and spacing (extrabold display/headings, regular body, uppercase tracked labels) rather than mixing typefaces. No literal engineering graphic motifs (no blueprint lines, wireframes, or industrial textures) — the palette and typography carry the tone on their own.
- **Hero (`/`):** minimal — Austin's name, with a photo of him blended into the hero composition, followed by 4 large tiles below, one per section (Projects, Achievements, About, Experience), each using a cover photo for that section.
  - Hero photo source: `assets/hero/austin-original.jpg`, with background already removed via `rembg` at `assets/hero/austin-hero-nobg.png` (transparent PNG). Treatment: bottom edge fades into the cream background via a CSS mask gradient (confirmed against a live preview).
  - Note: the current source photo is a casual outdoor shot (ballcap, branded t-shirt) — worth a final gut-check on tone before implementation, or swapping for a different photo later; the background-removal pipeline works the same either way.
  - Tiles are the primary navigation on the homepage — no separate nav-link list competing with them.
  - Subtle interactions: a gentle zoom on tile hover, and a subtle fade/slide-in on page load. Subtle intro text animation on the name/hero text.
- **Nav bar:** persistent and minimal on every page, including the homepage — just name/logo (links home) on one side and a **Contact** button on the other. No additional section links in the nav bar; the homepage tiles and in-page navigation handle that.

## 6. Pages & Routes

| Route | Purpose |
|---|---|
| `/` | Hero (name + photo) + 4 navigation tiles |
| `/projects` | Grid of all projects (cover photo + title) |
| `/projects/[slug]` | Individual project page: gallery, description, custom sections |
| `/achievements` | List of achievement entries |
| `/about` | Bio + photo |
| `/experience` | Resume-style timeline of experience entries |
| `/contact` | Contact info/links + a simple contact form |
| `/admin` | Protected admin dashboard (not linked in public nav) |

## 7. Contact Flow

- The nav bar's Contact button routes to `/contact`.
- `/contact` shows Austin's contact info/links (email, LinkedIn, etc.) alongside a simple form (name, email, message).
- Form submissions are written to Supabase and emailed to Austin via a transactional email service (e.g. Resend free tier).

## 8. Media & Storage

- All media lives in Supabase Storage, organized by content type and entry.
- Images are auto-resized/optimized on upload (via a resize step + Next.js `Image`) to keep galleries performant.
- Videos are uploaded directly to Supabase Storage by default; the admin form also accepts a YouTube/Vimeo link as an alternative for large videos.

## 9. Out of Scope

- Business cards (digital shareable card page and/or printable design) — deferred to a future spec.
- Draft/unpublished content states — everything publishes immediately on save.
- Multi-user accounts / roles — single admin user only.
