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
