"use client";

import { addSection, removeSection, updateSection, moveSection } from "@/lib/sectionsReducer";
import type { SectionDraft } from "@/lib/sectionsReducer";

export function SectionsRepeater({
  sections,
  onChange,
}: {
  sections: SectionDraft[];
  onChange: (sections: SectionDraft[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, i) => (
        <div key={section.id} className="flex flex-col gap-2 rounded-lg border border-beige p-4">
          <input
            placeholder="Section title (e.g. Design Process)"
            value={section.title}
            onChange={(e) => onChange(updateSection(sections, section.id, { title: e.target.value }))}
            className="rounded-lg border border-beige bg-cream px-3 py-2 font-medium"
          />
          <textarea
            placeholder="Section description"
            rows={3}
            value={section.description}
            onChange={(e) => onChange(updateSection(sections, section.id, { description: e.target.value }))}
            className="rounded-lg border border-beige bg-cream px-3 py-2"
          />
          <div className="flex gap-3 text-sm text-brown-600">
            <button type="button" disabled={i === 0} onClick={() => onChange(moveSection(sections, section.id, "up"))} className="disabled:opacity-30">
              Move up
            </button>
            <button type="button" disabled={i === sections.length - 1} onClick={() => onChange(moveSection(sections, section.id, "down"))} className="disabled:opacity-30">
              Move down
            </button>
            <button type="button" onClick={() => onChange(removeSection(sections, section.id))} className="text-error">
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange(addSection(sections))}
        className="self-start rounded-full border border-accent px-4 py-2 text-sm text-accent"
      >
        + Add Section
      </button>
    </div>
  );
}
