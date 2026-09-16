"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrdered, deleteRecord, reorder } from "@/lib/data/collections";
import { createClient } from "@/lib/supabase/client";
import { SortableList } from "@/components/admin/SortableList";
import { EntryControls } from "@/components/admin/EntryControls";
import { ExperienceEntryCard } from "@/components/ExperienceEntryCard";
import type { ExperienceEntry, ExperienceGalleryItem } from "@/lib/types";

export default function AdminExperiencePage() {
  const [entries, setEntries] = useState<ExperienceEntry[]>([]);
  const [galleryByEntry, setGalleryByEntry] = useState<Map<string, ExperienceGalleryItem[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refetch().then(() => setLoading(false));
  }, []);

  async function refetch() {
    const data = await listOrdered<ExperienceEntry>("experience");
    setEntries(data);

    const supabase = createClient();
    const { data: galleryItems } = data.length
      ? await supabase
          .from("experience_gallery_items")
          .select("*")
          .in(
            "experience_id",
            data.map((entry) => entry.id)
          )
          .order("position")
          .returns<ExperienceGalleryItem[]>()
      : { data: [] as ExperienceGalleryItem[] };

    const grouped = new Map<string, ExperienceGalleryItem[]>();
    for (const item of galleryItems ?? []) {
      const list = grouped.get(item.experience_id) ?? [];
      list.push(item);
      grouped.set(item.experience_id, list);
    }
    setGalleryByEntry(grouped);
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
        <h1 className="text-2xl font-semibold text-brown-900">Experience &amp; Skills</h1>
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
              galleryItems={galleryByEntry.get(entry.id)}
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
