import { createClient } from "@/lib/supabase/server";
import { AboutView } from "@/components/AboutView";
import type { About } from "@/lib/types";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: about } = await supabase.from("about").select("*").single<About>();

  return (
    <main className="px-6 py-24">
      {about ? (
        <AboutView about={about} />
      ) : (
        <p className="text-center text-brown-600">This section is under construction — check back soon.</p>
      )}
    </main>
  );
}
