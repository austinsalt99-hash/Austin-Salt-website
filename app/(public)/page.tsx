import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/Hero";
import { SectionTile } from "@/components/SectionTile";
import type { HomepageSettings } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("homepage_settings")
    .select("*")
    .single<HomepageSettings>();

  return (
    <main>
      <Hero />
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-2">
        <SectionTile href="/projects" label="Projects" coverUrl={settings?.projects_cover_url} />
        <SectionTile href="/achievements" label="Achievements" coverUrl={settings?.achievements_cover_url} />
        <SectionTile href="/about" label="About" coverUrl={settings?.about_cover_url} />
        <SectionTile href="/experience" label="Experience" coverUrl={settings?.experience_cover_url} />
      </section>
    </main>
  );
}
