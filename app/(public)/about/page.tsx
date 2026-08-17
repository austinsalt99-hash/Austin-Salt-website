import { createClient } from "@/lib/supabase/server";
import { AboutView } from "@/components/AboutView";
import type { About } from "@/lib/types";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: about } = await supabase.from("about").select("*").single<About>();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <h1 className="text-3xl font-semibold text-brown-900">About</h1>
      <div className="mt-10">
        {about ? (
          <AboutView about={about} />
        ) : (
          <p className="text-center text-brown-600">This section is under construction — check back soon.</p>
        )}
      </div>
    </main>
  );
}
