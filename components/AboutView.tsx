import Link from "next/link";
import type { About } from "@/lib/types";

export function AboutView({ about, editHref }: { about: About; editHref?: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
      {about.photo_url && (
        <img src={about.photo_url} alt="" className="h-40 w-40 rounded-full object-cover" />
      )}
      {about.bio && <p className="text-brown-600">{about.bio}</p>}
      {editHref && (
        <Link href={editHref} className="rounded-full bg-accent px-5 py-2 text-sm text-cream">
          Edit
        </Link>
      )}
    </div>
  );
}
