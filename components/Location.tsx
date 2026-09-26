const WHATSAPP_URL = "https://wa.me/5524999170017?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20SF%20Motos.";

export function Location() {
  return (
    <section className="section" id="location">
      <div className="section-head">
        <h2>Localização</h2>
        <span className="eyebrow">Seg — Sáb · 08h às 18h</span>
      </div>
      <div className="location-compose">
        <div className="location-map">
          <iframe
            title="Localização da SF Motos"
            src="https://www.google.com/maps?q=R.+Dalva+Menandro%2C+34+-+Comercial%2C+Resende+-+RJ%2C+27541-180&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="location-panel">
          <span className="eyebrow">Onde estamos</span>
          <h2>Venha ver de<br />perto o trabalho</h2>
          <div className="location-detail">
            <span className="label">Endereço</span>
            <p>R. Dalva Menandro, 34<br />Comercial, Resende — RJ</p>
          </div>
          <div className="location-detail">
            <span className="label">Horário</span>
            <p>Seg — Sáb<br />08h às 18h</p>
          </div>
          <div className="location-detail">
            <span className="label">WhatsApp</span>
            <p>(24) 99917-0017</p>
          </div>
          <div className="location-actions">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=R.+Dalva+Menandro%2C+34+-+Comercial%2C+Resende+-+RJ%2C+27541-180"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost cursor-hover-target"
            >
              Como chegar →
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary cursor-hover-target">
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
