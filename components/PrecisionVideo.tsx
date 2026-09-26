import { ScrubVideo } from "@/components/ScrubVideo";

export function PrecisionVideo() {
  return (
    <ScrubVideo
      scrollId="motorScroll"
      sectionId="motor"
      short
      src="/video/motor.mp4"
      frameCount={72}
      heightVh={280}
      fadeStart={0.55}
      fadeEnd={0.74}
      scrimDirection="right"
      cue={{ label: "Scroll", end: 0.6, fadeStart: 0.82, fadeEnd: 0.95, align: "right" }}
      reducedFrame={0.5}
      phases={[
        {
          id: "motorPhaseA",
          align: "right",
          content: (
            <>
              <div className="eyebrow">Diagnóstico de verdade</div>
              <h2>Precisão que<br /><span className="accent">se nota</span></h2>
              <p className="scrub-sub">
                Vamos a fundo em cada detalhe do motor pra encontrar a causa real e dar a
                tratativa certa. Nem sempre é preciso desmontar tudo — mas vamos até onde for
                necessário.
              </p>
              <div className="scrub-actions">
                <a href="#contact" className="btn-primary cursor-hover-target">Falar com a oficina</a>
              </div>
            </>
          ),
        },
        {
          id: "motorPhaseB",
          align: "right",
          content: (
            <>
              <span className="eyebrow">O que fazemos</span>
              <h2 className="reveal-word" style={{ marginTop: 14 }}>Serviços</h2>
              <a href="#services" className="reveal-hint cursor-hover-target">Ver todos ↓</a>
            </>
          ),
        },
      ]}
    />
  );
}
