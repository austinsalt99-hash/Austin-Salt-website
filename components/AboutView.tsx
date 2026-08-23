import Image from "next/image";
import Link from "next/link";
import type { About } from "@/lib/types";

export function AboutView({ about, editHref }: { about: About; editHref?: string }) {
  const photoSrc = about.photo_url || "/images/about/austin-engine.jpg";

  return (
    <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2 sm:gap-14">
      <div className="order-2 sm:order-1">
        {about.bio && <p className="text-lg leading-relaxed text-brown-600">{about.bio}</p>}
        {editHref && (
          <Link href={editHref} className="mt-6 inline-block rounded-full bg-accent px-5 py-2 text-sm text-cream">
            Edit
          </Link>
        )}
      </div>
      <div className="order-1 rounded-2xl border border-stone-500/30 bg-beige p-3 sm:order-2">
        <div className="overflow-hidden rounded-xl">
          <Image
            src={photoSrc}
            alt="Austin Salt working on a dirt bike engine"
            width={1500}
            height={2000}
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
