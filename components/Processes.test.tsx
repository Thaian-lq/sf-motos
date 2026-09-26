import { beforeAll, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Processes } from "./Processes";

describe("Processes", () => {
  beforeAll(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false, media: query, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
    }));
  });

  // No original, cada .process-step é o próprio elemento [data-reveal] e filho direto da timeline,
  // o que faz .process-step:last-child remover a borda só do último passo.
  it("renders each step as a direct [data-reveal] child of the timeline", () => {
    const { container } = render(<Processes />);
    const steps = [...container.querySelectorAll(".process-step")];
    expect(steps).toHaveLength(4);
    for (const step of steps) {
      expect(step.hasAttribute("data-reveal")).toBe(true);
      expect(step.parentElement?.classList.contains("process-timeline")).toBe(true);
    }
  });
});
