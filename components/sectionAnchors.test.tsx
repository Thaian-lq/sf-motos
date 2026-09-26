import { beforeAll, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Hero } from "./Hero";
import { PrecisionVideo } from "./PrecisionVideo";
import { Nav } from "./Nav";

// Âncoras e ids do site original (index.html) que links e navegação dependem.
describe("section anchors", () => {
  beforeAll(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false, media: query, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
    }));
  });

  it("Hero renders section#hero, the target of the nav logo link", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("section#hero")).not.toBeNull();
  });

  it("PrecisionVideo renders section#motor", () => {
    const { container } = render(<PrecisionVideo />);
    expect(container.querySelector("section#motor")).not.toBeNull();
  });

  it("Nav renders nav#siteNav", () => {
    const { container } = render(<Nav />);
    expect(container.querySelector("nav#siteNav")).not.toBeNull();
  });
});
