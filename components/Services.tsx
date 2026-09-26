import Image from "next/image";
import { services } from "@/data/services";

export function Services() {
  return (
    <section className="section" id="services">
      <div className="section-head">
        <h2>Serviços</h2>
        <span className="eyebrow">Diagnóstico incluso em todos</span>
      </div>
      <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.num}
            className={`service-card cursor-hover-target${service.featured ? " featured" : ""}${service.wide ? " wide" : ""}`}
          >
            <span className="num-bg">{service.num}</span>
            <span className="icon" aria-hidden="true">{service.icon}</span>
            <span className="num">{service.num}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            {service.seal && (
              <div className="service-seal">
                <Image src={service.seal.image} alt={service.seal.alt} width={56} height={56} />
                <div className="service-seal-text">
                  <b>{service.seal.title}</b>
                  <span>{service.seal.subtitle}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
