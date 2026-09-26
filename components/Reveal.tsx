"use client";
import { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface RevealProps {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}

export function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();
  const style = { "--d": `${delayMs}ms` } as CSSProperties;

  return (
    <div ref={ref} data-reveal className={className} style={style}>
      {children}
    </div>
  );
}
