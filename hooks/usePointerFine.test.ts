import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePointerFine } from "./usePointerFine";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("usePointerFine", () => {
  it("returns true for a fine pointer (mouse)", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePointerFine());
    expect(result.current).toBe(true);
  });

  it("returns false for a coarse pointer (touch)", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePointerFine());
    expect(result.current).toBe(false);
  });
});
