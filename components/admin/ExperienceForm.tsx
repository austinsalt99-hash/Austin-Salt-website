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
