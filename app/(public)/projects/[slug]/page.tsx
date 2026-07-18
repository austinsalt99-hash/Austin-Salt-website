import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Gallery } from "@/components/Gallery";
import type { Project, ProjectGalleryItem, ProjectSection } from "@/lib/types";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single<Project>();

  if (!project) notFound();

  const { data: gallery } = await supabase
    .from("project_gallery_items")
    .select("*")
    .eq("project_id", project.id)
    .order("position")
    .returns<ProjectGalleryItem[]>();

  const { data: sections } = await supabase
    .from("project_sections")
    .select("*")
    .eq("project_id", project.id)
    .order("position")
    .returns<ProjectSection[]>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">{project.title}</h1>
      {project.description && <p className="mt-4 text-brown-600">{project.description}</p>}

      <div className="mt-8">
        <Gallery items={gallery ?? []} />
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {(sections ?? []).map((section) => (
          <div key={section.id}>
            <h2 className="text-xl font-semibold text-brown-900">{section.title}</h2>
            {section.description && <p className="mt-2 text-brown-600">{section.description}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
