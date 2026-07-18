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
