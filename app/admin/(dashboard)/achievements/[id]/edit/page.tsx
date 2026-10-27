import { createClient } from "@/lib/supabase/server";
import { AchievementForm } from "@/components/admin/AchievementForm";
import type { Achievement, AchievementGalleryItem, AchievementSection } from "@/lib/types";

export default async function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: achievement } = await supabase.from("achievements").select("*").eq("id", id).single<Achievement>();
  const { data: galleryItems } = await supabase
    .from("achievement_gallery_items")
    .select("*")
    .eq("achievement_id", id)
    .order("position")
    .returns<AchievementGalleryItem[]>();
  const { data: sections } = await supabase
    .from("achievement_sections")
    .select("*")
    .eq("achievement_id", id)
    .order("position")
    .returns<AchievementSection[]>();

  if (!achievement) return <p className="text-brown-600">Achievement not found.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">Edit Achievement</h1>
      <AchievementForm
        initialData={{
          id: achievement.id,
          title: achievement.title,
          description: achievement.description ?? "",
          imageUrl: achievement.image_url ?? "",
          galleryItems: (galleryItems ?? []).map((item) => ({ id: item.id, url: item.media_url })),
          sections: (sections ?? []).map((s) => ({ id: s.id, title: s.title, description: s.description ?? "" })),
        }}
      />
    </div>
  );
}
