"use client";

import Link from "next/link";
import type { DragHandle } from "@/components/admin/SortableList";

export function EntryControls({
  editHref,
  onDelete,
  dragHandle,
}: {
  editHref: string;
  onDelete: () => void;
  dragHandle: DragHandle;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <button
        type="button"
        {...dragHandle.attributes}
        {...dragHandle.listeners}
        className="cursor-grab text-stone-500"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      <div className="flex gap-3">
        <Link href={editHref} className="text-accent underline">
          Edit
        </Link>
        <button type="button" onClick={onDelete} className="text-error underline">
          Delete
        </button>
      </div>
    </div>
  );
}
