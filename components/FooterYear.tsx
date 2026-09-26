"use client";
import { useSyncExternalStore } from "react";

// O HTML é pré-renderizado no build; o ano do visitante substitui o do build na hidratação.
const BUILD_YEAR = new Date().getFullYear();
const subscribe = () => () => {};

export function FooterYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => BUILD_YEAR,
  );
  return <span>{year}</span>;
}
