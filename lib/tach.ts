import { clamp } from "@/lib/math";

/** Fundo de escala do conta-giros (rpm). */
export const TACH_MAX_RPM = 12000;
/** Abertura total do mostrador, em graus, centrada no topo. */
export const TACH_SWEEP = 250;
/** Início da faixa vermelha. */
export const TACH_REDLINE_RPM = 10000;

/** Converte rpm no ângulo do ponteiro (0° = topo; negativo = esquerda). */
export function rpmToAngle(rpm: number): number {
  const t = clamp(rpm, 0, TACH_MAX_RPM) / TACH_MAX_RPM;
  return -TACH_SWEEP / 2 + t * TACH_SWEEP;
}

/** Ponto (x, y) sobre um círculo de raio r, no ângulo do mostrador. */
export function dialPoint(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}
