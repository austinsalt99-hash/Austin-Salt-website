import type { ProjectGalleryItem } from "@/lib/types";

export function Gallery({ items }: { items: ProjectGalleryItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) =>
        item.media_type === "video" ? (
          <video key={item.id} src={item.media_url} controls className="aspect-square w-full rounded-lg object-cover" />
        ) : (
          <img key={item.id} src={item.media_url} alt="" className="aspect-square w-full rounded-lg object-cover" />
        )
      )}
    </div>
  );
}
