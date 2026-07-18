import Link from "next/link";
import { TileCoverControl } from "@/components/admin/TileCoverControl";

type CoverColumn =
  | "projects_cover_url"
  | "achievements_cover_url"
  | "about_cover_url"
  | "experience_cover_url";

export function AdminSectionTile({
  href,
  label,
  coverUrl,
  settingsId,
  column,
}: {
  href: string;
  label: string;
  coverUrl: string | null;
  settingsId: string;
  column: CoverColumn;
}) {
  return (
    <div
      className="relative flex h-56 flex-col justify-between overflow-hidden rounded-2xl p-6"
      style={
        coverUrl
          ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      <div
        className={
          coverUrl
            ? "absolute inset-0 bg-gradient-to-t from-brown-900/80 via-brown-900/20 to-transparent"
            : "absolute inset-0 bg-gradient-to-br from-brown-600 to-brown-900"
        }
      />
      <div className="relative flex justify-end">
        <TileCoverControl settingsId={settingsId} column={column} />
      </div>
      <Link href={href} className="relative text-2xl font-semibold text-cream underline-offset-4 hover:underline">
        {label}
      </Link>
    </div>
  );
}
