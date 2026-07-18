"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type SortableListItem = { id: string };

export type DragHandle = {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
};

export function SortableList<T extends SortableListItem>({
  items,
  onReorder,
  renderItem,
  className = "flex flex-col gap-3",
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, dragHandle: DragHandle) => React.ReactNode;
  className?: string;
}) {
  const [ordered, setOrdered] = useState(items);
  useEffect(() => setOrdered(items), [items]);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((item) => item.id === active.id);
    const newIndex = ordered.findIndex((item) => item.id === over.id);
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    onReorder(next.map((item) => item.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className={className}>
          {ordered.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {(dragHandle) => renderItem(item, dragHandle)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (dragHandle: DragHandle) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className="list-none">
      {children({ attributes, listeners })}
    </li>
  );
}
