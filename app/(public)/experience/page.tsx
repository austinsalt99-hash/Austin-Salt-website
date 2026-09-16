import { createClient } from "@/lib/supabase/server";
import { ExperienceEntryCard } from "@/components/ExperienceEntryCard";
import type { ExperienceEntry, ExperienceGalleryItem } from "@/lib/types";

export default async function ExperiencePage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("experience")
    .select("*")
    .order("position")
    .returns<ExperienceEntry[]>();

  const entryIds = entries?.map((entry) => entry.id) ?? [];
  const { data: galleryItems } = entryIds.length
    ? await supabase
        .from("experience_gallery_items")
        .select("*")
        .in("experience_id", entryIds)
        .order("position")
        .returns<ExperienceGalleryItem[]>()
    : { data: [] as ExperienceGalleryItem[] };

  const galleryByEntry = new Map<string, ExperienceGalleryItem[]>();
  for (const item of galleryItems ?? []) {
    const list = galleryByEntry.get(item.experience_id) ?? [];
    list.push(item);
    galleryByEntry.set(item.experience_id, list);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">Experience &amp; Skills</h1>
      {(!entries || entries.length === 0) ? (
        <p className="mt-6 text-brown-600">No experience listed yet — check back soon.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {entries.map((entry) => (
            <ExperienceEntryCard key={entry.id} entry={entry} galleryItems={galleryByEntry.get(entry.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
