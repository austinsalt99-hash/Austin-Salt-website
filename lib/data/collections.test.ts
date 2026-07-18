import { describe, it, expect } from "vitest";
import { computePositions } from "./collections";

describe("computePositions", () => {
  it("assigns positions matching array order", () => {
    expect(computePositions(["a", "b", "c"])).toEqual([
      { id: "a", position: 0 },
      { id: "b", position: 1 },
      { id: "c", position: 2 },
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(computePositions([])).toEqual([]);
  });
});
