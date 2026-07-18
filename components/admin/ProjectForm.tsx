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
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    try {
      let projectId = initialData?.id;

      if (projectId) {
        await updateRecord<Project>("projects", projectId, {
          title,
          description,
          cover_photo_url: coverPhotoUrl,
        });

        const { error: deleteGalleryError } = await supabase
          .from("project_gallery_items")
          .delete()
          .eq("project_id", projectId);
        if (deleteGalleryError) throw deleteGalleryError;

        const { error: deleteSectionsError } = await supabase
          .from("project_sections")
          .delete()
          .eq("project_id", projectId);
        if (deleteSectionsError) throw deleteSectionsError;
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
        const { error: insertGalleryError } = await supabase.from("project_gallery_items").insert(
          galleryUrls.map((url, i) => ({
            project_id: projectId,
            media_url: url,
            media_type: url.match(/\.(mp4|mov|webm)$/i) ? "video" : "image",
            position: i,
          }))
        );
        if (insertGalleryError) throw insertGalleryError;
      }

      if (sections.length > 0) {
        const { error: insertSectionsError } = await supabase.from("project_sections").insert(
          sections.map((s, i) => ({
            project_id: projectId,
            title: s.title,
            description: s.description,
            position: i,
          }))
        );
        if (insertSectionsError) throw insertSectionsError;
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      console.error("Failed to save project:", err);
      setError(
        "Something went wrong while saving this project. Some data (gallery or sections) may not have been saved correctly. Please try again or contact the site owner."
      );
    } finally {
      setSaving(false);
    }
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

      {error && <p className="text-sm text-error">{error}</p>}

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
