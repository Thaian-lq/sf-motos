"use client";
import Image from "next/image";
import { useRef } from "react";
import { galleryPhotos } from "@/data/gallery";
import { useGarageVideo } from "@/hooks/useGarageVideo";
import { Reveal } from "@/components/Reveal";

export function GarageExperience() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { duration, errored, playing, play } = useGarageVideo({ wrapRef, videoRef });

  return (
    <section className="section tone-graphite" id="experience">
      <div className="section-fade top" />
      <div className="section-fade bottom" />

      <div className="garage-compose">
        <Reveal className="garage-intro">
          <span className="eyebrow">SF Motos / Garage</span>
          <h2 className="garage-title">Por trás da<br /><span className="accent">performance</span></h2>
          <p className="garage-sub">
            Motos, ferramentas e gente de verdade — o dia a dia da SF Motos, direto do chão de oficina.
          </p>
        </Reveal>

        <Reveal delayMs={120} className={`garage-video${playing ? " is-playing" : ""}${errored ? " video-error" : ""}`}>
          <div ref={wrapRef} style={{ position: "relative", width: "100%", height: "100%" }}>
            <div className="garage-video-media">
              <video ref={videoRef} muted playsInline preload="metadata" aria-label="Vídeo mostrando o dia a dia da oficina SF Motos" />
            </div>
            <div className="garage-video-scrim" />
            <div className="garage-video-label">
              <span>SF Motos / Garage</span>
              <b>Oficina em movimento</b>
            </div>
            <span className={`garage-video-duration${duration ? " is-ready" : ""}`}>{duration}</span>
            <button className="garage-video-btn cursor-hover-target" type="button" aria-label="Reproduzir vídeo da oficina" onClick={play}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            </button>
            <span className="garage-video-cta">Assista ao vídeo</span>
            <div className="garage-video-error-msg">
              Vídeo indisponível no momento.<br />Fale com a gente pelo WhatsApp para conhecer a oficina.
            </div>
          </div>
        </Reveal>

        <div className="garage-grid">
          {galleryPhotos.map((photo, i) => (
            <Reveal as="figure" key={photo.src} delayMs={80 + i * 60} className={`garage-photo cursor-hover-target${photo.size === "hero" ? " g-hero" : ""}`}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1000px) 50vw, 25vw" style={{ objectFit: "cover" }} />
              <span className="garage-photo-tag">{photo.tag}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
