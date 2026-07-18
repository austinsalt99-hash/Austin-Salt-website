export type SectionDraft = { id: string; title: string; description: string };

export function addSection(sections: SectionDraft[]): SectionDraft[] {
  return [...sections, { id: crypto.randomUUID(), title: "", description: "" }];
}

export function removeSection(sections: SectionDraft[], id: string): SectionDraft[] {
  return sections.filter((s) => s.id !== id);
}

export function updateSection(
  sections: SectionDraft[],
  id: string,
  values: Partial<Pick<SectionDraft, "title" | "description">>
): SectionDraft[] {
  return sections.map((s) => (s.id === id ? { ...s, ...values } : s));
}

export function moveSection(sections: SectionDraft[], id: string, direction: "up" | "down"): SectionDraft[] {
  const index = sections.findIndex((s) => s.id === id);
  if (index === -1) return sections;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sections.length) return sections;
  const next = [...sections];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}
