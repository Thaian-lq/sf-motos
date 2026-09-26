"use client";
import Image from "next/image";
import { useRef } from "react";
import { useCardTilt } from "@/hooks/useCardTilt";
import { Reveal } from "@/components/Reveal";

const CATEGORIES = [
  {
    title: "Oficina",
    description: "Serviço técnico e cuidado com sua moto.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M14.5 6.5a3.5 3.5 0 10-4.9 4.9L4 17l3 3 6.4-6.4a3.5 3.5 0 004.9-4.9l-2.3 2.3-2-.5-.5-2 2.3-2.3z" />
        <circle cx="12" cy="12" r="1.1" style={{ fill: "var(--red)", stroke: "none" }} />
      </svg>
    ),
  },
  {
    title: "Chopp gelado",
    description: "Boa companhia enquanto sua moto é atendida.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M6 8h10v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" />
        <path d="M16 10h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
        <path d="M6 8c0-2 1.2-3 1.2-4.4M9.4 8c0-2 1.2-3 1.2-4.4" style={{ stroke: "var(--red)" }} />
      </svg>
    ),
  },
  {
    title: "Itens para moto",
    description: "Produtos e itens para sua moto.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M4 14a8 8 0 0116 0v2a2 2 0 01-2 2h-1v-3a1 1 0 00-1-1H8a1 1 0 00-1 1v3H6a2 2 0 01-2-2v-2z" />
        <path d="M9 12h6" style={{ stroke: "var(--red)" }} />
      </svg>
    ),
  },
  {
    title: "Acessórios",
    description: "Praticidade e estilo para sua moto.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <circle cx="7" cy="13" r="3.2" />
        <circle cx="17" cy="13" r="3.2" />
        <path d="M10.2 12h3.6" />
        <path d="M3.8 12L2 10M20.2 12L22 10" style={{ stroke: "var(--red)" }} />
      </svg>
    ),
  },
];

export function SFCard() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  useCardTilt(stageRef, cardRef);

  return (
    <section className="section" id="cartao">
      <Reveal className="cartao-head">
        <span className="eyebrow">SF Motos / Lifestyle</span>
        <h2 className="cartao-title">
          Cartão <span className="accent">SF Motos</span>
        </h2>
        <p className="cartao-sub">
          Tudo o que você precisa para sua moto e para curtir o momento, em um só lugar.
        </p>
      </Reveal>

      <div className="cartao-stage" ref={stageRef}>
        <div className="sfcard cursor-hover-target" ref={cardRef}>
          <div className="sfcard-sheen" />
          <div className="sfcard-pattern" aria-hidden="true" />
          <div className="sfcard-top">
            <Image src="/imgs/logo-sf.png" alt="" className="sfcard-logo" width={46} height={46} />
            <span className="sfcard-medal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
                <circle cx="12" cy="12" r="3.4" />
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
              </svg>
            </span>
          </div>
          <div className="sfcard-body">
            <b>SF · MOTOS</b>
            <span>Oficina · Lifestyle · Motos</span>
          </div>
          <div className="sfcard-bottom">
            <span className="eyebrow">Cartão SF Motos</span>
          </div>
        </div>
      </div>

      <Reveal className="cartao-support">
        Na SF Motos, você encontra muito mais do que uma oficina. Tenha por perto tudo o que faz
        parte da experiência de quem vive o mundo das duas rodas.
      </Reveal>

      <div className="cartao-cats">
        {CATEGORIES.map((cat, i) => (
          <Reveal key={cat.title} delayMs={i * 80} className="cartao-cat">
            <span className="icon" aria-hidden="true">{cat.icon}</span>
            <b>{cat.title}</b>
            <p>{cat.description}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="cartao-cta-wrap">
        <a href="#contact" className="btn-primary cursor-hover-target">
          Conheça o Cartão SF Motos
        </a>
      </Reveal>
    </section>
  );
}
