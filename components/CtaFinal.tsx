const WHATSAPP_URL = "https://wa.me/5524999170017?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20SF%20Motos.";

export function CtaFinal() {
  return (
    <section className="cta-band" id="contact">
      <div className="section-fade top" />
      <div className="section-fade bottom" />
      <span className="cta-watermark" aria-hidden="true">SF</span>
      <div className="cta-inner">
        <span className="eyebrow">Fale com a oficina</span>
        <h2>
          Sua moto merece
          <br />
          manutenção de verdade
        </h2>
        <p>Fale com a oficina agora pelo WhatsApp</p>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-dark cursor-hover-target">
          Chamar no WhatsApp
        </a>
      </div>
    </section>
  );
}
