import type { ExperienceEntry } from "@/lib/types";

export function ExperienceEntryCard({
  entry,
  adminControls,
}: {
  entry: ExperienceEntry;
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
      {entry.image_url && (
        <img src={entry.image_url} alt="" className="mt-2 h-40 w-full max-w-sm rounded-lg object-cover" />
      )}
      {entry.description && <p className="text-sm text-brown-600">{entry.description}</p>}
      {adminControls && <div className="mt-2 border-t border-beige pt-2">{adminControls}</div>}
    </div>
  );
}
