import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/Hero";
import { SectionTile } from "@/components/SectionTile";
import type { About, HomepageSettings } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("homepage_settings")
    .select("*")
    .single<HomepageSettings>();
  const { data: about } = await supabase.from("about").select("resume_url").single<Pick<About, "resume_url">>();

  return (
    <main>
      <Hero />
      <section className="mx-auto max-w-[1600px] px-6 pb-16 sm:px-10">
        <div className="flex items-center gap-4">
          <span aria-hidden className="h-px flex-1 bg-stone-500/40" />
          <h2 className="shrink-0 text-2xl font-semibold text-brown-900 sm:text-3xl">About Me</h2>
          <span aria-hidden className="h-px flex-1 bg-stone-500/40" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-8">
          <SectionTile href="/projects" label="Projects" coverUrl={settings?.projects_cover_url} index={0} />
          <SectionTile href="/achievements" label="Achievements" coverUrl={settings?.achievements_cover_url} index={1} />
          <SectionTile href="/about" label="About" coverUrl={settings?.about_cover_url} index={2} />
          <SectionTile href="/experience" label="Experience" coverUrl={settings?.experience_cover_url} index={3} />
        </div>
      </section>

      {about?.resume_url && (
        <section className="mx-auto max-w-[1600px] px-6 pb-16 sm:px-10">
          <div className="flex items-center gap-4">
            <span aria-hidden className="h-px flex-1 bg-stone-500/40" />
            <h2 className="shrink-0 text-2xl font-semibold text-brown-900 sm:text-3xl">Resume</h2>
            <span aria-hidden className="h-px flex-1 bg-stone-500/40" />
          </div>
          <div className="mt-5 flex justify-center">
            <a
              href={about.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-10 py-5 text-lg font-medium text-cream transition-transform duration-300 hover:scale-[1.03]"
            >
              View Resume
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-10">
        <div className="flex items-center gap-4">
          <span aria-hidden className="h-px flex-1 bg-stone-500/40" />
          <h2 className="shrink-0 text-2xl font-semibold text-brown-900 sm:text-3xl">Web Design</h2>
          <span aria-hidden className="h-px flex-1 bg-stone-500/40" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-8">
          <a
            href="https://tallycrew.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between gap-8 rounded-2xl border border-stone-500/30 bg-beige p-8 transition-colors duration-300 hover:border-stone-500/60 sm:p-10"
          >
            <Image
              src="/images/tallycrew/tally-wordmark.png"
              alt="Tally Crew"
              width={584}
              height={136}
              className="h-9 w-auto object-contain"
            />
            <div>
              <p className="text-brown-600">
                A paid hour-logging app for small trade and field-service crews — construction, trucking,
                landscaping — built for logging hours from the job site, not a desk.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 font-medium text-accent">
                Visit tallycrew.ca
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </a>

          <Link
            href="/web-design"
            className="group flex flex-col justify-between gap-8 rounded-2xl border border-stone-500/30 bg-beige p-8 transition-colors duration-300 hover:border-stone-500/60 sm:p-10"
          >
            <span className="text-2xl font-semibold text-brown-900">Website Design</span>
            <div>
              <p className="text-brown-600">
                Custom, fast, easy-to-maintain websites for small businesses and personal brands —
                designed and built end-to-end, from first draft to launch.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 font-medium text-accent">
                Learn more
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
