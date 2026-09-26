import { describe, expect, it } from "vitest";
import { computeClampedPercent } from "./useBeforeAfterSlider";

describe("computeClampedPercent", () => {
  it("clamps to the 4-96 range used by the before/after handle", () => {
    expect(computeClampedPercent(-10)).toBe(4);
    expect(computeClampedPercent(150)).toBe(96);
    expect(computeClampedPercent(50)).toBe(50);
  });
});
