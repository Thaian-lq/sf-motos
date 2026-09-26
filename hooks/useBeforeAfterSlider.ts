"use client";
import { KeyboardEvent, PointerEvent, useRef, useState } from "react";
import { clamp } from "@/lib/math";

export function computeClampedPercent(pct: number): number {
  return clamp(pct, 4, 96);
}

export function useBeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [interacted, setInteracted] = useState(false);

  function percentFromEvent(e: PointerEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * 100;
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    containerRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    setInteracted(true);
    setPercent(computeClampedPercent(percentFromEvent(e)));
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    setPercent(computeClampedPercent(percentFromEvent(e)));
  }
  function onPointerUp() { setDragging(false); }
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") { setInteracted(true); setPercent((p) => computeClampedPercent(p - 4)); e.preventDefault(); }
    if (e.key === "ArrowRight") { setInteracted(true); setPercent((p) => computeClampedPercent(p + 4)); e.preventDefault(); }
  }

  return {
    containerRef,
    percent,
    dragging,
    interacted,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onKeyDown },
  };
}
