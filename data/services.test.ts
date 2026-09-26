import { describe, expect, it } from "vitest";
import { services } from "./services";

describe("services", () => {
  it("keeps the original card order starting with Motor & performance", () => {
    expect(services.map((s) => s.title).slice(0, 2)).toEqual(["Motor & performance", "Revisão geral"]);
  });

  it("numbers the cards sequentially 01..08 in display order", () => {
    expect(services.map((s) => s.num)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08"]);
  });
});
