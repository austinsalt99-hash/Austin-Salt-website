import { createClient } from "@/lib/supabase/server";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import type { ExperienceEntry } from "@/lib/types";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: entry } = await supabase.from("experience").select("*").eq("id", id).single<ExperienceEntry>();

  if (!entry) return <p className="text-brown-600">Experience entry not found.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">Edit Experience Entry</h1>
      <ExperienceForm
        initialData={{
          id: entry.id,
          role: entry.role,
          organization: entry.organization,
          dateRange: entry.date_range ?? "",
          description: entry.description ?? "",
          imageUrl: entry.image_url ?? "",
        }}
      />
    </div>
  );
}
