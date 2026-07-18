import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/ProjectForm";
import type { Project, ProjectGalleryItem, ProjectSection } from "@/lib/types";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single<Project>();
  const { data: gallery } = await supabase
    .from("project_gallery_items")
    .select("*")
    .eq("project_id", id)
    .order("position")
    .returns<ProjectGalleryItem[]>();
  const { data: sections } = await supabase
    .from("project_sections")
    .select("*")
    .eq("project_id", id)
    .order("position")
    .returns<ProjectSection[]>();

  if (!project) return <p className="text-brown-600">Project not found.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brown-900">Edit Project</h1>
      <ProjectForm
        initialData={{
          id: project.id,
          title: project.title,
          description: project.description ?? "",
          coverPhotoUrl: project.cover_photo_url ?? "",
          galleryUrls: (gallery ?? []).map((g) => g.media_url),
          sections: (sections ?? []).map((s) => ({ id: s.id, title: s.title, description: s.description ?? "" })),
        }}
      />
    </div>
  );
}
