import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-beige bg-beige/40 transition hover:shadow-md"
    >
      {project.cover_photo_url && (
        <img src={project.cover_photo_url} alt="" className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-brown-900">{project.title}</h2>
        {project.description && (
          <p className="mt-1 line-clamp-2 text-sm text-brown-600">{project.description}</p>
        )}
      </div>
    </Link>
  );
}
