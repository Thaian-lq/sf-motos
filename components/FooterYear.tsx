"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Como no original, o ano só é preenchido no navegador: o HTML pré-renderizado no build
// não carrega ano nenhum, então a hidratação bate em qualquer data.
export function FooterYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <span>{year}</span>;
}
