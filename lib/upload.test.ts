import { describe, it, expect } from "vitest";
import { computeResizeDimensions } from "./upload";

describe("computeResizeDimensions", () => {
  it("leaves small images unchanged", () => {
    expect(computeResizeDimensions(800, 600, 1920)).toEqual({ width: 800, height: 600 });
  });

  it("downscales a wide image to fit the max dimension", () => {
    expect(computeResizeDimensions(4000, 2000, 1920)).toEqual({ width: 1920, height: 960 });
  });

  it("downscales a tall image to fit the max dimension", () => {
    expect(computeResizeDimensions(2000, 4000, 1920)).toEqual({ width: 960, height: 1920 });
  });
});
