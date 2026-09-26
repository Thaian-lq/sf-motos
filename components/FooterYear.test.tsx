import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
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

  // O HTML é gerado no build e hidratado em outra data; se o servidor imprimir um ano,
  // a hidratação num ano diferente quebra. Como no original, o ano só aparece no cliente.
  it("server-renders no year, so hydration in any year matches", () => {
    const html = renderToString(<FooterYear />);
    expect(html).not.toMatch(/\d{4}/);
  });

  it("fills in the visitor's year after hydration without errors", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<FooterYear />);
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2031-03-10T12:00:00Z"));
    const onRecoverableError = vi.fn();
    await act(async () => {
      hydrateRoot(container, <FooterYear />, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toBe("2031");
  });
});
