import { describe, it, expect } from "vitest";
import { addSection, removeSection, updateSection, moveSection } from "./sectionsReducer";
import type { SectionDraft } from "./sectionsReducer";

const base: SectionDraft[] = [
  { id: "1", title: "Design", description: "d1" },
  { id: "2", title: "Testing", description: "d2" },
];

describe("sectionsReducer", () => {
  it("adds a blank section", () => {
    const next = addSection(base);
    expect(next).toHaveLength(3);
    expect(next[2].title).toBe("");
  });

  it("removes a section by id", () => {
    const next = removeSection(base, "1");
    expect(next).toEqual([{ id: "2", title: "Testing", description: "d2" }]);
  });

  it("updates a section's fields", () => {
    const next = updateSection(base, "1", { title: "Manufacturing" });
    expect(next[0].title).toBe("Manufacturing");
    expect(next[0].description).toBe("d1");
  });

  it("moves a section up", () => {
    const next = moveSection(base, "2", "up");
    expect(next.map((s) => s.id)).toEqual(["2", "1"]);
  });

  it("does not move the first section further up", () => {
    const next = moveSection(base, "1", "up");
    expect(next.map((s) => s.id)).toEqual(["1", "2"]);
  });
});
