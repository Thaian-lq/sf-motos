import { describe, expect, it } from "vitest";
import { rpmToAngle, TACH_MAX_RPM, TACH_SWEEP } from "./tach";

describe("rpmToAngle", () => {
  it("maps 0 rpm to the start of the sweep and max rpm to its end", () => {
    expect(rpmToAngle(0)).toBeCloseTo(-TACH_SWEEP / 2, 5);
    expect(rpmToAngle(TACH_MAX_RPM)).toBeCloseTo(TACH_SWEEP / 2, 5);
  });

  it("is linear in between", () => {
    expect(rpmToAngle(TACH_MAX_RPM / 2)).toBeCloseTo(0, 5);
  });

  it("clamps rpm outside the dial", () => {
    expect(rpmToAngle(-500)).toBeCloseTo(rpmToAngle(0), 5);
    expect(rpmToAngle(TACH_MAX_RPM + 3000)).toBeCloseTo(rpmToAngle(TACH_MAX_RPM), 5);
  });
});
