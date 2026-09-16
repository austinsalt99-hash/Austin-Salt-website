import { Gallery } from "@/components/Gallery";
import type { ExperienceEntry, ExperienceGalleryItem } from "@/lib/types";

export function ExperienceEntryCard({
  entry,
  galleryItems = [],
  adminControls,
}: {
  entry: ExperienceEntry;
  galleryItems?: ExperienceGalleryItem[];
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
      {entry.description && <p className="text-sm text-brown-600">{entry.description}</p>}
      {galleryItems.length > 0 && (
        <Gallery
          items={galleryItems}
          trigger={(open) => (
            <button
              type="button"
              onClick={open}
              className="mt-1 self-start rounded-full border border-brown-600/40 px-4 py-1.5 text-sm font-medium text-brown-600 transition-colors hover:bg-beige"
            >
              View Gallery ({galleryItems.length})
            </button>
          )}
        />
      )}
      {adminControls && <div className="mt-2 border-t border-beige pt-2">{adminControls}</div>}
    </div>
  );
}
