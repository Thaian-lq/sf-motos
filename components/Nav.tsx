"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const LINKS = [
  { href: "#about", label: "Oficina" },
  { href: "#process", label: "Processos" },
  { href: "#services", label: "Serviços" },
  { href: "#trabalhos", label: "Trabalhos" },
  { href: "#location", label: "Localização" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("nav-open", open);
  }, [open]);

  return (
    <nav id="siteNav" className={scrolled ? "is-scrolled" : undefined}>
      <a href="#hero" className="logo-mark cursor-hover-target" aria-label="SF Motos — início">
        <Image src="/imgs/logo-sf.png" alt="" className="logo-mark-img" width={38} height={38} />
        SF<span>·</span>MOTOS
      </a>
      <button
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="navPanel"
        aria-label="Abrir menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>
      <div className="nav-links" id="navPanel">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className="cursor-hover-target" onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
        <a href="#contact" className="nav-cta cursor-hover-target" onClick={() => setOpen(false)}>
          Agendar revisão
        </a>
      </div>
    </nav>
  );
}
