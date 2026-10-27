import { createClient } from "@/lib/supabase/server";
import { AchievementCard } from "@/components/AchievementCard";
import type { Achievement, AchievementGalleryItem, AchievementSection } from "@/lib/types";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("position")
    .returns<Achievement[]>();

  const achievementIds = achievements?.map((achievement) => achievement.id) ?? [];
  const { data: galleryItems } = achievementIds.length
    ? await supabase
        .from("achievement_gallery_items")
        .select("*")
        .in("achievement_id", achievementIds)
        .order("position")
        .returns<AchievementGalleryItem[]>()
    : { data: [] as AchievementGalleryItem[] };

  const galleryByAchievement = new Map<string, AchievementGalleryItem[]>();
  for (const item of galleryItems ?? []) {
    const list = galleryByAchievement.get(item.achievement_id) ?? [];
    list.push(item);
    galleryByAchievement.set(item.achievement_id, list);
  }

  const { data: sections } = achievementIds.length
    ? await supabase
        .from("achievement_sections")
        .select("*")
        .in("achievement_id", achievementIds)
        .order("position")
        .returns<AchievementSection[]>()
    : { data: [] as AchievementSection[] };

  const sectionsByAchievement = new Map<string, AchievementSection[]>();
  for (const section of sections ?? []) {
    const list = sectionsByAchievement.get(section.achievement_id) ?? [];
    list.push(section);
    sectionsByAchievement.set(section.achievement_id, list);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">Achievements</h1>
      {(!achievements || achievements.length === 0) ? (
        <p className="mt-6 text-brown-600">No achievements yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              galleryItems={galleryByAchievement.get(achievement.id)}
              sections={sectionsByAchievement.get(achievement.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
