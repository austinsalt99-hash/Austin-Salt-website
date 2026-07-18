"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrdered, deleteRecord, reorder } from "@/lib/data/collections";
import { SortableList } from "@/components/admin/SortableList";
import { EntryControls } from "@/components/admin/EntryControls";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/lib/types";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listOrdered<Project>("projects").then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  async function refetchProjects() {
    const data = await listOrdered<Project>("projects");
    setProjects(data);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This can't be undone.")) return;
    setError(null);
    try {
      await deleteRecord("projects", id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError("Failed to delete this project. Please try again.");
      await refetchProjects();
    }
  }

  async function handleReorder(orderedIds: string[]) {
    setError(null);
    try {
      await reorder("projects", orderedIds);
    } catch (err) {
      console.error("Failed to reorder projects:", err);
      setError("Failed to save the new project order. Please try again.");
      await refetchProjects();
    }
  }

  if (loading) return <p className="text-brown-600">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Projects</h1>
        <Link href="/admin/projects/new" className="rounded-full bg-accent px-4 py-2 text-sm text-cream">
          New Project
        </Link>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {projects.length === 0 ? (
        <p className="text-brown-600">No projects yet.</p>
      ) : (
        <SortableList
          items={projects}
          onReorder={handleReorder}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          renderItem={(project, dragHandle) => (
            <ProjectCard
              project={project}
              adminControls={
                <EntryControls
                  editHref={`/admin/projects/${project.id}/edit`}
                  onDelete={() => handleDelete(project.id)}
                  dragHandle={dragHandle}
                />
              }
            />
          )}
        />
      )}
    </div>
  );
}
