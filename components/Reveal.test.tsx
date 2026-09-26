import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Reveal } from "./Reveal";

describe("Reveal", () => {
  it("renders a div by default", () => {
    const { container } = render(<Reveal>x</Reveal>);
    expect(container.firstElementChild?.tagName).toBe("DIV");
    expect(container.firstElementChild?.hasAttribute("data-reveal")).toBe(true);
  });

  it("keeps the original semantic tag when given `as`", () => {
    for (const tag of ["figure", "article", "p"] as const) {
      const { container } = render(<Reveal as={tag}>x</Reveal>);
      expect(container.firstElementChild?.tagName).toBe(tag.toUpperCase());
    }
  });
});
