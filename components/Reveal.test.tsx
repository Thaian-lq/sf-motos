import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
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

describe("Reveal re-render", () => {
  // Bug: o vídeo da oficina sumia ao dar play — o re-render com a classe "is-playing"
  // sobrescrevia o "in-view" posto via classList, e o bloco voltava a opacity 0.
  it("keeps in-view after a re-render that changes className", async () => {
    const { container, rerender } = render(<Reveal className="garage-video">x</Reveal>);
    const el = container.firstElementChild!;
    await waitFor(() => expect(el.classList.contains("in-view")).toBe(true));

    rerender(<Reveal className="garage-video is-playing">x</Reveal>);

    expect(el.classList.contains("is-playing")).toBe(true);
    expect(el.classList.contains("in-view")).toBe(true);
  });
});
