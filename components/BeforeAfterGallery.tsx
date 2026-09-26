"use client";
import { useBeforeAfterSlider } from "@/hooks/useBeforeAfterSlider";
import { Reveal } from "@/components/Reveal";

const CARDS = [
  { label: "Placeholder 01", featured: true },
  { label: "Placeholder 02", featured: false },
  { label: "Placeholder 03", featured: false },
];

function BeforeAfterCard({ label, featured, delayMs }: { label: string; featured: boolean; delayMs: number }) {
  const { containerRef, percent, dragging, interacted, handlers } = useBeforeAfterSlider();

  return (
    <Reveal as="article" delayMs={delayMs} className={`work-card cursor-hover-target${featured ? " featured" : ""}`}>
      <div
        className={`before-after cursor-hover-target${dragging ? " dragging" : ""}${interacted ? " interacted" : ""}`}
        ref={containerRef}
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={handlers.onPointerUp}
        onPointerCancel={handlers.onPointerCancel}
        data-drag-target
      >
        <div className="ba-media ba-before"><span>Antes</span></div>
        <div className="ba-media ba-after" style={{ clipPath: `inset(0 0 0 ${percent}%)` }}><span>Depois</span></div>
        <span className="ba-tag ba-tag-before">Antes</span>
        <span className="ba-tag ba-tag-after">Depois</span>
        <div
          className="ba-handle"
          style={{ left: `${percent}%` }}
          tabIndex={0}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          aria-label={`Arraste para comparar antes e depois — ${label}`}
          onKeyDown={handlers.onKeyDown}
        >
          <span className="ba-handle-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
          </span>
        </div>
      </div>
      <div className="work-caption">
        <b>{label}</b>
        <span className="work-cat">Categoria — a definir</span>
        <p>Substituir por foto real do trabalho</p>
      </div>
    </Reveal>
  );
}

export function BeforeAfterGallery() {
  return (
    <section className="section tone-graphite" id="trabalhos">
      <div className="section-fade top" />
      <div className="section-fade bottom" />
      <div className="section-head">
        <h2>Trabalhos</h2>
        <span className="eyebrow">Antes / depois</span>
      </div>
      <div className="trabalhos-grid">
        {CARDS.map((card, i) => (
          <BeforeAfterCard key={card.label} label={card.label} featured={card.featured} delayMs={i * 80} />
        ))}
      </div>
    </section>
  );
}
