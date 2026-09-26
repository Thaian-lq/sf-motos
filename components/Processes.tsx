"use client";
import { useEffect, useRef } from "react";
import { clamp } from "@/lib/math";
import { Reveal } from "@/components/Reveal";

const STEPS = [
  { num: "01", title: "Recepção", body: "Anotamos o histórico e o que você percebeu de diferente na moto." },
  { num: "02", title: "Diagnóstico", body: "Inspeção técnica completa antes de qualquer orçamento fechado." },
  { num: "03", title: "Execução", body: "Serviço feito com peças certas e prazo combinado." },
  { num: "04", title: "Entrega", body: "Teste final e explicação do que foi feito, sem letra miúda." },
];

export function Processes() {
  const sectionRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const fill = fillRef.current;
    if (!section || !fill) return;

    let ticking = false;
    function update() {
      ticking = false;
      const rect = section!.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.6;
      const scrolled = vh * 0.8 - rect.top;
      const p = clamp(scrolled / total, 0, 1);
      fill!.style.transform = `scaleY(${p})`;
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();

    const io = "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); }),
          { threshold: 0.5 }
        )
      : null;
    stepRefs.current.forEach((el) => io?.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      io?.disconnect();
    };
  }, []);

  return (
    <section className="section" id="process" ref={sectionRef}>
      <div className="tech-corner tl" /><div className="tech-corner tr" />
      <div className="section-head">
        <h2>Processos</h2>
        <span className="eyebrow">Do check-in à entrega</span>
      </div>
      <div className="process-timeline">
        <div className="timeline-track"><i className="timeline-fill" ref={fillRef} /></div>
        {STEPS.map((step, i) => (
          <Reveal
            key={step.num}
            delayMs={i * 80}
            className="process-step cursor-hover-target"
            elRef={(el) => { if (el) stepRefs.current[i] = el; }}
          >
            <span className="step-num">{step.num}</span>
            <div className="step-body"><h3>{step.title}</h3><p>{step.body}</p></div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
