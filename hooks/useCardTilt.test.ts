import { describe, expect, it } from "vitest";
import { computeTilt } from "./useCardTilt";

describe("computeTilt", () => {
  it("returns the resting tilt at the center of the stage", () => {
    const { rotateX, rotateY } = computeTilt(0.5, 0.5);
    expect(rotateX).toBeCloseTo(8, 5);
    expect(rotateY).toBeCloseTo(-14, 5);
  });

  it("tilts up and right when the pointer is top-right", () => {
    const { rotateX, rotateY } = computeTilt(1, 0);
    expect(rotateX).toBeGreaterThan(8);
    expect(rotateY).toBeGreaterThan(-14);
  });

  it("tilts down and left when the pointer is bottom-left", () => {
    const { rotateX, rotateY } = computeTilt(0, 1);
    expect(rotateX).toBeLessThan(8);
    expect(rotateY).toBeLessThan(-14);
  });
});
