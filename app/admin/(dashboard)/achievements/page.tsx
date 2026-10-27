"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrdered, deleteRecord, reorder } from "@/lib/data/collections";
import { createClient } from "@/lib/supabase/client";
import { SortableList } from "@/components/admin/SortableList";
import { EntryControls } from "@/components/admin/EntryControls";
import { AchievementCard } from "@/components/AchievementCard";
import type { Achievement, AchievementGalleryItem, AchievementSection } from "@/lib/types";

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [galleryByAchievement, setGalleryByAchievement] = useState<Map<string, AchievementGalleryItem[]>>(new Map());
  const [sectionsByAchievement, setSectionsByAchievement] = useState<Map<string, AchievementSection[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refetch().then(() => setLoading(false));
  }, []);

  async function refetch() {
    const data = await listOrdered<Achievement>("achievements");
    setAchievements(data);

    const supabase = createClient();
    const achievementIds = data.map((achievement) => achievement.id);
    const { data: galleryItems } = data.length
      ? await supabase
          .from("achievement_gallery_items")
          .select("*")
          .in("achievement_id", achievementIds)
          .order("position")
          .returns<AchievementGalleryItem[]>()
      : { data: [] as AchievementGalleryItem[] };

    const grouped = new Map<string, AchievementGalleryItem[]>();
    for (const item of galleryItems ?? []) {
      const list = grouped.get(item.achievement_id) ?? [];
      list.push(item);
      grouped.set(item.achievement_id, list);
    }
    setGalleryByAchievement(grouped);

    const { data: sections } = data.length
      ? await supabase
          .from("achievement_sections")
          .select("*")
          .in("achievement_id", achievementIds)
          .order("position")
          .returns<AchievementSection[]>()
      : { data: [] as AchievementSection[] };

    const groupedSections = new Map<string, AchievementSection[]>();
    for (const section of sections ?? []) {
      const list = groupedSections.get(section.achievement_id) ?? [];
      list.push(section);
      groupedSections.set(section.achievement_id, list);
    }
    setSectionsByAchievement(groupedSections);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this achievement? This can't be undone.")) return;
    setError(null);
    try {
      await deleteRecord("achievements", id);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete achievement:", err);
      setError("Failed to delete this achievement. Please try again.");
      await refetch();
    }
  }

  async function handleReorder(orderedIds: string[]) {
    setError(null);
    try {
      await reorder("achievements", orderedIds);
    } catch (err) {
      console.error("Failed to reorder achievements:", err);
      setError("Failed to save the new order. Please try again.");
      await refetch();
    }
  }

  if (loading) return <p className="text-brown-600">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Achievements</h1>
        <Link href="/admin/achievements/new" className="rounded-full bg-accent px-4 py-2 text-sm text-cream">
          New Achievement
        </Link>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {achievements.length === 0 ? (
        <p className="text-brown-600">No achievements yet.</p>
      ) : (
        <SortableList
          items={achievements}
          onReorder={handleReorder}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          renderItem={(achievement, dragHandle) => (
            <AchievementCard
              achievement={achievement}
              galleryItems={galleryByAchievement.get(achievement.id)}
              sections={sectionsByAchievement.get(achievement.id)}
              adminControls={
                <EntryControls
                  editHref={`/admin/achievements/${achievement.id}/edit`}
                  onDelete={() => handleDelete(achievement.id)}
                  dragHandle={dragHandle}
                />
              }
            />
          )}
        />
      )}
    </div>
  );
}
