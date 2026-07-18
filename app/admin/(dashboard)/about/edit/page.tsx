import { createClient } from "@/lib/supabase/server";
import { AboutForm } from "@/components/admin/AboutForm";
import type { About } from "@/lib/types";

export default async function EditAboutPage() {
  const supabase = await createClient();
  const { data: about } = await supabase.from("about").select("*").single<About>();

  if (!about) return <p className="text-error">About row is missing — check the database.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">Edit About</h1>
      <AboutForm about={about} />
    </div>
  );
}
