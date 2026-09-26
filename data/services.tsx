import { ReactNode } from "react";

export interface Service {
  num: string;
  title: string;
  description: string;
  icon: ReactNode;
  featured?: boolean;
  wide?: boolean;
  seal?: { image: string; alt: string; title: string; subtitle: string };
}

export const services: Service[] = [
  {
    num: "02",
    title: "Motor & performance",
    description: "Retífica, upgrade de potência e tuning.",
    featured: true,
    seal: {
      image: "/imgs/selo-texa.png",
      alt: "Selo TEXA — scanner de diagnóstico",
      title: "Scanner TEXA de alta eficiência",
      subtitle: "Único em Resende com essa tecnologia",
    },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <circle cx="12" cy="12" r="3.4" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      </svg>
    ),
  },
  {
    num: "01",
    title: "Revisão geral",
    description: "Check-up completo de motor, freios e suspensão.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M4 12h16M4 12a2 2 0 100-4 2 2 0 000 4zM4 12a2 2 0 110 4 2 2 0 010-4zM20 12a2 2 0 100-4 2 2 0 000 4zM20 12a2 2 0 110 4 2 2 0 010-4z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Suspensão",
    description: "Regulagem e setup para uso urbano ou pista.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M6 20V10M6 10l6-6 6 6M6 10h12M18 10v10" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Elétrica",
    description: "Diagnóstico de injeção eletrônica e fiação.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "Customização",
    description: "Escapamento, visual e preparação sob medida.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M4 18l6-12h4l6 12M8 14h8" />
      </svg>
    ),
  },
  {
    num: "06",
    title: "Pneus & rodas",
    description: "Balanceamento, alinhamento e troca.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2.4" />
      </svg>
    ),
  },
  {
    num: "07",
    title: "Pré-viagem",
    description: "Preparação completa pra rodar longas distâncias.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M3 12h13M12 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    num: "08",
    title: "Socorro & guincho",
    description: "Atendimento de emergência na região.",
    wide: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M3 13l2-6h10l2 6M3 13h14M3 13v4h2M17 13v4h2" />
        <circle cx="7" cy="18" r="1.4" />
        <circle cx="16" cy="18" r="1.4" />
      </svg>
    ),
  },
];
