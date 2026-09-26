"use client";
import { useEffect, useRef } from "react";
import { usePointerFine } from "@/hooks/usePointerFine";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const hasFinePointer = usePointerFine();
  const prefersReduced = useReducedMotion();
  const enabled = hasFinePointer && !prefersReduced;

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf = 0;

    function onPointerMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      dot!.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    }

    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring!.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(ringLoop);
    }

    function onPointerOver(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (target.closest?.("[data-drag-target]")) return;
      if (target.closest?.(".cursor-hover-target")) ring!.classList.add("cursor-hover");
    }
    function onPointerOut(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (target.closest?.(".cursor-hover-target")) ring!.classList.remove("cursor-hover");
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    raf = requestAnimationFrame(ringLoop);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
