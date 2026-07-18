import { createClient } from "@/lib/supabase/server";
import { AchievementCard } from "@/components/AchievementCard";
import type { Achievement } from "@/lib/types";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("position")
    .returns<Achievement[]>();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">Achievements</h1>
      {(!achievements || achievements.length === 0) ? (
        <p className="mt-6 text-brown-600">No achievements yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </main>
  );
}
