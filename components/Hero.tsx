import { ScrubVideo } from "@/components/ScrubVideo";

export function Hero() {
  return (
    <ScrubVideo
      scrollId="heroScroll"
      sectionId="hero"
      src="/video/moto.mp4"
      frameCount={90}
      heightVh={220}
      anchorId="about"
      fadeStart={0.34}
      fadeEnd={0.5}
      cue={{ label: "Scroll to explore", end: 0.5, fadeStart: 0.86, fadeEnd: 0.97 }}
      endFade={{ start: 0.86, end: 1 }}
      reducedFrame={0.55}
      phases={[
        {
          id: "heroPhase",
          content: (
            <>
              <div className="eyebrow">Oficina de alta performance em Resende, RJ</div>
              <h1 className="title">SF<br /><span className="accent">MOTOS</span></h1>
              <p className="hero-tagline">Manutenção · Performance · Customização</p>
              <div className="scrub-actions">
                <a href="#contact" className="btn-primary cursor-hover-target">Agendar revisão</a>
                <a href="#location" className="btn-ghost cursor-hover-target">Como chegar →</a>
              </div>
            </>
          ),
        },
        {
          id: "historiaPhase",
          content: (
            <>
              <span className="eyebrow">A oficina</span>
              <h2 style={{ marginTop: 14 }}>
                Precisão de pista<br /><span className="accent">no dia a dia</span>
              </h2>
              <p className="scrub-sub" style={{ maxWidth: 560 }}>
                Fundada em 2026, a SF Motos Alta Performance nasceu com um objetivo claro:
                atender motos de alta cilindrada e alto padrão em Resende com a tecnologia e o
                rigor técnico que esse tipo de máquina exige.
              </p>
              <p className="scrub-sub" style={{ maxWidth: 560 }}>
                Trabalhamos com honestidade e transparência em cada orçamento, comprometidos
                com o cliente do início ao fim — é isso que nos coloca como referência em
                oficina de moto de alta performance na cidade.
              </p>
              <div className="stat-row">
                <div className="stat"><b>2026</b><span>Ano de fundação</span></div>
                <div className="stat"><b>5.0</b><span>Avaliação média</span></div>
              </div>
            </>
          ),
        },
      ]}
    />
  );
}
