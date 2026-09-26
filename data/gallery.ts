export interface GalleryPhoto {
  src: string;
  alt: string;
  tag: string;
  size: "hero" | "normal";
}

export const galleryPhotos: GalleryPhoto[] = [
  { src: "/imgs/img1_evento.jpeg", alt: "Evento SF Motos — motos e clientes na oficina", tag: "01 / Evento", size: "hero" },
  { src: "/imgs/img2_evento.jpeg", alt: "Evento SF Motos — bastidores da oficina", tag: "02 / Evento", size: "normal" },
  { src: "/imgs/img3_evento.jpeg", alt: "Evento SF Motos — movimento na oficina", tag: "03 / Evento", size: "normal" },
  { src: "/imgs/img4_evento.jpeg", alt: "Evento SF Motos — detalhes de motos", tag: "04 / Evento", size: "normal" },
  { src: "/imgs/img5_evento.jpeg", alt: "Evento SF Motos — comunidade e motos", tag: "05 / Evento", size: "normal" },
];
