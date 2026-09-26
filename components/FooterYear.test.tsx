import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FooterYear } from "./FooterYear";

describe("FooterYear", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the visitor's current year, not the build year", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2031-03-10T12:00:00Z"));
    render(<FooterYear />);
    expect(screen.getByText("2031")).toBeTruthy();
  });
});
