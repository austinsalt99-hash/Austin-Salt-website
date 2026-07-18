import { describe, it, expect } from "vitest";
import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Baja Suspension Redesign")).toBe("baja-suspension-redesign");
  });

  it("strips punctuation", () => {
    expect(slugify("CAD/CAM: Part 2!")).toBe("cad-cam-part-2");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Robot Arm--  ")).toBe("robot-arm");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when it's not taken", () => {
    expect(uniqueSlug("robot-arm", ["baja-suspension"])).toBe("robot-arm");
  });

  it("appends -2 when the base slug is taken", () => {
    expect(uniqueSlug("robot-arm", ["robot-arm"])).toBe("robot-arm-2");
  });

  it("increments past multiple collisions", () => {
    expect(uniqueSlug("robot-arm", ["robot-arm", "robot-arm-2", "robot-arm-3"])).toBe("robot-arm-4");
  });
});
