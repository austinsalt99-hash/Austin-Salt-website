import { createClient } from "@/lib/supabase/server";
import { AdminSectionTile } from "@/components/admin/AdminSectionTile";
import type { HomepageSettings } from "@/lib/types";

export default async function AdminHome() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("homepage_settings")
    .select("*")
    .single<HomepageSettings>();

  if (!settings) {
    return <p className="text-error">Homepage settings row is missing — check the database.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-brown-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminSectionTile
          href="/admin/projects"
          label="Projects"
          coverUrl={settings.projects_cover_url}
          settingsId={settings.id}
          column="projects_cover_url"
        />
        <AdminSectionTile
          href="/admin/achievements"
          label="Achievements"
          coverUrl={settings.achievements_cover_url}
          settingsId={settings.id}
          column="achievements_cover_url"
        />
        <AdminSectionTile
          href="/admin/about"
          label="About"
          coverUrl={settings.about_cover_url}
          settingsId={settings.id}
          column="about_cover_url"
        />
        <AdminSectionTile
          href="/admin/experience"
          label="Experience"
          coverUrl={settings.experience_cover_url}
          settingsId={settings.id}
          column="experience_cover_url"
        />
      </div>
    </div>
  );
}
