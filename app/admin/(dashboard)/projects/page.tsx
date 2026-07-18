"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrdered, deleteRecord, reorder } from "@/lib/data/collections";
import { SortableList } from "@/components/admin/SortableList";
import type { Project } from "@/lib/types";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listOrdered<Project>("projects").then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This can't be undone.")) return;
    await deleteRecord("projects", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleReorder(orderedIds: string[]) {
    await reorder("projects", orderedIds);
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

      {projects.length === 0 ? (
        <p className="text-brown-600">No projects yet.</p>
      ) : (
        <SortableList
          items={projects}
          onReorder={handleReorder}
          renderItem={(project) => (
            <div className="flex items-center justify-between">
              <span className="text-brown-900">{project.title}</span>
              <div className="flex gap-3 text-sm">
                <Link href={`/admin/projects/${project.id}/edit`} className="text-accent underline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(project.id)} className="text-error underline">
                  Delete
                </button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
