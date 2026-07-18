import type { Achievement } from "@/lib/types";

export function AchievementCard({
  achievement,
  adminControls,
}: {
  achievement: Achievement;
  adminControls?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-beige bg-beige/40">
      {achievement.image_url && (
        <img src={achievement.image_url} alt="" className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-brown-900">{achievement.title}</h2>
        {achievement.description && (
          <p className="mt-1 text-sm text-brown-600">{achievement.description}</p>
        )}
      </div>
      {adminControls && <div className="border-t border-beige px-4 py-3">{adminControls}</div>}
    </div>
  );
}
