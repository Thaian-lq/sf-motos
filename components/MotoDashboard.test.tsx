import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MotoDashboard } from "./MotoDashboard";

describe("MotoDashboard", () => {
  afterEach(cleanup);

  beforeAll(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false, media: query, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
    }));
  });

  it("renders the section copy and the CTA", () => {
    render(<MotoDashboard />);
    expect(screen.getByRole("heading", { name: "Muito mais que uma oficina." })).toBeTruthy();
    expect(screen.getByText("Tudo para sua moto. E tudo para você.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Conheça a SF Motos" })).toBeTruthy();
  });

  it("has one indicator per thing you find at the shop", () => {
    render(<MotoDashboard />);
    const names = screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"));
    expect(names).toEqual(["Oficina", "Cerveja", "Petiscos", "Itens para moto", "Acessórios"]);
  });

  it("starts in neutral with no indicator lit", () => {
    render(<MotoDashboard />);
    expect(screen.getByTestId("gear").textContent).toBe("N");
    for (const b of screen.getAllByRole("button")) expect(b.getAttribute("aria-pressed")).toBe("false");
  });

  it("hovering an indicator lights it, shows its info and engages its gear", () => {
    render(<MotoDashboard />);
    const cerveja = screen.getByRole("button", { name: "Cerveja" });
    fireEvent.pointerEnter(cerveja);
    expect(cerveja.getAttribute("aria-pressed")).toBe("true");
    const display = screen.getByRole("status");
    expect(within(display).getByText("Cerveja")).toBeTruthy();
    expect(within(display).getByText("Um espaço para parar, relaxar e aproveitar.")).toBeTruthy();
    expect(screen.getByTestId("gear").textContent).toBe("2");
  });

  it("works from the keyboard (focus) and by tap (click)", () => {
    render(<MotoDashboard />);
    fireEvent.focus(screen.getByRole("button", { name: "Acessórios" }));
    expect(within(screen.getByRole("status")).getByText("Estilo e praticidade para sua moto.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Oficina" }));
    expect(within(screen.getByRole("status")).getByText("Manutenção e cuidados para sua moto.")).toBeTruthy();
    expect(screen.getByTestId("gear").textContent).toBe("1");
  });

  it("returns to neutral when the pointer leaves the cluster", () => {
    render(<MotoDashboard />);
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Petiscos" }));
    fireEvent.pointerLeave(screen.getByTestId("cluster"), { pointerType: "mouse" });
    expect(screen.getByTestId("gear").textContent).toBe("N");
  });

  it("keeps the tapped indicator lit when a touch ends (touch fires pointerleave on lift)", () => {
    render(<MotoDashboard />);
    const btn = screen.getByRole("button", { name: "Petiscos" });
    fireEvent.pointerEnter(btn, { pointerType: "touch" });
    fireEvent.click(btn);
    fireEvent.pointerLeave(screen.getByTestId("cluster"), { pointerType: "touch" });
    expect(screen.getByTestId("gear").textContent).toBe("3");
  });
});
