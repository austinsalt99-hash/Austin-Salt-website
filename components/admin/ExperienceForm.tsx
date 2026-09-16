"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRecord, updateRecord, listOrdered } from "@/lib/data/collections";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { SortableList } from "@/components/admin/SortableList";
import type { ExperienceEntry } from "@/lib/types";

export type ExperienceGalleryItemDraft = { id: string; url: string };

export type ExperienceFormInitialData = {
  id: string;
  role: string;
  organization: string;
  dateRange: string;
  description: string;
  galleryItems: ExperienceGalleryItemDraft[];
};

export function ExperienceForm({ initialData }: { initialData?: ExperienceFormInitialData }) {
  const router = useRouter();
  const [role, setRole] = useState(initialData?.role ?? "");
  const [organization, setOrganization] = useState(initialData?.organization ?? "");
  const [dateRange, setDateRange] = useState(initialData?.dateRange ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [galleryItems, setGalleryItems] = useState<ExperienceGalleryItemDraft[]>(initialData?.galleryItems ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleGalleryReorder(orderedIds: string[]) {
    setGalleryItems((prev) => orderedIds.map((id) => prev.find((item) => item.id === id)!));
  }

  function handleGalleryRemove(id: string) {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    try {
      let experienceId = initialData?.id;

      if (experienceId) {
        await updateRecord<ExperienceEntry>("experience", experienceId, {
          role,
          organization,
          date_range: dateRange,
          description,
        });

        const { error: deleteGalleryError } = await supabase
          .from("experience_gallery_items")
          .delete()
          .eq("experience_id", experienceId);
        if (deleteGalleryError) throw deleteGalleryError;
      } else {
        const existing = await listOrdered<ExperienceEntry>("experience");
        const created = await createRecord<Record<string, unknown>>("experience", {
          role,
          organization,
          date_range: dateRange,
          description,
          position: existing.length,
        });
        experienceId = created.id as string;
      }

      if (galleryItems.length > 0) {
        const { error: insertGalleryError } = await supabase.from("experience_gallery_items").insert(
          galleryItems.map((item, i) => ({
            experience_id: experienceId,
            media_url: item.url,
            media_type: item.url.match(/\.(mp4|mov|webm)$/i) ? "video" : "image",
            position: i,
          }))
        );
        if (insertGalleryError) throw insertGalleryError;
      }

      router.push("/admin/experience");
      router.refresh();
    } catch (err) {
      console.error("Failed to save experience entry:", err);
      setError(
        "Something went wrong while saving this entry. The gallery photos may not have been saved correctly. Please try again."
      );
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
        <p className="mb-2 text-sm font-medium text-brown-600">Gallery</p>
        {galleryItems.length > 0 && (
          <SortableList
            items={galleryItems}
            onReorder={handleGalleryReorder}
            className="mb-2 flex flex-wrap gap-3"
            renderItem={(item, dragHandle) => (
              <div className="relative">
                <button
                  type="button"
                  {...dragHandle.attributes}
                  {...dragHandle.listeners}
                  aria-label="Drag to reorder"
                  className="absolute -left-2 -top-2 flex h-6 w-6 cursor-grab items-center justify-center rounded-full bg-brown-900 text-xs text-cream shadow"
                >
                  ⠿
                </button>
                <MediaPreview
                  src={item.url}
                  onRemove={() => handleGalleryRemove(item.id)}
                  imgClassName="h-20 w-20 rounded-lg object-cover"
                />
              </div>
            )}
          />
        )}
        <ImageUploader
          path="experience"
          label="Drop photos here"
          onUploaded={(url) => setGalleryItems((prev) => [...prev, { id: crypto.randomUUID(), url }])}
        />
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
