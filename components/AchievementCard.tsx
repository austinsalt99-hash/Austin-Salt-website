import { Gallery } from "@/components/Gallery";
import type { Achievement, AchievementGalleryItem, AchievementSection } from "@/lib/types";

export function AchievementCard({
  achievement,
  galleryItems = [],
  sections = [],
  adminControls,
}: {
  achievement: Achievement;
  galleryItems?: AchievementGalleryItem[];
  sections?: AchievementSection[];
  adminControls?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-beige bg-beige/40">
      {achievement.image_url && (
        <img src={achievement.image_url} alt="" className="h-48 w-full object-cover" />
      )}
      <div className="flex flex-col p-4">
        <h2 className="text-lg font-semibold text-brown-900">{achievement.title}</h2>
        {achievement.description && (
          <p className="mt-1 text-sm text-brown-600">{achievement.description}</p>
        )}
        {sections.map((section) => (
          <div key={section.id} className="mt-3">
            <h3 className="text-sm font-semibold text-brown-900">{section.title}</h3>
            {section.description && <p className="mt-1 text-sm text-brown-600">{section.description}</p>}
          </div>
        ))}
        {galleryItems.length > 0 && (
          <Gallery
            items={galleryItems}
            trigger={(open) => (
              <button
                type="button"
                onClick={open}
                className="mt-3 self-start rounded-full border border-brown-600/40 px-4 py-1.5 text-sm font-medium text-brown-600 transition-colors hover:bg-beige"
              >
                View Gallery ({galleryItems.length})
              </button>
            )}
          />
        )}
      </div>
      {adminControls && <div className="border-t border-beige px-4 py-3">{adminControls}</div>}
    </div>
  );
}
