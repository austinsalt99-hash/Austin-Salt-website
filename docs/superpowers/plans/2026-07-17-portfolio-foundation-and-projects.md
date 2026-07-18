# Portfolio Foundation + Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js + Supabase portfolio site end-to-end — design system, auth-protected admin, and a fully working Projects feature (public pages + admin CRUD with gallery and custom sections) — deployed live on Vercel.

**Architecture:** Next.js App Router (TypeScript) hosted on Vercel, with Supabase providing Postgres (content), Auth (single admin user), and Storage (media). Public pages are server-rendered reads from Postgres; the admin dashboard is a client app behind `/admin`, protected by a Next.js proxy (formerly "middleware"), doing CRUD via the Supabase browser client (RLS enforces write access). Achievements, Experience, and About get placeholder pages in this plan and full CRUD in a follow-up plan, reusing the generic admin components built here.

**Tech Stack:** Next.js 15 (App Router) + TypeScript, Tailwind CSS v4, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), `@dnd-kit` (drag-to-reorder), Framer Motion (hero animation), Resend (contact email), Vitest + Testing Library (unit tests).

## Global Constraints

- Palette (confirmed against a live design preview): cream `#F6F2E7`, beige `#EAE0CC`, brown ink `#33271C`, soft brown `#7C6A54`, gray/border `#A79C8A`, accent `#DD6B20`. Dark-mode variants swap these under `prefers-color-scheme`. No green. (Design spec §5)
- Typography: Inter only — hierarchy from weight/spacing (extrabold display, regular body, uppercase tracked labels), no second typeface, no literal engineering graphic motifs. (Design spec §5)
- Hero photo treatment: bottom edge fades into the cream background via a CSS `mask-image` gradient (confirmed choice B of 3 previewed options). (Design spec §5)
- Single admin user, no public sign-up. (Design spec §4)
- Content publishes immediately on save — no draft/unpublished states. (Design spec §3, §9)
- Nav bar is minimal on every page, including home: name/logo (links home) + a Contact button. No other nav links. (Design spec §5)
- Homepage hero: name + photo blended in, followed by 4 large tiles (Projects, Achievements, About, Experience) as the primary navigation. Subtle fade/slide-in on load, subtle zoom on tile hover. (Design spec §5)
- Everything must run within Supabase + Vercel free tiers. (Design spec §2)
- Business cards are out of scope for this plan. (Design spec §9)

---

### Task 1: Scaffold Next.js project + testing setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.eslintrc.json` (all via `create-next-app`)
- Create: `vitest.config.ts`, `vitest.setup.ts`

**Interfaces:**
- Produces: a running Next.js dev server on `localhost:3000`, and `npm test` running Vitest.

- [ ] **Step 1: Scaffold the app**

```bash
cd "/Users/austinsalt/Desktop/Austin Salt website"
npx --yes create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm
```

When prompted about the directory not being empty, confirm — the only existing files are `.git`, `.gitignore`, `docs/`, and `assets/`, none of which conflict.

- [ ] **Step 2: Verify the dev server runs**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000 | grep -o "<title>[^<]*</title>"
kill %1
```

Expected: prints a `<title>` tag (the default Next.js title) with no errors above it.

- [ ] **Step 3: Install project dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities framer-motion resend
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Add test scripts**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Verify Vitest runs with zero tests**

```bash
npm test
```

Expected: Vitest reports "No test files found" without erroring (exit code may be non-zero on some versions when zero tests are found — confirm it's a "no tests" message, not a config error).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js app with Tailwind, Supabase, and Vitest"
```

---

### Task 2: Design tokens + fonts

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: Tailwind theme colors `cream`, `beige`, `brown-900`, `brown-600`, `stone-500`, `accent`, and font variable `--font-inter`, available to every later task's markup.

- [ ] **Step 1: Define the theme in `app/globals.css`**

Replace the file contents with:

```css
@import "tailwindcss";

@theme {
  --color-cream: #f6f2e7;
  --color-beige: #eae0cc;
  --color-brown-900: #33271c;
  --color-brown-600: #7c6a54;
  --color-stone-500: #a79c8a;
  --color-accent: #dd6b20;
  --font-sans: var(--font-inter);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-cream: #1c1712;
    --color-beige: #2b2219;
    --color-brown-900: #f3ead9;
    --color-brown-600: #c9b8a0;
    --color-stone-500: #4d4032;
    --color-accent: #e8802e;
  }
}

body {
  background-color: var(--color-cream);
  color: var(--color-brown-900);
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

These are the exact values confirmed in the design preview (light and dark). `brown-900` intentionally becomes the light text color in dark mode and vice versa — components should always reference the token name (`text-brown-900`, `bg-cream`), never the literal hex, so this swap propagates everywhere automatically.

- [ ] **Step 2: Wire the Inter font in `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Austin Salt — Mechanical Engineering",
  description: "Portfolio of Austin Salt, mechanical engineering student.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Replace the default home page with a palette check**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-semibold text-brown-900">Austin Salt</h1>
      <p className="text-brown-600">Mechanical Engineering Student</p>
      <span className="rounded-full bg-accent px-4 py-1 text-sm text-cream">accent</span>
    </main>
  );
}
```

- [ ] **Step 4: Verify visually**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000 | grep -o "bg-accent"
kill %1
```

Expected: `bg-accent` appears in the output. Also open `http://localhost:3000` in a browser and confirm the background reads as cream (not white) and the pill is orange.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add cream/beige/brown/orange design tokens and Inter font"
```

---

### Task 3: Nav component + Contact page shell

**Files:**
- Create: `components/Nav.tsx`
- Create: `app/contact/page.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: Tailwind tokens from Task 2.
- Produces: `<Nav />` component rendered on every page via root layout; route `/contact` exists (form added in Task 8).

- [ ] **Step 1: Create the Nav component**

```tsx
import Link from "next/link";

export function Nav() {
  return (
    <header className="flex items-center justify-between px-6 py-4 sm:px-10">
      <Link href="/" className="text-lg font-semibold text-brown-900">
        Austin Salt
      </Link>
      <Link
        href="/contact"
        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-cream transition hover:opacity-90"
      >
        Contact
      </Link>
    </header>
  );
}
```

- [ ] **Step 2: Render Nav in the root layout**

In `app/layout.tsx`, import and render it:

```tsx
import { Nav } from "@/components/Nav";
// ...
      <body className="font-sans">
        <Nav />
        {children}
      </body>
```

- [ ] **Step 3: Create a placeholder Contact page**

```tsx
export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">Contact</h1>
      <p className="mt-4 text-brown-600">
        austinsalt99@gmail.com
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Verify manually**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000/contact | grep -o "Contact"
kill %1
```

Expected: `Contact` appears. Open the browser and confirm the Nav shows on both `/` and `/contact`, with the Contact button always visible.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add persistent Nav with Contact button and Contact page shell"
```

---

### Task 4: Supabase client setup

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `.env.local.example`

**Interfaces:**
- Produces: `createClient()` (browser, from `lib/supabase/client.ts`) and `createClient()` (server, async, from `lib/supabase/server.ts`) — both return a Supabase client. All later data-access code imports one of these.

- [ ] **Step 1: Create the browser client**

`lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create the server client**

`lib/supabase/server.ts`:

```ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render; proxy.ts refreshes the session instead.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Document required env vars**

`.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
CONTACT_EMAIL=austinsalt99@gmail.com
```

Copy this to `.env.local` and fill in real values from the Supabase project dashboard (Settings → API) once the project exists (Task 5 creates it).

- [ ] **Step 4: Verify the app still builds**

```bash
npm run build
```

Expected: build succeeds (these files aren't imported anywhere yet, so this just confirms no syntax errors).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add Supabase browser/server client helpers"
```

---

### Task 5: Database schema + Storage bucket

**Files:**
- Create: `supabase/migrations/0001_init.sql`
- Create: `lib/types.ts`

**Interfaces:**
- Produces: tables `projects`, `project_gallery_items`, `project_sections`, `achievements`, `experience`, `about`, `contact_submissions`; Storage bucket `media`. TypeScript types `Project`, `ProjectGalleryItem`, `ProjectSection`, `Achievement`, `ExperienceEntry`, `About`, `ContactSubmission` in `lib/types.ts`, imported by all later data-access and component code.

- [ ] **Step 1: Create the Supabase project (manual, one-time)**

Go to https://supabase.com/dashboard, create a new free-tier project (e.g. named "austin-salt-portfolio"). Note the project URL and anon key from Settings → API — put them in `.env.local` (see Task 4 Step 3).

- [ ] **Step 2: Write the schema migration**

`supabase/migrations/0001_init.sql`:

```sql
create extension if not exists "pgcrypto";

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_photo_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table project_gallery_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  position integer not null default 0
);

create table project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organization text not null,
  date_range text,
  description text,
  image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table about (
  id uuid primary key default gen_random_uuid(),
  is_singleton boolean not null default true unique,
  photo_url text,
  bio text,
  updated_at timestamptz not null default now()
);

insert into about (bio) values ('Mechanical engineering student.');

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  submitted_at timestamptz not null default now()
);

alter table projects enable row level security;
alter table project_gallery_items enable row level security;
alter table project_sections enable row level security;
alter table achievements enable row level security;
alter table experience enable row level security;
alter table about enable row level security;
alter table contact_submissions enable row level security;

create policy "public read projects" on projects for select using (true);
create policy "public read project_gallery_items" on project_gallery_items for select using (true);
create policy "public read project_sections" on project_sections for select using (true);
create policy "public read achievements" on achievements for select using (true);
create policy "public read experience" on experience for select using (true);
create policy "public read about" on about for select using (true);

create policy "admin write projects" on projects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write project_gallery_items" on project_gallery_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write project_sections" on project_sections for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write achievements" on achievements for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write experience" on experience for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write about" on about for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "anyone can submit contact form" on contact_submissions for insert with check (true);
create policy "admin read contact_submissions" on contact_submissions for select using (auth.role() = 'authenticated');
create policy "admin delete contact_submissions" on contact_submissions for delete using (auth.role() = 'authenticated');
```

- [ ] **Step 3: Apply the migration**

In the Supabase dashboard, open SQL Editor, paste the contents of `supabase/migrations/0001_init.sql`, and run it. Confirm all 7 tables appear under Table Editor.

- [ ] **Step 4: Create the Storage bucket**

In the Supabase dashboard, go to Storage → New bucket. Name it `media`, mark it **public**. This lets uploaded photos/videos be read via public URL while writes still require an authenticated session (default Storage policies restrict writes to authenticated users on a public bucket — confirm the bucket's policies show `authenticated` required for insert/update/delete).

- [ ] **Step 5: Add shared TypeScript types**

`lib/types.ts`:

```ts
export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_photo_url: string | null;
  position: number;
  created_at: string;
};

export type ProjectGalleryItem = {
  id: string;
  project_id: string;
  media_url: string;
  media_type: "image" | "video";
  position: number;
};

export type ProjectSection = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  position: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  position: number;
  created_at: string;
};

export type ExperienceEntry = {
  id: string;
  role: string;
  organization: string;
  date_range: string | null;
  description: string | null;
  image_url: string | null;
  position: number;
  created_at: string;
};

export type About = {
  id: string;
  photo_url: string | null;
  bio: string | null;
  updated_at: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  submitted_at: string;
};
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add database schema, RLS policies, and shared types"
```

---

### Task 6: Slug utility (TDD)

**Files:**
- Create: `lib/slug.ts`
- Test: `lib/slug.test.ts`

**Interfaces:**
- Produces: `slugify(title: string): string`, `uniqueSlug(base: string, existing: string[]): string` — used by the project form in Task 13.

- [ ] **Step 1: Write the failing tests**

`lib/slug.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Baja Suspension Redesign")).toBe("baja-suspension-redesign");
  });

  it("strips punctuation", () => {
    expect(slugify("CAD/CAM: Part 2!")).toBe("cad-cam-part-2");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Robot Arm--  ")).toBe("robot-arm");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when it's not taken", () => {
    expect(uniqueSlug("robot-arm", ["baja-suspension"])).toBe("robot-arm");
  });

  it("appends -2 when the base slug is taken", () => {
    expect(uniqueSlug("robot-arm", ["robot-arm"])).toBe("robot-arm-2");
  });

  it("increments past multiple collisions", () => {
    expect(uniqueSlug("robot-arm", ["robot-arm", "robot-arm-2", "robot-arm-3"])).toBe("robot-arm-4");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/slug.test.ts
```

Expected: FAIL — `lib/slug.ts` does not exist.

- [ ] **Step 3: Implement**

`lib/slug.ts`:

```ts
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- lib/slug.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add slug generation utility"
```

---

### Task 7: Admin auth (login, proxy guard, logout)

**Note:** this project scaffolded on Next.js 16, where the `middleware.ts` file convention is deprecated in favor of `proxy.ts` (same API — `NextRequest`/`NextResponse`, cookies, `matcher` config — just the file name and exported function are renamed from `middleware` to `proxy`). Use `proxy.ts`, not `middleware.ts`.

**Files:**
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/(dashboard)/layout.tsx`
- Create: `app/admin/(dashboard)/page.tsx`
- Create: `proxy.ts`

**Interfaces:**
- Consumes: `createClient()` from `lib/supabase/client.ts` (Task 4).
- Produces: `/admin/*` routes redirect unauthenticated visitors to `/admin/login`. Authenticated dashboard shell renders `{children}` for later admin pages (Tasks 12–13).

- [ ] **Step 1: Create the login page**

`app/admin/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 px-6 py-24">
      <h1 className="text-2xl font-semibold text-brown-900">Admin Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-beige bg-cream px-4 py-2"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-beige bg-cream px-4 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-accent px-5 py-2 font-medium text-cream disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Create the protected dashboard layout**

`app/admin/(dashboard)/layout.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div>
      <header className="flex items-center justify-between border-b border-beige px-6 py-4">
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="text-brown-900">Dashboard</Link>
          <Link href="/admin/projects" className="text-brown-600">Projects</Link>
        </nav>
        <button onClick={handleLogout} className="text-sm text-brown-600 underline">
          Log out
        </button>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Create the dashboard index page**

`app/admin/(dashboard)/page.tsx`:

```tsx
import Link from "next/link";

export default function AdminHome() {
  return (
    <main className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold text-brown-900">Admin</h1>
      <Link href="/admin/projects" className="text-accent underline">
        Manage Projects
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Create the auth-guard proxy**

`proxy.ts` (repo root):

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginRoute) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 5: Create the admin user (manual, one-time)**

In the Supabase dashboard, go to Authentication → Users → Add user. Create Austin's account with email + password. This is the only account that will ever exist.

- [ ] **Step 6: Verify manually**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin
kill %1
```

Expected: `307` (redirect to login) since no session exists yet. Then open `http://localhost:3000/admin` in a browser, confirm it redirects to `/admin/login`, log in with the account from Step 5, and confirm it lands on `/admin` with the dashboard shell and working "Log out" button.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add admin auth: login page, proxy guard, dashboard shell"
```

---

### Task 8: Contact form (validation TDD + API route + email)

**Files:**
- Create: `lib/validation.ts`
- Test: `lib/validation.test.ts`
- Create: `lib/email.ts`
- Create: `app/api/contact/route.ts`
- Create: `components/ContactForm.tsx`
- Modify: `app/contact/page.tsx`

**Interfaces:**
- Consumes: `createClient()` (server, Task 4).
- Produces: `POST /api/contact` accepting `{ name, email, message }`, returning `{ success: true }` or `{ errors }`.

- [ ] **Step 1: Write the failing validation tests**

`lib/validation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validateContactSubmission } from "./validation";

describe("validateContactSubmission", () => {
  it("passes with valid input", () => {
    const result = validateContactSubmission({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "I'd love to talk about your Baja project.",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("requires a name", () => {
    const result = validateContactSubmission({ name: "  ", email: "jane@example.com", message: "Hello there!" });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("rejects an invalid email", () => {
    const result = validateContactSubmission({ name: "Jane", email: "not-an-email", message: "Hello there!" });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("requires a message of at least 10 characters", () => {
    const result = validateContactSubmission({ name: "Jane", email: "jane@example.com", message: "hi" });
    expect(result.valid).toBe(false);
    expect(result.errors.message).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/validation.test.ts
```

Expected: FAIL — `lib/validation.ts` does not exist.

- [ ] **Step 3: Implement validation**

`lib/validation.ts`:

```ts
export type ContactInput = {
  name: string;
  email: string;
  message: string;
};

export type ContactValidationResult = {
  valid: boolean;
  errors: Partial<Record<keyof ContactInput, string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactSubmission(input: ContactInput): ContactValidationResult {
  const errors: ContactValidationResult["errors"] = {};

  if (!input.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!input.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!input.message.trim()) {
    errors.message = "Message is required.";
  } else if (input.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- lib/validation.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Add the email sender**

`lib/email.ts`:

```ts
import { Resend } from "resend";
import type { ContactInput } from "./validation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(input: ContactInput) {
  await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: process.env.CONTACT_EMAIL!,
    replyTo: input.email,
    subject: `New message from ${input.name}`,
    text: input.message,
  });
}
```

Sign up for a free Resend account at https://resend.com, create an API key, and add it to `.env.local` as `RESEND_API_KEY`.

- [ ] **Step 6: Add the API route**

`app/api/contact/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateContactSubmission } from "@/lib/validation";
import { sendContactEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const input = {
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    message: String(body.message ?? ""),
  };

  const result = validateContactSubmission(input);
  if (!result.valid) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
  });

  if (error) {
    return NextResponse.json(
      { errors: { message: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }

  await sendContactEmail(input);

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 7: Add the contact form component**

`components/ContactForm.tsx`:

```tsx
"use client";

import { useState } from "react";

export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrors({});
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrors(data.errors ?? {});
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return <p className="text-brown-900">Thanks — I'll get back to you soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        placeholder="Name"
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />
      {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}

      <input
        placeholder="Email"
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />
      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}

      <textarea
        placeholder="Message"
        rows={5}
        value={values.message}
        onChange={(e) => setValues({ ...values, message: e.target.value })}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />
      {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-accent px-5 py-2 font-medium text-cream disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
```

- [ ] **Step 8: Wire it into the Contact page**

`app/contact/page.tsx`:

```tsx
import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">Contact</h1>
      <p className="mt-4 text-brown-600">austinsalt99@gmail.com</p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </main>
  );
}
```

- [ ] **Step 9: Verify manually**

```bash
npm run dev &
sleep 3
curl -s -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"name":"","email":"","message":""}'
kill %1
```

Expected: JSON with `errors` for all three fields. Then in the browser, submit `/contact` with valid data and confirm you receive the email and a row appears in `contact_submissions` in the Supabase dashboard.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Add contact form with validation, Supabase insert, and email notification"
```

---

### Task 9: Generic admin data layer + drag-reorder list

**Files:**
- Create: `lib/data/collections.ts`
- Test: `lib/data/collections.test.ts`
- Create: `components/admin/SortableList.tsx`

**Interfaces:**
- Consumes: `createClient()` (browser, Task 4).
- Produces: `listOrdered<T>(table)`, `createRecord<T>(table, values)`, `updateRecord<T>(table, id, values)`, `deleteRecord(table, id)`, `reorder(table, orderedIds)`, `computePositions(orderedIds)`. `<SortableList items renderItem onReorder />` component, reused by Task 12 (Projects admin list) and the follow-up Achievements/Experience plan.

- [ ] **Step 1: Write the failing test for the pure reorder logic**

`lib/data/collections.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computePositions } from "./collections";

describe("computePositions", () => {
  it("assigns positions matching array order", () => {
    expect(computePositions(["a", "b", "c"])).toEqual([
      { id: "a", position: 0 },
      { id: "b", position: 1 },
      { id: "c", position: 2 },
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(computePositions([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- lib/data/collections.test.ts
```

Expected: FAIL — `lib/data/collections.ts` does not exist.

- [ ] **Step 3: Implement the data layer**

`lib/data/collections.ts`:

```ts
import { createClient } from "@/lib/supabase/client";

export type PositionedRecord = { id: string; position: number };

export function computePositions(orderedIds: string[]): PositionedRecord[] {
  return orderedIds.map((id, index) => ({ id, position: index }));
}

export async function listOrdered<T>(table: string): Promise<T[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).select("*").order("position", { ascending: true });
  if (error) throw error;
  return data as T[];
}

export async function createRecord<T extends Record<string, unknown>>(
  table: string,
  values: T
): Promise<T & { id: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateRecord<T extends Record<string, unknown>>(
  table: string,
  id: string,
  values: Partial<T>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from(table).update(values).eq("id", id);
  if (error) throw error;
}

export async function deleteRecord(table: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function reorder(table: string, orderedIds: string[]): Promise<void> {
  const supabase = createClient();
  const updates = computePositions(orderedIds);
  await Promise.all(
    updates.map(({ id, position }) => supabase.from(table).update({ position }).eq("id", id))
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- lib/data/collections.test.ts
```

Expected: PASS, 2 tests.

- [ ] **Step 5: Build the drag-reorder list component**

`components/admin/SortableList.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type SortableListItem = { id: string };

export function SortableList<T extends SortableListItem>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T) => React.ReactNode;
}) {
  const [ordered, setOrdered] = useState(items);
  useEffect(() => setOrdered(items), [items]);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((item) => item.id === active.id);
    const newIndex = ordered.findIndex((item) => item.id === over.id);
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    onReorder(next.map((item) => item.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-3">
          {ordered.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-beige bg-cream p-3"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-stone-500" aria-label="Drag to reorder">
        ⠿
      </button>
      <div className="flex-1">{children}</div>
    </li>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add generic collection data layer and drag-reorder list component"
```

---

### Task 10: Image upload helper + uploader component

**Files:**
- Create: `lib/upload.ts`
- Test: `lib/upload.test.ts`
- Create: `components/admin/ImageUploader.tsx`

**Interfaces:**
- Consumes: `createClient()` (browser, Task 4).
- Produces: `computeResizeDimensions(width, height, maxDimension)`, `uploadMedia(file, path): Promise<string>` (returns public URL). `<ImageUploader path label onUploaded />` component, used by Task 13's project form.

- [ ] **Step 1: Write the failing test for the pure resize-math function**

`lib/upload.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeResizeDimensions } from "./upload";

describe("computeResizeDimensions", () => {
  it("leaves small images unchanged", () => {
    expect(computeResizeDimensions(800, 600, 1920)).toEqual({ width: 800, height: 600 });
  });

  it("downscales a wide image to fit the max dimension", () => {
    expect(computeResizeDimensions(4000, 2000, 1920)).toEqual({ width: 1920, height: 960 });
  });

  it("downscales a tall image to fit the max dimension", () => {
    expect(computeResizeDimensions(2000, 4000, 1920)).toEqual({ width: 960, height: 1920 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- lib/upload.test.ts
```

Expected: FAIL — `lib/upload.ts` does not exist.

- [ ] **Step 3: Implement**

`lib/upload.ts`:

```ts
import { createClient } from "@/lib/supabase/client";

export function computeResizeDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

async function resizeImageFile(file: File, maxDimension = 1920): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = computeResizeDimensions(bitmap.width, bitmap.height, maxDimension);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Resize failed"))), "image/jpeg", 0.85);
  });
}

export async function uploadMedia(file: File, path: string): Promise<string> {
  const supabase = createClient();
  const isImage = file.type.startsWith("image/");
  const toUpload = isImage ? await resizeImageFile(file) : file;
  const ext = isImage ? "jpg" : file.name.split(".").pop();
  const fullPath = `${path}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(fullPath, toUpload, {
    contentType: isImage ? "image/jpeg" : file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(fullPath);
  return data.publicUrl;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- lib/upload.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Build the uploader component**

`components/admin/ImageUploader.tsx`:

```tsx
"use client";

import { useCallback, useState } from "react";
import { uploadMedia } from "@/lib/upload";

export function ImageUploader({
  path,
  onUploaded,
  label,
}: {
  path: string;
  onUploaded: (url: string) => void;
  label: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      setError(null);
      try {
        for (const file of Array.from(files)) {
          const url = await uploadMedia(file, path);
          onUploaded(url);
        }
      } catch {
        setError("Upload failed. Try a different file.");
      } finally {
        setUploading(false);
      }
    },
    [path, onUploaded]
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
      className="rounded-lg border-2 border-dashed border-brown-600/40 bg-beige/40 p-6 text-center"
    >
      <label className="cursor-pointer text-brown-600">
        {uploading ? "Uploading…" : label}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add image resize/upload helper and drag-and-drop uploader component"
```

---

### Task 11: Hero homepage + section tiles + placeholder pages

**Files:**
- Create: `public/images/hero/austin.png` (moved from `assets/hero/austin-hero-nobg.png`)
- Create: `components/Hero.tsx`
- Create: `components/SectionTile.tsx`
- Modify: `app/page.tsx`
- Create: `app/about/page.tsx`, `app/achievements/page.tsx`, `app/experience/page.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `<Hero />`, `<SectionTile href label accentLabel />` — the homepage's 4 tiles link to `/projects`, `/achievements`, `/about`, `/experience`.

- [ ] **Step 1: Move the hero photo into `public/`**

```bash
mkdir -p "public/images/hero"
cp "assets/hero/austin-hero-nobg.png" "public/images/hero/austin.png"
```

- [ ] **Step 2: Build the Hero component**

`components/Hero.tsx`:

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6 pb-16 pt-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <Image
          src="/images/hero/austin.png"
          alt="Austin Salt"
          width={360}
          height={480}
          priority
          className="mx-auto h-[320px] w-auto object-contain sm:h-[420px]"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
          }}
        />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="mt-4 text-4xl font-semibold text-brown-900 sm:text-5xl"
      >
        Austin Salt
      </motion.h1>
    </section>
  );
}
```

- [ ] **Step 3: Build the SectionTile component**

`components/SectionTile.tsx`:

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function SectionTile({ href, label }: { href: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group relative flex h-56 items-end overflow-hidden rounded-2xl bg-gradient-to-br from-brown-600 to-brown-900 p-6 transition-transform duration-300 ease-out hover:scale-[1.03]"
      >
        <span className="text-2xl font-semibold text-cream">{label}</span>
      </Link>
    </motion.div>
  );
}
```

(The gradient is a placeholder cover — swap in a real photo per section later by adding an `<Image>` behind the label and dropping files into `public/images/tiles/`.)

- [ ] **Step 4: Assemble the homepage**

`app/page.tsx`:

```tsx
import { Hero } from "@/components/Hero";
import { SectionTile } from "@/components/SectionTile";

export default function Home() {
  return (
    <main>
      <Hero />
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-2">
        <SectionTile href="/projects" label="Projects" />
        <SectionTile href="/achievements" label="Achievements" />
        <SectionTile href="/about" label="About" />
        <SectionTile href="/experience" label="Experience" />
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Add placeholder pages for the not-yet-built sections**

`app/about/page.tsx`, `app/achievements/page.tsx`, `app/experience/page.tsx` — same content, swap the heading:

```tsx
export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-brown-900">About</h1>
      <p className="mt-4 text-brown-600">This section is under construction — check back soon.</p>
    </main>
  );
}
```

- [ ] **Step 6: Verify manually**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000 | grep -o "Projects"
kill %1
```

Expected: `Projects` appears. Open the browser and confirm: the hero photo renders with no white box around it (transparent PNG), the name fades in, the 4 tiles fade in on scroll, and hovering a tile gives a subtle zoom.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add hero homepage with animated tiles and section placeholder pages"
```

---

### Task 12: Admin — Projects list (reorder + delete)

**Files:**
- Create: `app/admin/(dashboard)/projects/page.tsx`

**Interfaces:**
- Consumes: `listOrdered<Project>`, `deleteRecord`, `reorder` (Task 9), `SortableList` (Task 9), `Project` type (Task 5).
- Produces: `/admin/projects` — list view with drag-reorder and delete, linking to `/admin/projects/new` and `/admin/projects/[id]/edit` (Task 13).

- [ ] **Step 1: Build the list page**

`app/admin/(dashboard)/projects/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrdered, deleteRecord, reorder } from "@/lib/data/collections";
import { SortableList } from "@/components/admin/SortableList";
import type { Project } from "@/lib/types";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listOrdered<Project>("projects").then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This can't be undone.")) return;
    await deleteRecord("projects", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleReorder(orderedIds: string[]) {
    await reorder("projects", orderedIds);
  }

  if (loading) return <p className="text-brown-600">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Projects</h1>
        <Link href="/admin/projects/new" className="rounded-full bg-accent px-4 py-2 text-sm text-cream">
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-brown-600">No projects yet.</p>
      ) : (
        <SortableList
          items={projects}
          onReorder={handleReorder}
          renderItem={(project) => (
            <div className="flex items-center justify-between">
              <span className="text-brown-900">{project.title}</span>
              <div className="flex gap-3 text-sm">
                <Link href={`/admin/projects/${project.id}/edit`} className="text-accent underline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(project.id)} className="text-red-600 underline">
                  Delete
                </button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify manually**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/projects
kill %1
```

Expected: `307` (redirected to login, unauthenticated). Log in via the browser and confirm `/admin/projects` shows "No projects yet." and a working "New Project" link (404s until Task 13).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add admin projects list with drag-reorder and delete"
```

---

### Task 13: Admin — Project create/edit form (sections repeater TDD)

**Files:**
- Create: `lib/sectionsReducer.ts`
- Test: `lib/sectionsReducer.test.ts`
- Create: `components/admin/SectionsRepeater.tsx`
- Create: `components/admin/ProjectForm.tsx`
- Create: `app/admin/(dashboard)/projects/new/page.tsx`
- Create: `app/admin/(dashboard)/projects/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `slugify`, `uniqueSlug` (Task 6), `createRecord`, `updateRecord`, `listOrdered` (Task 9), `ImageUploader` (Task 10), `Project`, `ProjectGalleryItem`, `ProjectSection` types (Task 5).
- Produces: fully working `/admin/projects/new` and `/admin/projects/[id]/edit`.

- [ ] **Step 1: Write the failing tests for the sections reducer**

`lib/sectionsReducer.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { addSection, removeSection, updateSection, moveSection } from "./sectionsReducer";
import type { SectionDraft } from "./sectionsReducer";

const base: SectionDraft[] = [
  { id: "1", title: "Design", description: "d1" },
  { id: "2", title: "Testing", description: "d2" },
];

describe("sectionsReducer", () => {
  it("adds a blank section", () => {
    const next = addSection(base);
    expect(next).toHaveLength(3);
    expect(next[2].title).toBe("");
  });

  it("removes a section by id", () => {
    const next = removeSection(base, "1");
    expect(next).toEqual([{ id: "2", title: "Testing", description: "d2" }]);
  });

  it("updates a section's fields", () => {
    const next = updateSection(base, "1", { title: "Manufacturing" });
    expect(next[0].title).toBe("Manufacturing");
    expect(next[0].description).toBe("d1");
  });

  it("moves a section up", () => {
    const next = moveSection(base, "2", "up");
    expect(next.map((s) => s.id)).toEqual(["2", "1"]);
  });

  it("does not move the first section further up", () => {
    const next = moveSection(base, "1", "up");
    expect(next.map((s) => s.id)).toEqual(["1", "2"]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/sectionsReducer.test.ts
```

Expected: FAIL — `lib/sectionsReducer.ts` does not exist.

- [ ] **Step 3: Implement the reducer**

`lib/sectionsReducer.ts`:

```ts
export type SectionDraft = { id: string; title: string; description: string };

export function addSection(sections: SectionDraft[]): SectionDraft[] {
  return [...sections, { id: crypto.randomUUID(), title: "", description: "" }];
}

export function removeSection(sections: SectionDraft[], id: string): SectionDraft[] {
  return sections.filter((s) => s.id !== id);
}

export function updateSection(
  sections: SectionDraft[],
  id: string,
  values: Partial<Pick<SectionDraft, "title" | "description">>
): SectionDraft[] {
  return sections.map((s) => (s.id === id ? { ...s, ...values } : s));
}

export function moveSection(sections: SectionDraft[], id: string, direction: "up" | "down"): SectionDraft[] {
  const index = sections.findIndex((s) => s.id === id);
  if (index === -1) return sections;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sections.length) return sections;
  const next = [...sections];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- lib/sectionsReducer.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Build the SectionsRepeater UI**

`components/admin/SectionsRepeater.tsx`:

```tsx
"use client";

import { addSection, removeSection, updateSection, moveSection } from "@/lib/sectionsReducer";
import type { SectionDraft } from "@/lib/sectionsReducer";

export function SectionsRepeater({
  sections,
  onChange,
}: {
  sections: SectionDraft[];
  onChange: (sections: SectionDraft[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, i) => (
        <div key={section.id} className="flex flex-col gap-2 rounded-lg border border-beige p-4">
          <input
            placeholder="Section title (e.g. Design Process)"
            value={section.title}
            onChange={(e) => onChange(updateSection(sections, section.id, { title: e.target.value }))}
            className="rounded-lg border border-beige bg-cream px-3 py-2 font-medium"
          />
          <textarea
            placeholder="Section description"
            rows={3}
            value={section.description}
            onChange={(e) => onChange(updateSection(sections, section.id, { description: e.target.value }))}
            className="rounded-lg border border-beige bg-cream px-3 py-2"
          />
          <div className="flex gap-3 text-sm text-brown-600">
            <button type="button" disabled={i === 0} onClick={() => onChange(moveSection(sections, section.id, "up"))} className="disabled:opacity-30">
              Move up
            </button>
            <button type="button" disabled={i === sections.length - 1} onClick={() => onChange(moveSection(sections, section.id, "down"))} className="disabled:opacity-30">
              Move down
            </button>
            <button type="button" onClick={() => onChange(removeSection(sections, section.id))} className="text-red-600">
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange(addSection(sections))}
        className="self-start rounded-full border border-accent px-4 py-2 text-sm text-accent"
      >
        + Add Section
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Build the ProjectForm**

`components/admin/ProjectForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify, uniqueSlug } from "@/lib/slug";
import { createRecord, updateRecord, listOrdered } from "@/lib/data/collections";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SectionsRepeater } from "@/components/admin/SectionsRepeater";
import type { SectionDraft } from "@/lib/sectionsReducer";
import type { Project } from "@/lib/types";

export type ProjectFormInitialData = {
  id: string;
  title: string;
  description: string;
  coverPhotoUrl: string;
  galleryUrls: string[];
  sections: SectionDraft[];
};

export function ProjectForm({ initialData }: { initialData?: ProjectFormInitialData }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(initialData?.coverPhotoUrl ?? "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialData?.galleryUrls ?? []);
  const [sections, setSections] = useState<SectionDraft[]>(initialData?.sections ?? []);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    let projectId = initialData?.id;

    if (projectId) {
      await updateRecord<Project>("projects", projectId, {
        title,
        description,
        cover_photo_url: coverPhotoUrl,
      });
      await supabase.from("project_gallery_items").delete().eq("project_id", projectId);
      await supabase.from("project_sections").delete().eq("project_id", projectId);
    } else {
      const existing = await listOrdered<Project>("projects");
      const slug = uniqueSlug(slugify(title), existing.map((p) => p.slug));
      const created = await createRecord<Record<string, unknown>>("projects", {
        title,
        slug,
        description,
        cover_photo_url: coverPhotoUrl,
        position: existing.length,
      });
      projectId = created.id as string;
    }

    if (galleryUrls.length > 0) {
      await supabase.from("project_gallery_items").insert(
        galleryUrls.map((url, i) => ({
          project_id: projectId,
          media_url: url,
          media_type: url.match(/\.(mp4|mov|webm)$/i) ? "video" : "image",
          position: i,
        }))
      );
    }

    if (sections.length > 0) {
      await supabase.from("project_sections").insert(
        sections.map((s, i) => ({
          project_id: projectId,
          title: s.title,
          description: s.description,
          position: i,
        }))
      );
    }

    setSaving(false);
    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <input
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-beige bg-cream px-4 py-2 text-lg"
      />
      <textarea
        placeholder="Description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />

      <div>
        <p className="mb-2 text-sm font-medium text-brown-600">Cover photo</p>
        {coverPhotoUrl && <img src={coverPhotoUrl} alt="" className="mb-2 h-32 w-auto rounded-lg object-cover" />}
        <ImageUploader path="projects/covers" label="Drop a cover photo here" onUploaded={setCoverPhotoUrl} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-brown-600">Gallery</p>
        <div className="mb-2 flex flex-wrap gap-2">
          {galleryUrls.map((url) => (
            <img key={url} src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
          ))}
        </div>
        <ImageUploader
          path="projects/gallery"
          label="Drop photos or videos here"
          onUploaded={(url) => setGalleryUrls((prev) => [...prev, url])}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-brown-600">Sections</p>
        <SectionsRepeater sections={sections} onChange={setSections} />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !title}
        className="self-start rounded-full bg-accent px-6 py-2 font-medium text-cream disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Project"}
      </button>
    </div>
  );
}
```

- [ ] **Step 7: Create the "new project" page**

`app/admin/(dashboard)/projects/new/page.tsx`:

```tsx
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">New Project</h1>
      <ProjectForm />
    </div>
  );
}
```

- [ ] **Step 8: Create the "edit project" page**

`app/admin/(dashboard)/projects/[id]/edit/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/ProjectForm";
import type { Project, ProjectGalleryItem, ProjectSection } from "@/lib/types";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single<Project>();
  const { data: gallery } = await supabase
    .from("project_gallery_items")
    .select("*")
    .eq("project_id", id)
    .order("position")
    .returns<ProjectGalleryItem[]>();
  const { data: sections } = await supabase
    .from("project_sections")
    .select("*")
    .eq("project_id", id)
    .order("position")
    .returns<ProjectSection[]>();

  if (!project) return <p className="text-brown-600">Project not found.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">Edit Project</h1>
      <ProjectForm
        initialData={{
          id: project.id,
          title: project.title,
          description: project.description ?? "",
          coverPhotoUrl: project.cover_photo_url ?? "",
          galleryUrls: (gallery ?? []).map((g) => g.media_url),
          sections: (sections ?? []).map((s) => ({ id: s.id, title: s.title, description: s.description ?? "" })),
        }}
      />
    </div>
  );
}
```

- [ ] **Step 9: Verify end-to-end manually**

Log into `/admin`, go to Projects → New Project, fill in a title/description, upload a cover photo and a gallery photo, add two sections, save. Confirm it redirects to `/admin/projects` and the new project appears; confirm the Storage bucket in Supabase shows the uploaded files; confirm editing the project loads the saved cover, gallery, and sections back into the form.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Add admin project create/edit form with gallery upload and custom sections"
```

---

### Task 14: Public Projects pages

**Files:**
- Create: `components/ProjectCard.tsx`
- Create: `components/Gallery.tsx`
- Create: `app/projects/page.tsx`
- Create: `app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `createClient()` (server, Task 4), `Project`, `ProjectGalleryItem`, `ProjectSection` types (Task 5).
- Produces: `/projects` and `/projects/[slug]` fully working public pages.

- [ ] **Step 1: Build the ProjectCard component**

`components/ProjectCard.tsx`:

```tsx
import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-beige bg-beige/40 transition hover:shadow-md"
    >
      {project.cover_photo_url && (
        <img src={project.cover_photo_url} alt="" className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-brown-900">{project.title}</h2>
        {project.description && (
          <p className="mt-1 line-clamp-2 text-sm text-brown-600">{project.description}</p>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Build the Gallery component**

`components/Gallery.tsx`:

```tsx
import type { ProjectGalleryItem } from "@/lib/types";

export function Gallery({ items }: { items: ProjectGalleryItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) =>
        item.media_type === "video" ? (
          <video key={item.id} src={item.media_url} controls className="aspect-square w-full rounded-lg object-cover" />
        ) : (
          <img key={item.id} src={item.media_url} alt="" className="aspect-square w-full rounded-lg object-cover" />
        )
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build the Projects grid page**

`app/projects/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/lib/types";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("position")
    .returns<Project[]>();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">Projects</h1>
      {(!projects || projects.length === 0) ? (
        <p className="mt-6 text-brown-600">No projects yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Build the Project detail page**

`app/projects/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Gallery } from "@/components/Gallery";
import type { Project, ProjectGalleryItem, ProjectSection } from "@/lib/types";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single<Project>();

  if (!project) notFound();

  const { data: gallery } = await supabase
    .from("project_gallery_items")
    .select("*")
    .eq("project_id", project.id)
    .order("position")
    .returns<ProjectGalleryItem[]>();

  const { data: sections } = await supabase
    .from("project_sections")
    .select("*")
    .eq("project_id", project.id)
    .order("position")
    .returns<ProjectSection[]>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">{project.title}</h1>
      {project.description && <p className="mt-4 text-brown-600">{project.description}</p>}

      <div className="mt-8">
        <Gallery items={gallery ?? []} />
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {(sections ?? []).map((section) => (
          <div key={section.id}>
            <h2 className="text-xl font-semibold text-brown-900">{section.title}</h2>
            {section.description && <p className="mt-2 text-brown-600">{section.description}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify manually**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/projects
kill %1
```

Expected: `200`. Open the browser, confirm `/projects` shows the project created in Task 13, click into it, and confirm the gallery and sections render correctly.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add public projects grid and project detail pages"
```

---

### Task 15: Deploy to Vercel

**Files:** none (infrastructure task)

**Interfaces:** none.

- [ ] **Step 1: Verify the production build passes locally**

```bash
npm run build
```

Expected: build succeeds with no type errors.

- [ ] **Step 2: Push to GitHub**

```bash
git push -u origin main
```

- [ ] **Step 3: Connect the repo to Vercel (manual — requires Austin's login)**

Go to https://vercel.com/new, sign in, import `austinsalt99-hash/Austin-Salt-website`. Accept the default Next.js build settings.

- [ ] **Step 4: Add environment variables in Vercel**

In the Vercel project's Settings → Environment Variables, add (matching `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `CONTACT_EMAIL`. Apply to Production, Preview, and Development.

- [ ] **Step 5: Deploy and verify**

Trigger the deploy (Vercel does this automatically after the env vars are saved, or click "Redeploy"). Once live, visit the production URL and confirm: the homepage hero and tiles render, `/projects` shows real data, `/contact` sends a message successfully, and `/admin` requires login.

- [ ] **Step 6: Confirm auto-deploy on push**

Make a trivial change (e.g. a comment), commit, and push to `main`. Confirm Vercel starts a new deployment automatically.

```bash
git add -A
git commit -m "Verify Vercel auto-deploy"
git push
```

---

## After This Plan

Achievements, Experience, and About currently show "under construction" placeholders. A follow-up plan will add their admin CRUD (reusing `SortableList`, `ImageUploader`, and `lib/data/collections.ts` from this plan) and public pages, following the same pattern established by Projects in Tasks 9–14.
