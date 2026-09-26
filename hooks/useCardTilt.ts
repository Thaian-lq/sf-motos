"use client";
import { RefObject, useEffect } from "react";
import { clamp } from "@/lib/math";
import { usePointerFine } from "@/hooks/usePointerFine";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function computeTilt(px: number, py: number): { rotateX: number; rotateY: number } {
  const rotateX = (0.5 - py) * 22 + 8;
  const rotateY = (px - 0.5) * 28 - 14;
  return { rotateX, rotateY };
}

const BASE_TRANSFORM = "rotateX(8deg) rotateY(-14deg) rotateZ(-2deg)";

export function useCardTilt(
  stageRef: RefObject<HTMLDivElement | null>,
  cardRef: RefObject<HTMLDivElement | null>,
) {
  const hasFinePointer = usePointerFine();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!hasFinePointer || prefersReduced) return;
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;

    let raf = 0;
    function onMove(e: PointerEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = stage!.getBoundingClientRect();
        const px = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        const py = clamp((e.clientY - rect.top) / rect.height, 0, 1);
        const { rotateX, rotateY } = computeTilt(px, py);
        card!.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(-2deg)`;
        card!.style.setProperty("--sheen-x", `${px * 100}%`);
        card!.style.setProperty("--sheen-y", `${py * 100}%`);
      });
    }
    function onLeave() {
      card!.style.transform = BASE_TRANSFORM;
      card!.style.setProperty("--sheen-x", "20%");
      card!.style.setProperty("--sheen-y", "20%");
    }
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [hasFinePointer, prefersReduced, stageRef, cardRef]);
}
