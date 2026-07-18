# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Austin Salt's personal portfolio site (mechanical engineering student): public pages showcasing projects/achievements/experience/about, fully editable through a private `/admin` dashboard — no code changes needed to add content. Design spec: `docs/superpowers/specs/2026-07-17-portfolio-site-design.md`. Original build plan (large, task-by-task): `docs/superpowers/plans/2026-07-17-portfolio-foundation-and-projects.md`.

## Commands

```bash
npm run dev          # dev server (localhost:3000)
npm run build
npm run lint          # eslint
npm test              # vitest run (single run)
npm run test:watch    # vitest watch mode
npx vitest run lib/slug.test.ts   # run a single test file
```

No E2E test runner is configured — Vitest + Testing Library (jsdom) only. Test files sit next to the code they cover (`lib/*.test.ts`).

## Breaking change: this is Next.js 16, not the Next.js in your training data

`AGENTS.md` already flags this — take it seriously, especially for anything touching routing, config, or request interception. Concretely in this repo:

- **`middleware.ts` does not exist.** It's been renamed **Proxy**: file `proxy.ts` at the project root, exported function is `export function proxy(request)` (or default export), same `export const config = { matcher }` shape. See `proxy.ts` for the working example (Supabase session refresh + `/admin/*` auth gate). Don't reintroduce a `middleware.ts` file out of habit.
- Before relying on any other Next.js API you're not 100% sure about, check `node_modules/next/dist/docs/` rather than assuming training-data behavior.

## Architecture

- **Next.js App Router + TypeScript**, hosted on Vercel, auto-deploys from `main` (GitHub `austinsalt99-hash/Austin-Salt-website`).
- **Supabase** is the entire backend: Postgres (content tables), Auth (single admin user, email/password, no public sign-up), Storage (media, served via Supabase CDN). Schema/RLS policies: `supabase/migrations/0001_init.sql`.
- **Public pages are server components that read directly from Postgres** via `lib/supabase/server.ts` (cookie-based server client). **The admin dashboard is a client app** (`app/admin/**`, all `"use client"`) that does CRUD directly against Supabase from the browser via `lib/supabase/client.ts` — there is no admin API layer; row-level security in the migration is what actually enforces write access (`auth.role() = 'authenticated'`).
- Route groups: `app/(public)/**` (public site, wrapped by `Nav` in its layout) vs `app/admin/**` (login page is unprotected; `app/admin/(dashboard)/**` is the authenticated shell). Auth gating for `/admin/*` happens in `proxy.ts`, not in the dashboard layout itself.
- **Generic collection data layer**: `lib/data/collections.ts` provides `listOrdered`/`createRecord`/`updateRecord`/`deleteRecord`/`reorder`, all generic over table name — this is what admin CRUD screens are built on top of, and how the drag-to-reorder → `position` column pattern is implemented (see `computePositions`). New admin collections (Achievements, Experience) should reuse this rather than writing bespoke Supabase calls.
- **`lib/sectionsReducer.ts`** is a pure, framework-free reducer for the per-project custom-sections editor (add/remove/update/reorder draft sections) — kept separate from the Supabase-backed collections layer since sections are edited as a draft array before being persisted with the parent project.
- **Media upload** (`lib/upload.ts`): images are resized client-side (canvas, max 1920px, JPEG q0.85) before upload to Supabase Storage; non-images pass through unchanged. Videos or oversized media are meant to go through a pasted YouTube/Vimeo link instead (per design spec §8) rather than always uploading raw video.
- **Contact flow**: `app/api/contact/route.ts` validates (`lib/validation.ts`), inserts into `contact_submissions` via the server Supabase client, then best-effort emails via Resend (`lib/email.ts`) — email failure is logged but does not fail the request, since the DB write already succeeded.
- `components/admin/` (SortableList, SectionsRepeater, ImageUploader, ProjectForm) are the reusable building blocks for every admin collection screen; `SortableList` wraps `@dnd-kit` and is generic over any `{ id: string }` item.

## Design system constraints

Defined in `app/globals.css` as Tailwind v4 `@theme` custom properties, with dark-mode overrides under `prefers-color-scheme`:

- Palette: `cream`, `beige`, `brown-900` (ink), `brown-600` (secondary text), `stone-500` (muted/border), `accent` (rust-orange), `error`. **No green. Never use Tailwind default palette colors (e.g. `red-600`) — `error` is the only sanctioned red/danger token.**
- Typography: Inter only, everywhere. Hierarchy comes from weight/spacing, not a second typeface.
- No literal engineering/blueprint/wireframe graphic motifs — the palette and type carry the tone.
- Nav is minimal on every page (name/logo linking home + a Contact button) — don't add extra nav links; the homepage's four hero tiles are the primary navigation.

Full rationale: `docs/superpowers/specs/2026-07-17-portfolio-site-design.md`. Business cards are an explicitly separate, out-of-scope spec (`docs/superpowers/specs/2026-07-17-business-card-design.md`) — don't fold that work into portfolio-site changes.

## Content model note

There is no draft/unpublished state anywhere — everything an admin saves goes live immediately. Don't add draft/publish workflow unless explicitly asked; it was deliberately scoped out.
