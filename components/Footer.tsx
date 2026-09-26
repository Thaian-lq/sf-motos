import Image from "next/image";
import { FooterYear } from "@/components/FooterYear";

export function Footer() {
  return (
    <footer>
      <div>
        <div className="logo-mark">
          <Image src="/imgs/logo-sf.png" alt="" className="logo-mark-img" width={38} height={38} />
          SF<span style={{ color: "var(--red)" }}>·</span>MOTOS
        </div>
        <div>Resende, RJ</div>
      </div>
      <div className="foot-links">
        <a href="#about" className="cursor-hover-target">Oficina</a>
        <a href="#services" className="cursor-hover-target">Serviços</a>
        <a href="#location" className="cursor-hover-target">Localização</a>
      </div>
      <div>Seg — Sáb · 08h às 18h</div>
      <div>
        &copy; <FooterYear /> SF Motos Alta Performance
      </div>
    </footer>
  );
}
