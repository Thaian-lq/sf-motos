"use client";
import { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface RevealProps {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  /** Tag do elemento revelado — mantém a semântica do original (figure, article, p). */
  as?: "div" | "figure" | "article" | "p";
  /** Recebe o elemento revelado, para quem precisa observá-lo diretamente (ex.: Processes). */
  elRef?: (el: HTMLElement | null) => void;
}

export function Reveal({ children, delayMs = 0, className, as: Tag = "div", elRef }: RevealProps) {
  const ref = useReveal<HTMLElement>();
  const style = { "--d": `${delayMs}ms` } as CSSProperties;

  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        ref.current = el;
        elRef?.(el);
      }}
      data-reveal
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
