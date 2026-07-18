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
