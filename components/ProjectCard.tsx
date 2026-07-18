import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({
  project,
  linkHref,
  adminControls,
}: {
  project: Project;
  linkHref?: string;
  adminControls?: React.ReactNode;
}) {
  const content = (
    <>
      {project.cover_photo_url && (
        <img src={project.cover_photo_url} alt="" className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-brown-900">{project.title}</h2>
        {project.description && (
          <p className="mt-1 line-clamp-2 text-sm text-brown-600">{project.description}</p>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-beige bg-beige/40 transition hover:shadow-md">
      {linkHref ? (
        <Link href={linkHref} className="flex flex-col">
          {content}
        </Link>
      ) : (
        <div className="flex flex-col">{content}</div>
      )}
      {adminControls && <div className="border-t border-beige px-4 py-3">{adminControls}</div>}
    </div>
  );
}
