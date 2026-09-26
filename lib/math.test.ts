import { describe, expect, it } from "vitest";
import { clamp, smoothstep } from "./math";

describe("clamp", () => {
  it("returns the value when inside range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps below the minimum", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });
  it("clamps above the maximum", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("smoothstep", () => {
  it("returns 0 at or before the start edge", () => {
    expect(smoothstep(0, 1, 0)).toBe(0);
    expect(smoothstep(0, 1, -1)).toBe(0);
  });
  it("returns 1 at or after the end edge", () => {
    expect(smoothstep(0, 1, 1)).toBe(1);
    expect(smoothstep(0, 1, 2)).toBe(1);
  });
  it("eases through the midpoint", () => {
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 5);
  });
});
