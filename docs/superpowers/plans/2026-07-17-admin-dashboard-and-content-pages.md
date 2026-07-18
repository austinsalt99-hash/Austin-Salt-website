# Admin Dashboard & Content Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build full admin CRUD for Achievements, Experience, and About (currently placeholder-only), restructure `/admin` to mirror the public site's 4-tile layout with real-page-styled edit screens, and add per-tile cover photos on the homepage.

**Architecture:** Each content type (Projects, Achievements, Experience) gets a shared presentational card component used by both its public page and its admin list page — admin passes an `adminControls` slot (Edit/Delete/drag-handle) the public page never passes, so there is no code path where a visitor could see edit affordances. `SortableList` is generalized to be headless (hands drag-handle props to the caller instead of rendering its own row chrome) so it can back both list and grid layouts. About is a singleton with an edit-in-place flow instead of add/delete. A new `homepage_settings` singleton table holds the 4 homepage tile cover photos, editable inline from the admin dashboard home screen.

**Tech Stack:** Next.js App Router (TypeScript), Supabase (Postgres + Storage, via existing `lib/supabase/{client,server}.ts` and `lib/data/collections.ts`), `@dnd-kit` (already in use via `SortableList`), Tailwind v4 design tokens from `app/globals.css`.

## Global Constraints

- Palette: cream/beige/brown-900/brown-600/stone-500/accent/error tokens only — never Tailwind default colors (e.g. `red-600`). (Design spec §5)
- Typography: Inter only, no second typeface. (Design spec §5)
- Content publishes immediately on save — no draft/unpublished states. (Design spec §3, §9)
- Single admin user, no public sign-up; all admin routes are gated by `proxy.ts`. (Design spec §4)
- Admin edit/delete/add controls must never be reachable from public pages — enforced structurally via an optional `adminControls` prop that public pages never pass, not just by auth checks. (This plan's spec, §4)
- Reuse the existing generic data layer (`lib/data/collections.ts`: `listOrdered`, `createRecord`, `updateRecord`, `deleteRecord`, `reorder`) for all new admin CRUD — don't write bespoke Supabase calls for Achievements/Experience/About. (Follows existing Projects pattern)
- No automated migration runner exists in this project — schema changes are written as SQL files under `supabase/migrations/` and applied manually via the Supabase dashboard SQL Editor (same as `0001_init.sql`).

---

### Task 1: Homepage settings schema + type

**Files:**
- Create: `supabase/migrations/0002_homepage_settings.sql`
- Modify: `lib/types.ts`

**Interfaces:**
- Produces: table `homepage_settings` (columns: `id`, `is_singleton`, `projects_cover_url`, `achievements_cover_url`, `about_cover_url`, `experience_cover_url`, `updated_at`); TypeScript type `HomepageSettings` in `lib/types.ts`, consumed by Task 8 and Task 9.

- [ ] **Step 1: Write the migration**

`supabase/migrations/0002_homepage_settings.sql`:

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

- [ ] **Step 2: Apply the migration (manual, one-time)**

In the Supabase dashboard, open SQL Editor, paste the contents of `supabase/migrations/0002_homepage_settings.sql`, and run it. Confirm `homepage_settings` appears under Table Editor with exactly one row.

- [ ] **Step 3: Add the TypeScript type**

Add to `lib/types.ts`:

```ts
export type HomepageSettings = {
  id: string;
  projects_cover_url: string | null;
  achievements_cover_url: string | null;
  about_cover_url: string | null;
  experience_cover_url: string | null;
  updated_at: string;
};
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add homepage_settings table and type for tile cover photos"
```

---

### Task 2: Generalize SortableList + restyle Projects admin as a card grid

**Files:**
- Modify: `components/admin/SortableList.tsx`
- Create: `components/admin/EntryControls.tsx`
- Modify: `components/ProjectCard.tsx`
- Modify: `app/(public)/projects/page.tsx`
- Modify: `app/admin/(dashboard)/projects/page.tsx`

**Interfaces:**
- Consumes: `listOrdered`, `deleteRecord`, `reorder` (existing, `lib/data/collections.ts`), `Project` type (existing, `lib/types.ts`).
- Produces: `SortableList<T>` now takes `renderItem: (item: T, dragHandle: DragHandle) => ReactNode` and an optional `className` (default `"flex flex-col gap-3"`), exporting a `DragHandle` type — consumed by Task 3, 5. `EntryControls` component (`{ editHref, onDelete, dragHandle }`) — consumed by Task 3, 5. `ProjectCard` now takes optional `linkHref?: string` and `adminControls?: ReactNode` instead of always linking.

- [ ] **Step 1: Make SortableList headless**

Replace `components/admin/SortableList.tsx` in full:

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
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type SortableListItem = { id: string };

export type DragHandle = {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
};

export function SortableList<T extends SortableListItem>({
  items,
  onReorder,
  renderItem,
  className = "flex flex-col gap-3",
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, dragHandle: DragHandle) => React.ReactNode;
  className?: string;
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
        <ul className={className}>
          {ordered.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {(dragHandle) => renderItem(item, dragHandle)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (dragHandle: DragHandle) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className="list-none">
      {children({ attributes, listeners })}
    </li>
  );
}
```

- [ ] **Step 2: Add the EntryControls component**

`components/admin/EntryControls.tsx`:

```tsx
"use client";

import Link from "next/link";
import type { DragHandle } from "@/components/admin/SortableList";

export function EntryControls({
  editHref,
  onDelete,
  dragHandle,
}: {
  editHref: string;
  onDelete: () => void;
  dragHandle: DragHandle;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <button
        type="button"
        {...dragHandle.attributes}
        {...dragHandle.listeners}
        className="cursor-grab text-stone-500"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      <div className="flex gap-3">
        <Link href={editHref} className="text-accent underline">
          Edit
        </Link>
        <button type="button" onClick={onDelete} className="text-error underline">
          Delete
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Extend ProjectCard with linkHref + adminControls**

Replace `components/ProjectCard.tsx` in full:

```tsx
import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({
  project,
  linkHref,
  adminControls,
}: {
  project: Project;
  linkHref?: string;
  adminControls?: React.ReactNode;
}) {
  const content = (
    <>
      {project.cover_photo_url && (
        <img src={project.cover_photo_url} alt="" className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-brown-900">{project.title}</h2>
        {project.description && (
          <p className="mt-1 line-clamp-2 text-sm text-brown-600">{project.description}</p>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-beige bg-beige/40 transition hover:shadow-md">
      {linkHref ? (
        <Link href={linkHref} className="flex flex-col">
          {content}
        </Link>
      ) : (
        <div className="flex flex-col">{content}</div>
      )}
      {adminControls && <div className="border-t border-beige px-4 py-3">{adminControls}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Update the public Projects page to pass linkHref**

In `app/(public)/projects/page.tsx`, change:

```tsx
<ProjectCard key={project.id} project={project} />
```

to:

```tsx
<ProjectCard key={project.id} project={project} linkHref={`/projects/${project.slug}`} />
```

- [ ] **Step 5: Restyle the admin Projects list as a card grid**

Replace `app/admin/(dashboard)/projects/page.tsx` in full:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrdered, deleteRecord, reorder } from "@/lib/data/collections";
import { SortableList } from "@/components/admin/SortableList";
import { EntryControls } from "@/components/admin/EntryControls";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/lib/types";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listOrdered<Project>("projects").then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  async function refetchProjects() {
    const data = await listOrdered<Project>("projects");
    setProjects(data);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This can't be undone.")) return;
    setError(null);
    try {
      await deleteRecord("projects", id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError("Failed to delete this project. Please try again.");
      await refetchProjects();
    }
  }

  async function handleReorder(orderedIds: string[]) {
    setError(null);
    try {
      await reorder("projects", orderedIds);
    } catch (err) {
      console.error("Failed to reorder projects:", err);
      setError("Failed to save the new project order. Please try again.");
      await refetchProjects();
    }
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

      {error && <p className="text-sm text-error">{error}</p>}

      {projects.length === 0 ? (
        <p className="text-brown-600">No projects yet.</p>
      ) : (
        <SortableList
          items={projects}
          onReorder={handleReorder}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          renderItem={(project, dragHandle) => (
            <ProjectCard
              project={project}
              adminControls={
                <EntryControls
                  editHref={`/admin/projects/${project.id}/edit`}
                  onDelete={() => handleDelete(project.id)}
                  dragHandle={dragHandle}
                />
              }
            />
          )}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 6: Verify manually**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/projects
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/projects
kill %1
```

Expected: `200` for `/projects`, `307` for `/admin/projects` (redirect to login when unauthenticated). Log in via the browser and confirm `/admin/projects` now shows existing projects as a card grid (same visual style as `/projects`), with a working drag handle, Edit link, and Delete button on each card. Confirm `/projects` still looks and behaves exactly as before (cards still link to project detail pages).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Generalize SortableList and restyle admin Projects as a card grid"
```

---

### Task 3: Achievements — public page + card + admin list

**Files:**
- Create: `components/AchievementCard.tsx`
- Modify: `app/(public)/achievements/page.tsx`
- Create: `app/admin/(dashboard)/achievements/page.tsx`

**Interfaces:**
- Consumes: `Achievement` type (existing, `lib/types.ts`), `listOrdered`/`deleteRecord`/`reorder` (existing), `SortableList`/`DragHandle`/`EntryControls` (Task 2).
- Produces: `AchievementCard` component (`{ achievement, adminControls? }`) — consumed by Task 4's edit-preview and Task 3's own admin list. `/achievements` (public) and `/admin/achievements` (admin list, links to Task 4's `/admin/achievements/new` and `/admin/achievements/[id]/edit`).

- [ ] **Step 1: Build the AchievementCard component**

`components/AchievementCard.tsx`:

```tsx
import type { Achievement } from "@/lib/types";

export function AchievementCard({
  achievement,
  adminControls,
}: {
  achievement: Achievement;
  adminControls?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-beige bg-beige/40">
      {achievement.image_url && (
        <img src={achievement.image_url} alt="" className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-brown-900">{achievement.title}</h2>
        {achievement.description && (
          <p className="mt-1 text-sm text-brown-600">{achievement.description}</p>
        )}
      </div>
      {adminControls && <div className="border-t border-beige px-4 py-3">{adminControls}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Replace the public Achievements placeholder**

Replace `app/(public)/achievements/page.tsx` in full:

```tsx
import { createClient } from "@/lib/supabase/server";
import { AchievementCard } from "@/components/AchievementCard";
import type { Achievement } from "@/lib/types";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("position")
    .returns<Achievement[]>();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">Achievements</h1>
      {(!achievements || achievements.length === 0) ? (
        <p className="mt-6 text-brown-600">No achievements yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Build the admin Achievements list**

`app/admin/(dashboard)/achievements/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrdered, deleteRecord, reorder } from "@/lib/data/collections";
import { SortableList } from "@/components/admin/SortableList";
import { EntryControls } from "@/components/admin/EntryControls";
import { AchievementCard } from "@/components/AchievementCard";
import type { Achievement } from "@/lib/types";

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listOrdered<Achievement>("achievements").then((data) => {
      setAchievements(data);
      setLoading(false);
    });
  }, []);

  async function refetch() {
    const data = await listOrdered<Achievement>("achievements");
    setAchievements(data);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this achievement? This can't be undone.")) return;
    setError(null);
    try {
      await deleteRecord("achievements", id);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete achievement:", err);
      setError("Failed to delete this achievement. Please try again.");
      await refetch();
    }
  }

  async function handleReorder(orderedIds: string[]) {
    setError(null);
    try {
      await reorder("achievements", orderedIds);
    } catch (err) {
      console.error("Failed to reorder achievements:", err);
      setError("Failed to save the new order. Please try again.");
      await refetch();
    }
  }

  if (loading) return <p className="text-brown-600">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Achievements</h1>
        <Link href="/admin/achievements/new" className="rounded-full bg-accent px-4 py-2 text-sm text-cream">
          New Achievement
        </Link>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {achievements.length === 0 ? (
        <p className="text-brown-600">No achievements yet.</p>
      ) : (
        <SortableList
          items={achievements}
          onReorder={handleReorder}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          renderItem={(achievement, dragHandle) => (
            <AchievementCard
              achievement={achievement}
              adminControls={
                <EntryControls
                  editHref={`/admin/achievements/${achievement.id}/edit`}
                  onDelete={() => handleDelete(achievement.id)}
                  dragHandle={dragHandle}
                />
              }
            />
          )}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify manually**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/achievements
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/achievements
kill %1
```

Expected: `200` for `/achievements` (shows "No achievements yet" empty state), `307` for `/admin/achievements` unauthenticated. Log in and confirm `/admin/achievements` shows the same empty state with a "New Achievement" button (404s until Task 4).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add public Achievements page, AchievementCard, and admin Achievements list"
```

---

### Task 4: Achievements — admin create/edit form

**Files:**
- Create: `components/admin/AchievementForm.tsx`
- Create: `app/admin/(dashboard)/achievements/new/page.tsx`
- Create: `app/admin/(dashboard)/achievements/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `createRecord`/`updateRecord`/`listOrdered` (existing), `ImageUploader` (existing, `components/admin/ImageUploader.tsx`), `Achievement` type (existing).
- Produces: `/admin/achievements/new` and `/admin/achievements/[id]/edit`, completing the links from Task 3's admin list.

- [ ] **Step 1: Build the AchievementForm component**

`components/admin/AchievementForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRecord, updateRecord, listOrdered } from "@/lib/data/collections";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Achievement } from "@/lib/types";

export type AchievementFormInitialData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

export function AchievementForm({ initialData }: { initialData?: AchievementFormInitialData }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (initialData?.id) {
        await updateRecord<Achievement>("achievements", initialData.id, {
          title,
          description,
          image_url: imageUrl,
        });
      } else {
        const existing = await listOrdered<Achievement>("achievements");
        await createRecord<Record<string, unknown>>("achievements", {
          title,
          description,
          image_url: imageUrl,
          position: existing.length,
        });
      }
      router.push("/admin/achievements");
      router.refresh();
    } catch (err) {
      console.error("Failed to save achievement:", err);
      setError("Something went wrong while saving this achievement. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <input
        placeholder="Achievement title"
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
        <p className="mb-2 text-sm font-medium text-brown-600">Image</p>
        {imageUrl && <img src={imageUrl} alt="" className="mb-2 h-32 w-auto rounded-lg object-cover" />}
        <ImageUploader path="achievements" label="Drop an image here" onUploaded={setImageUrl} />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving || !title}
        className="self-start rounded-full bg-accent px-6 py-2 font-medium text-cream disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Achievement"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Build the New Achievement page**

`app/admin/(dashboard)/achievements/new/page.tsx`:

```tsx
import { AchievementForm } from "@/components/admin/AchievementForm";

export default function NewAchievementPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">New Achievement</h1>
      <AchievementForm />
    </div>
  );
}
```

- [ ] **Step 3: Build the Edit Achievement page**

`app/admin/(dashboard)/achievements/[id]/edit/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { AchievementForm } from "@/components/admin/AchievementForm";
import type { Achievement } from "@/lib/types";

export default async function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: achievement } = await supabase.from("achievements").select("*").eq("id", id).single<Achievement>();

  if (!achievement) return <p className="text-brown-600">Achievement not found.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">Edit Achievement</h1>
      <AchievementForm
        initialData={{
          id: achievement.id,
          title: achievement.title,
          description: achievement.description ?? "",
          imageUrl: achievement.image_url ?? "",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify manually**

Log in to `/admin/achievements`, click "New Achievement", fill in a title/description/image, save, and confirm you land back on `/admin/achievements` with the new card visible (and it also now appears on the public `/achievements` page). Click "Edit" on it, change the title, save, and confirm the change persisted. Click "Delete" and confirm it's removed from both `/admin/achievements` and `/achievements`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add Achievement create/edit form"
```

---

### Task 5: Experience — public page + card + admin list

**Files:**
- Create: `components/ExperienceEntryCard.tsx`
- Modify: `app/(public)/experience/page.tsx`
- Create: `app/admin/(dashboard)/experience/page.tsx`

**Interfaces:**
- Consumes: `ExperienceEntry` type (existing, `lib/types.ts`), `listOrdered`/`deleteRecord`/`reorder` (existing), `SortableList`/`DragHandle`/`EntryControls` (Task 2).
- Produces: `ExperienceEntryCard` component (`{ entry, adminControls? }`) — consumed by Task 6. `/experience` (public) and `/admin/experience` (admin list, links to Task 6's `/admin/experience/new` and `/admin/experience/[id]/edit`).

- [ ] **Step 1: Build the ExperienceEntryCard component**

`components/ExperienceEntryCard.tsx`:

```tsx
import type { ExperienceEntry } from "@/lib/types";

export function ExperienceEntryCard({
  entry,
  adminControls,
}: {
  entry: ExperienceEntry;
  adminControls?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-l-2 border-beige py-2 pl-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-brown-900">{entry.role}</h2>
          <p className="text-sm text-brown-600">{entry.organization}</p>
        </div>
        {entry.date_range && <p className="text-sm text-stone-500">{entry.date_range}</p>}
      </div>
      {entry.image_url && (
        <img src={entry.image_url} alt="" className="mt-2 h-40 w-full max-w-sm rounded-lg object-cover" />
      )}
      {entry.description && <p className="text-sm text-brown-600">{entry.description}</p>}
      {adminControls && <div className="mt-2 border-t border-beige pt-2">{adminControls}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Replace the public Experience placeholder**

Replace `app/(public)/experience/page.tsx` in full:

```tsx
import { createClient } from "@/lib/supabase/server";
import { ExperienceEntryCard } from "@/components/ExperienceEntryCard";
import type { ExperienceEntry } from "@/lib/types";

export default async function ExperiencePage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("experience")
    .select("*")
    .order("position")
    .returns<ExperienceEntry[]>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">Experience</h1>
      {(!entries || entries.length === 0) ? (
        <p className="mt-6 text-brown-600">No experience listed yet — check back soon.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {entries.map((entry) => (
            <ExperienceEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Build the admin Experience list**

`app/admin/(dashboard)/experience/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrdered, deleteRecord, reorder } from "@/lib/data/collections";
import { SortableList } from "@/components/admin/SortableList";
import { EntryControls } from "@/components/admin/EntryControls";
import { ExperienceEntryCard } from "@/components/ExperienceEntryCard";
import type { ExperienceEntry } from "@/lib/types";

export default function AdminExperiencePage() {
  const [entries, setEntries] = useState<ExperienceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listOrdered<ExperienceEntry>("experience").then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  async function refetch() {
    const data = await listOrdered<ExperienceEntry>("experience");
    setEntries(data);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this experience entry? This can't be undone.")) return;
    setError(null);
    try {
      await deleteRecord("experience", id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Failed to delete experience entry:", err);
      setError("Failed to delete this entry. Please try again.");
      await refetch();
    }
  }

  async function handleReorder(orderedIds: string[]) {
    setError(null);
    try {
      await reorder("experience", orderedIds);
    } catch (err) {
      console.error("Failed to reorder experience:", err);
      setError("Failed to save the new order. Please try again.");
      await refetch();
    }
  }

  if (loading) return <p className="text-brown-600">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Experience</h1>
        <Link href="/admin/experience/new" className="rounded-full bg-accent px-4 py-2 text-sm text-cream">
          New Entry
        </Link>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {entries.length === 0 ? (
        <p className="text-brown-600">No experience listed yet.</p>
      ) : (
        <SortableList
          items={entries}
          onReorder={handleReorder}
          className="flex flex-col gap-6"
          renderItem={(entry, dragHandle) => (
            <ExperienceEntryCard
              entry={entry}
              adminControls={
                <EntryControls
                  editHref={`/admin/experience/${entry.id}/edit`}
                  onDelete={() => handleDelete(entry.id)}
                  dragHandle={dragHandle}
                />
              }
            />
          )}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify manually**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/experience
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/experience
kill %1
```

Expected: `200` for `/experience` (empty state), `307` for `/admin/experience` unauthenticated. Log in and confirm `/admin/experience` shows the empty state with a "New Entry" button (404s until Task 6).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add public Experience page, ExperienceEntryCard, and admin Experience list"
```

---

### Task 6: Experience — admin create/edit form

**Files:**
- Create: `components/admin/ExperienceForm.tsx`
- Create: `app/admin/(dashboard)/experience/new/page.tsx`
- Create: `app/admin/(dashboard)/experience/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `createRecord`/`updateRecord`/`listOrdered` (existing), `ImageUploader` (existing), `ExperienceEntry` type (existing).
- Produces: `/admin/experience/new` and `/admin/experience/[id]/edit`, completing the links from Task 5's admin list.

- [ ] **Step 1: Build the ExperienceForm component**

`components/admin/ExperienceForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRecord, updateRecord, listOrdered } from "@/lib/data/collections";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { ExperienceEntry } from "@/lib/types";

export type ExperienceFormInitialData = {
  id: string;
  role: string;
  organization: string;
  dateRange: string;
  description: string;
  imageUrl: string;
};

export function ExperienceForm({ initialData }: { initialData?: ExperienceFormInitialData }) {
  const router = useRouter();
  const [role, setRole] = useState(initialData?.role ?? "");
  const [organization, setOrganization] = useState(initialData?.organization ?? "");
  const [dateRange, setDateRange] = useState(initialData?.dateRange ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (initialData?.id) {
        await updateRecord<ExperienceEntry>("experience", initialData.id, {
          role,
          organization,
          date_range: dateRange,
          description,
          image_url: imageUrl,
        });
      } else {
        const existing = await listOrdered<ExperienceEntry>("experience");
        await createRecord<Record<string, unknown>>("experience", {
          role,
          organization,
          date_range: dateRange,
          description,
          image_url: imageUrl,
          position: existing.length,
        });
      }
      router.push("/admin/experience");
      router.refresh();
    } catch (err) {
      console.error("Failed to save experience entry:", err);
      setError("Something went wrong while saving this entry. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <input
        placeholder="Role / title"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="rounded-lg border border-beige bg-cream px-4 py-2 text-lg"
      />
      <input
        placeholder="Organization"
        value={organization}
        onChange={(e) => setOrganization(e.target.value)}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />
      <input
        placeholder="Date range (e.g. Jun 2024 – Aug 2024)"
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />
      <textarea
        placeholder="Description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />
      <div>
        <p className="mb-2 text-sm font-medium text-brown-600">Image</p>
        {imageUrl && <img src={imageUrl} alt="" className="mb-2 h-32 w-auto rounded-lg object-cover" />}
        <ImageUploader path="experience" label="Drop an image here" onUploaded={setImageUrl} />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving || !role || !organization}
        className="self-start rounded-full bg-accent px-6 py-2 font-medium text-cream disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Experience"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Build the New Experience page**

`app/admin/(dashboard)/experience/new/page.tsx`:

```tsx
import { ExperienceForm } from "@/components/admin/ExperienceForm";

export default function NewExperiencePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">New Experience Entry</h1>
      <ExperienceForm />
    </div>
  );
}
```

- [ ] **Step 3: Build the Edit Experience page**

`app/admin/(dashboard)/experience/[id]/edit/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import type { ExperienceEntry } from "@/lib/types";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: entry } = await supabase.from("experience").select("*").eq("id", id).single<ExperienceEntry>();

  if (!entry) return <p className="text-brown-600">Experience entry not found.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">Edit Experience Entry</h1>
      <ExperienceForm
        initialData={{
          id: entry.id,
          role: entry.role,
          organization: entry.organization,
          dateRange: entry.date_range ?? "",
          description: entry.description ?? "",
          imageUrl: entry.image_url ?? "",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify manually**

Log in to `/admin/experience`, click "New Entry", fill in role/organization/date range/description/image, save, confirm you land back on `/admin/experience` with the new entry visible (and it also appears on `/experience`). Edit it, change the role, save, confirm the change persisted. Delete it and confirm it's gone from both pages.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add Experience create/edit form"
```

---

### Task 7: About — public view + admin view/edit

**Files:**
- Create: `components/AboutView.tsx`
- Modify: `app/(public)/about/page.tsx`
- Create: `app/admin/(dashboard)/about/page.tsx`
- Create: `components/admin/AboutForm.tsx`
- Create: `app/admin/(dashboard)/about/edit/page.tsx`

**Interfaces:**
- Consumes: `About` type (existing, `lib/types.ts`), `updateRecord` (existing), `ImageUploader` (existing).
- Produces: `AboutView` component (`{ about, editHref? }`), `/about` (public), `/admin/about` (admin view), `/admin/about/edit` (admin edit form).

- [ ] **Step 1: Build the AboutView component**

`components/AboutView.tsx`:

```tsx
import Link from "next/link";
import type { About } from "@/lib/types";

export function AboutView({ about, editHref }: { about: About; editHref?: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
      {about.photo_url && (
        <img src={about.photo_url} alt="" className="h-40 w-40 rounded-full object-cover" />
      )}
      {about.bio && <p className="text-brown-600">{about.bio}</p>}
      {editHref && (
        <Link href={editHref} className="rounded-full bg-accent px-5 py-2 text-sm text-cream">
          Edit
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace the public About placeholder**

Replace `app/(public)/about/page.tsx` in full:

```tsx
import { createClient } from "@/lib/supabase/server";
import { AboutView } from "@/components/AboutView";
import type { About } from "@/lib/types";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: about } = await supabase.from("about").select("*").single<About>();

  return (
    <main className="px-6 py-24">
      {about ? (
        <AboutView about={about} />
      ) : (
        <p className="text-center text-brown-600">This section is under construction — check back soon.</p>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Build the admin About view**

`app/admin/(dashboard)/about/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { AboutView } from "@/components/AboutView";
import type { About } from "@/lib/types";

export default async function AdminAboutPage() {
  const supabase = await createClient();
  const { data: about } = await supabase.from("about").select("*").single<About>();

  if (!about) return <p className="text-error">About row is missing — check the database.</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-brown-900">About</h1>
      <AboutView about={about} editHref="/admin/about/edit" />
    </div>
  );
}
```

- [ ] **Step 4: Build the AboutForm component**

`components/admin/AboutForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRecord } from "@/lib/data/collections";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { About } from "@/lib/types";

export function AboutForm({ about }: { about: About }) {
  const router = useRouter();
  const [bio, setBio] = useState(about.bio ?? "");
  const [photoUrl, setPhotoUrl] = useState(about.photo_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateRecord<About>("about", about.id, { bio, photo_url: photoUrl });
      router.push("/admin/about");
      router.refresh();
    } catch (err) {
      console.error("Failed to save about:", err);
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <textarea
        placeholder="Bio"
        rows={6}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />
      <div>
        <p className="mb-2 text-sm font-medium text-brown-600">Photo</p>
        {photoUrl && <img src={photoUrl} alt="" className="mb-2 h-32 w-32 rounded-full object-cover" />}
        <ImageUploader path="about" label="Drop a photo here" onUploaded={setPhotoUrl} />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving}
        className="self-start rounded-full bg-accent px-6 py-2 font-medium text-cream disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Build the admin About edit page**

`app/admin/(dashboard)/about/edit/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { AboutForm } from "@/components/admin/AboutForm";
import type { About } from "@/lib/types";

export default async function EditAboutPage() {
  const supabase = await createClient();
  const { data: about } = await supabase.from("about").select("*").single<About>();

  if (!about) return <p className="text-error">About row is missing — check the database.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">Edit About</h1>
      <AboutForm about={about} />
    </div>
  );
}
```

- [ ] **Step 6: Verify manually**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/about
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/about
kill %1
```

Expected: both `200`/`307` as before. Log in, visit `/admin/about`, confirm it shows the current bio ("Mechanical engineering student.") with an Edit button. Click Edit, change the bio and add a photo, save, confirm you land back on `/admin/about` with the update visible, and that `/about` reflects it too.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add About public view, admin view, and edit form"
```

---

### Task 8: Homepage tiles — cover photos (public)

**Files:**
- Modify: `components/SectionTile.tsx`
- Modify: `app/(public)/page.tsx`

**Interfaces:**
- Consumes: `HomepageSettings` type (Task 1), `createClient` (server, existing).
- Produces: `SectionTile` now accepts an optional `coverUrl?: string | null` prop, rendering it as the tile background when set. Consumed by Task 9's admin equivalent (`AdminSectionTile`, which follows the same visual treatment independently — see Task 9).

- [ ] **Step 1: Add coverUrl support to SectionTile**

Replace `components/SectionTile.tsx` in full:

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function SectionTile({
  href,
  label,
  coverUrl,
}: {
  href: string;
  label: string;
  coverUrl?: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group relative flex h-56 items-end overflow-hidden rounded-2xl p-6 transition-transform duration-300 ease-out hover:scale-[1.03]"
        style={
          coverUrl
            ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        <div
          className={
            coverUrl
              ? "absolute inset-0 bg-gradient-to-t from-brown-900/80 via-brown-900/20 to-transparent"
              : "absolute inset-0 bg-gradient-to-br from-brown-600 to-brown-900"
          }
        />
        <span className="relative text-2xl font-semibold text-cream">{label}</span>
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 2: Fetch homepage_settings on the public homepage**

Replace `app/(public)/page.tsx` in full:

```tsx
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/Hero";
import { SectionTile } from "@/components/SectionTile";
import type { HomepageSettings } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("homepage_settings")
    .select("*")
    .single<HomepageSettings>();

  return (
    <main>
      <Hero />
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-2">
        <SectionTile href="/projects" label="Projects" coverUrl={settings?.projects_cover_url} />
        <SectionTile href="/achievements" label="Achievements" coverUrl={settings?.achievements_cover_url} />
        <SectionTile href="/about" label="About" coverUrl={settings?.about_cover_url} />
        <SectionTile href="/experience" label="Experience" coverUrl={settings?.experience_cover_url} />
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Verify manually**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
kill %1
```

Expected: `200`. Open the browser and confirm the homepage still renders 4 tiles with the plain gradient background (no cover photos set yet — that's Task 9).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add homepage tile cover photo support"
```

---

### Task 9: Admin home — tile grid + inline cover controls

**Files:**
- Create: `components/admin/TileCoverControl.tsx`
- Create: `components/admin/AdminSectionTile.tsx`
- Modify: `app/admin/(dashboard)/page.tsx`
- Modify: `app/admin/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `HomepageSettings` type (Task 1), `updateRecord` (existing), `ImageUploader` (existing), `createClient` (server, existing).
- Produces: `/admin` showing the same 4 tiles as the public homepage, each with an inline "Change cover" control that writes to `homepage_settings`.

- [ ] **Step 1: Build the TileCoverControl component**

`components/admin/TileCoverControl.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { updateRecord } from "@/lib/data/collections";
import type { HomepageSettings } from "@/lib/types";

type CoverColumn =
  | "projects_cover_url"
  | "achievements_cover_url"
  | "about_cover_url"
  | "experience_cover_url";

export function TileCoverControl({
  settingsId,
  column,
}: {
  settingsId: string;
  column: CoverColumn;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUploaded(url: string) {
    setSaving(true);
    setError(null);
    try {
      await updateRecord<HomepageSettings>(
        "homepage_settings",
        settingsId,
        { [column]: url } as Partial<HomepageSettings>
      );
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to update tile cover:", err);
      setError("Failed to save cover photo. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={saving}
        className="rounded-full bg-cream/90 px-3 py-1 text-xs font-medium text-brown-900 shadow"
      >
        {saving ? "Saving…" : "Change cover"}
      </button>
    );
  }

  return (
    <div className="w-56 rounded-lg bg-cream p-2 shadow-lg">
      <ImageUploader path="homepage" label="Drop a cover photo" onUploaded={handleUploaded} />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Build the AdminSectionTile component**

`components/admin/AdminSectionTile.tsx`:

```tsx
import Link from "next/link";
import { TileCoverControl } from "@/components/admin/TileCoverControl";

type CoverColumn =
  | "projects_cover_url"
  | "achievements_cover_url"
  | "about_cover_url"
  | "experience_cover_url";

export function AdminSectionTile({
  href,
  label,
  coverUrl,
  settingsId,
  column,
}: {
  href: string;
  label: string;
  coverUrl: string | null;
  settingsId: string;
  column: CoverColumn;
}) {
  return (
    <div
      className="relative flex h-56 flex-col justify-between overflow-hidden rounded-2xl p-6"
      style={
        coverUrl
          ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      <div
        className={
          coverUrl
            ? "absolute inset-0 bg-gradient-to-t from-brown-900/80 via-brown-900/20 to-transparent"
            : "absolute inset-0 bg-gradient-to-br from-brown-600 to-brown-900"
        }
      />
      <div className="relative flex justify-end">
        <TileCoverControl settingsId={settingsId} column={column} />
      </div>
      <Link href={href} className="relative text-2xl font-semibold text-cream underline-offset-4 hover:underline">
        {label}
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Rebuild the admin home page**

Replace `app/admin/(dashboard)/page.tsx` in full:

```tsx
import { createClient } from "@/lib/supabase/server";
import { AdminSectionTile } from "@/components/admin/AdminSectionTile";
import type { HomepageSettings } from "@/lib/types";

export default async function AdminHome() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("homepage_settings")
    .select("*")
    .single<HomepageSettings>();

  if (!settings) {
    return <p className="text-error">Homepage settings row is missing — check the database.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-brown-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminSectionTile
          href="/admin/projects"
          label="Projects"
          coverUrl={settings.projects_cover_url}
          settingsId={settings.id}
          column="projects_cover_url"
        />
        <AdminSectionTile
          href="/admin/achievements"
          label="Achievements"
          coverUrl={settings.achievements_cover_url}
          settingsId={settings.id}
          column="achievements_cover_url"
        />
        <AdminSectionTile
          href="/admin/about"
          label="About"
          coverUrl={settings.about_cover_url}
          settingsId={settings.id}
          column="about_cover_url"
        />
        <AdminSectionTile
          href="/admin/experience"
          label="Experience"
          coverUrl={settings.experience_cover_url}
          settingsId={settings.id}
          column="experience_cover_url"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Simplify the admin nav (tiles are now primary navigation)**

Replace `app/admin/(dashboard)/layout.tsx` in full:

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
        <Link href="/admin" className="text-sm font-semibold text-brown-900">
          Dashboard
        </Link>
        <button onClick={handleLogout} className="text-sm text-brown-600 underline">
          Log out
        </button>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
```

- [ ] **Step 5: Verify manually**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin
kill %1
```

Expected: `307` unauthenticated. Log in and confirm `/admin` now shows the 4 tiles (Projects/Achievements/About/Experience), each clickable through to its management screen. On one tile, click "Change cover", drop an image, and confirm the tile updates to show it as a background — then check the public homepage (`/`) and confirm that same tile now shows the cover photo there too.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Rebuild admin home as a 4-tile dashboard with inline cover photo controls"
```

---

## After This Plan

- Hero photo/name remain static assets — not covered here.
- The 4 homepage tiles' relative order is still fixed; making it reorderable would be a small follow-up if ever wanted.
- No automated tests were added: this plan is entirely Supabase-backed CRUD UI with no new pure logic, consistent with this repo's existing convention of unit-testing only pure `lib/*.ts` functions (see `lib/slug.test.ts`, `lib/upload.test.ts`, `lib/data/collections.test.ts`) and verifying UI manually.
