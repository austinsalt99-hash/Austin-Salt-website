import { createClient } from "@/lib/supabase/server";
import { AboutView } from "@/components/AboutView";
import type { About } from "@/lib/types";

export default async function AdminAboutPage() {
  const supabase = await createClient();
  const { data: about } = await supabase.from("about").select("*").single<About>();

  if (!about) return <p className="text-error">About row is missing — check the database.</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-brown-900">About</h1>
      <AboutView about={about} editHref="/admin/about/edit" />
    </div>
  );
}
