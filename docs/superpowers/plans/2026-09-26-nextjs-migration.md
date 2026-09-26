# Migração SF Motos para Next.js + TypeScript — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recriar o site estático atual (`index.html`) como um app Next.js 15 (App Router) + TypeScript, com o mesmo visual e comportamento, publicado na Vercel.

**Architecture:** Uma página só (`/`) que monta 13 componentes de seção em ordem. Duas peças de lógica reutilizável saem como hooks isolados e testáveis (`useScrubVideo` para os vídeos com scroll, `useBeforeAfterSlider` para o slider antes/depois). CSS portado quase literal, dividido por seção, agregado via `@import` em `app/globals.css`. Conteúdo repetitivo (serviços, galeria) vira array tipado em `data/`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript (strict), Vitest + jsdom para testes de lógica pura, CSS global (sem framework de estilo), Vercel para deploy.

**Spec:** `docs/superpowers/specs/2026-09-26-nextjs-migration-design.md`

## Global Constraints

- Migração fiel: mesma aparência, mesmo comportamento, mesmo conteúdo/copy do `index.html` atual. Nenhum texto, preço ou benefício novo é inventado.
- Sem CMS, sem painel de edição — conteúdo só via código (`data/*.ts`).
- Sem novas seções, páginas ou rotas além de `/`.
- Atualizações de scroll/vídeo/cursor (rodam a cada frame) mutam o DOM direto via `ref.current.style`, nunca via `setState` — replicar exatamente a técnica do arquivo atual, para não introduzir jank.
- CSS global só pode ser importado a partir de `app/layout.tsx` (restrição do Next.js App Router); todo CSS de seção é agregado via `@import` dentro de `app/globals.css`.
- `prefers-reduced-motion: reduce` desativa reveals, tilt, crossfade e o cursor customizado, exatamente como hoje.
- Assets (`imgs/`, `video/`) mantêm os mesmos nomes de arquivo e vão para `public/imgs/`, `public/video/`.

---

### Task 1: Scaffold do projeto Next.js + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `.eslintrc.json`, `.gitignore` (via `create-next-app`)
- Create: `app/layout.tsx` (stub), `app/page.tsx` (stub)
- Move: `imgs/*` → `public/imgs/*`, `video/*` → `public/video/*`
- Delete: `index.html` (raiz) — continua no histórico do Git
- Modify: `.gitignore` (adicionar `node_modules`, `.next`, `.vercel` se o `create-next-app` não cobrir)

**Interfaces:**
- Produces: convenção de import alias `@/*` apontando para a raiz do projeto (usada por todos os componentes/hooks/data criados nas tasks seguintes).

- [ ] **Step 1: Rodar o scaffold oficial do Next.js**

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir=false --import-alias "@/*" --tailwind=false --use-npm
```

Quando perguntar se quer sobrescrever a pasta não-vazia, confirmar (o repo já tem `.git`, `imgs/`, `video/`, `docs/`, isso é esperado).

- [ ] **Step 2: Mover os assets para `public/`**

```bash
mkdir -p public/imgs public/video
git mv imgs/*.jpeg imgs/*.jpg imgs/*.png public/imgs/ 2>/dev/null || mv imgs/* public/imgs/
git mv "video/amostração.mp4" video/moto.mp4 video/motor.mp4 public/video/ 2>/dev/null || mv video/* public/video/
rmdir imgs video 2>/dev/null || true
```

- [ ] **Step 3: Remover o `index.html` estático da raiz**

```bash
git rm index.html
```

- [ ] **Step 4: Verificar que o projeto builda vazio**

Run: `npm run build`
Expected: build conclui sem erros (página padrão do Next.js).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + TypeScript project, move assets to public/"
```

---

### Task 2: Tokens de design e CSS base (`app/globals.css`)

**Files:**
- Create: `styles/tokens.css`
- Create: `styles/base.css`
- Create: `styles/reduced-motion.css`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: todas as CSS custom properties (`--black`, `--red`, `--white`, etc.) e classes utilitárias (`.eyebrow`, `.btn-primary`, `.btn-ghost`, `.btn-dark`, `.section`, `.section-fade`, `.tone-graphite`, `.tech-corner`, `[data-reveal]`) que todo componente das próximas tasks usa.

- [ ] **Step 1: Criar `styles/tokens.css`** com os tokens exatos do site atual:

```css
:root{
  --black:#0D0D0D; --graphite:#1A1A1A; --graphite-2:#232323;
  --red:#C41E1E; --red-dark:#8A1414; --white:#F5F5F0; --gray:#8C8C8C;
  --line: rgba(245,245,240,0.08);
  --line-strong: rgba(245,245,240,0.16);
  --ease: cubic-bezier(.16,.84,.44,1);
}
```

- [ ] **Step 2: Criar `styles/base.css`** com reset, tipografia e utilitários compartilhados:

```css
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{background:var(--black);color:var(--white);font-family:'Inter',sans-serif;overflow-x:hidden;}
html.has-cursor, html.has-cursor body{cursor:none;}
::selection{background:var(--red);color:var(--white);}
a{color:inherit;text-decoration:none;}
img{max-width:100%;display:block;}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;color:var(--red);}
h1,h2,h3{font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:.01em;line-height:1.02;}
.section{padding:150px 6vw;position:relative;scroll-margin-top:84px;}
.section-fade{position:absolute;left:0;right:0;height:220px;pointer-events:none;z-index:1;}
.section-fade.top{top:0;transform:translateY(-100%);}
.section-fade.bottom{bottom:0;transform:translateY(100%);}
.tone-graphite{background:var(--graphite);}
.tone-graphite .section-fade.top{background:linear-gradient(to bottom, var(--black), var(--graphite));}
.tone-graphite .section-fade.bottom{background:linear-gradient(to bottom, var(--graphite), var(--black));}
.section-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:64px;flex-wrap:wrap;gap:20px;position:relative;z-index:2;}
.section-head h2{font-size:clamp(2.2rem,4.4vw,3.4rem);}
.btn-primary{position:relative;background:var(--red);color:var(--white);padding:16px 34px;font-family:'Oswald',sans-serif;font-weight:600;
  letter-spacing:.06em;font-size:.92rem;text-transform:uppercase;overflow:hidden;transition:transform .3s var(--ease);display:inline-block;}
.btn-primary:hover{transform:translateY(-2px);}
.btn-primary:focus-visible,.btn-ghost:focus-visible,.btn-dark:focus-visible,.garage-video-btn:focus-visible{outline:2px solid var(--white);outline-offset:3px;}
.btn-primary::after{content:"";position:absolute;inset:0;background:var(--red-dark);transform:scaleX(0);transform-origin:left;transition:transform .35s var(--ease);z-index:-1;}
.btn-primary:hover::after{transform:scaleX(1);}
.btn-ghost{font-family:'JetBrains Mono',monospace;font-size:.82rem;letter-spacing:.04em;color:var(--white);border-bottom:1px solid var(--line);padding-bottom:4px;transition:border-color .25s;}
.btn-ghost:hover{border-color:var(--red);}
.btn-dark{background:var(--black);color:var(--white);padding:18px 40px;font-family:'Oswald',sans-serif;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;font-size:.92rem;display:inline-block;transition:transform .25s var(--ease), background .25s;}
.btn-dark:hover{transform:translateY(-2px);background:var(--graphite);}
[data-reveal]{opacity:0;transform:translateY(38px);transition:opacity .8s var(--ease), transform .8s var(--ease);transition-delay:var(--d,0ms);}
[data-reveal].in-view{opacity:1;transform:none;}
.tech-corner{position:absolute;width:16px;height:16px;pointer-events:none;opacity:.35;z-index:2;}
.tech-corner.tl{top:22px;left:22px;border-top:1px solid var(--gray);border-left:1px solid var(--gray);}
.tech-corner.tr{top:22px;right:22px;border-top:1px solid var(--gray);border-right:1px solid var(--gray);}
.tech-corner.bl{bottom:22px;left:22px;border-bottom:1px solid var(--gray);border-left:1px solid var(--gray);}
.tech-corner.br{bottom:22px;right:22px;border-bottom:1px solid var(--gray);border-right:1px solid var(--gray);}
```

- [ ] **Step 3: Criar `styles/reduced-motion.css`**

```css
@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto;}
  .scrub-scroll{height:100svh;}
  .scrub{position:relative;}
  .cue-line::after,.cue-fill{transition:none;}
  [data-reveal]{opacity:1 !important;transform:none !important;transition:none !important;}
  .ba-handle-icon{animation:none !important;}
  .cursor-dot,.cursor-ring{display:none !important;}
  .phase-block{transition:none !important;}
  .process-step,.service-card,.work-card{transition:none !important;}
}
```

- [ ] **Step 4: Montar `app/globals.css`** que agrega tudo (as próximas tasks vão adicionar suas próprias linhas de `@import` aqui, na mesma ordem em que apareciam no `<style>` original):

```css
@import "../styles/tokens.css";
@import "../styles/base.css";
@import "../styles/reduced-motion.css";
```

- [ ] **Step 5: Importar em `app/layout.tsx`**

```tsx
import "./globals.css";
```

- [ ] **Step 6: Verificar build**

Run: `npm run build`
Expected: build conclui sem erros de CSS.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css styles/ app/layout.tsx
git commit -m "feat: port design tokens and base CSS to Next.js"
```

---

### Task 3: Utilitários matemáticos puros + Vitest

**Files:**
- Create: `lib/math.ts`
- Create: `lib/math.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (script `test`)

**Interfaces:**
- Produces: `clamp(value: number, min: number, max: number): number`, `smoothstep(a: number, b: number, x: number): number` — usados por `useScrubVideo` (Task 8), `useBeforeAfterSlider` (Task 14) e `SFCard` (Task 16).

- [ ] **Step 1: Instalar Vitest**

```bash
npm install -D vitest jsdom @vitejs/plugin-react
```

- [ ] **Step 2: Criar `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
});
```

- [ ] **Step 3: Adicionar script em `package.json`**

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

- [ ] **Step 4: Escrever o teste que falha (`lib/math.test.ts`)**

```ts
import { describe, expect, it } from "vitest";
import { clamp, smoothstep } from "./math";

describe("clamp", () => {
  it("returns the value when inside range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps below the minimum", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });
  it("clamps above the maximum", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("smoothstep", () => {
  it("returns 0 at or before the start edge", () => {
    expect(smoothstep(0, 1, 0)).toBe(0);
    expect(smoothstep(0, 1, -1)).toBe(0);
  });
  it("returns 1 at or after the end edge", () => {
    expect(smoothstep(0, 1, 1)).toBe(1);
    expect(smoothstep(0, 1, 2)).toBe(1);
  });
  it("eases through the midpoint", () => {
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 5);
  });
});
```

- [ ] **Step 5: Rodar e confirmar que falha**

Run: `npm test`
Expected: FAIL — `lib/math.ts` não existe.

- [ ] **Step 6: Implementar `lib/math.ts`**

```ts
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function smoothstep(a: number, b: number, x: number): number {
  const t = clamp((x - a) / (b - a || 1), 0, 1);
  return t * t * (3 - 2 * t);
}
```

- [ ] **Step 7: Rodar e confirmar que passa**

Run: `npm test`
Expected: PASS (6 testes).

- [ ] **Step 8: Commit**

```bash
git add lib/ vitest.config.ts package.json package-lock.json
git commit -m "feat: add clamp/smoothstep utilities with tests"
```

---

### Task 4: `useReducedMotion` e `usePointerFine`

**Files:**
- Create: `hooks/useReducedMotion.ts`
- Create: `hooks/useReducedMotion.test.ts`
- Create: `hooks/usePointerFine.ts`
- Create: `hooks/usePointerFine.test.ts`

**Interfaces:**
- Consumes: nada (hooks de base).
- Produces: `useReducedMotion(): boolean`, `usePointerFine(): boolean` — usados por `CustomCursor` (Task 6), `useScrubVideo` (Task 8), `SFCard` (Task 16).

- [ ] **Step 1: Escrever o teste que falha (`hooks/useReducedMotion.test.ts`)**

```ts
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useReducedMotion } from "./useReducedMotion";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("useReducedMotion", () => {
  it("returns false when the user has no motion preference", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when prefers-reduced-motion matches", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Instalar Testing Library e rodar (esperando falhar)**

```bash
npm install -D @testing-library/react
npm test
```

Expected: FAIL — `useReducedMotion` não existe.

- [ ] **Step 3: Implementar `hooks/useReducedMotion.ts`**

```ts
"use client";
import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Repetir o mesmo ciclo para `usePointerFine`**

Teste (`hooks/usePointerFine.test.ts`), mesmo padrão de mock trocando a query para `"(pointer: fine)"`:

```ts
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePointerFine } from "./usePointerFine";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("usePointerFine", () => {
  it("returns true for a fine pointer (mouse)", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePointerFine());
    expect(result.current).toBe(true);
  });

  it("returns false for a coarse pointer (touch)", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePointerFine());
    expect(result.current).toBe(false);
  });
});
```

Implementação (`hooks/usePointerFine.ts`):

```ts
"use client";
import { useEffect, useState } from "react";

export function usePointerFine(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);

  return fine;
}
```

- [ ] **Step 6: Rodar toda a suíte**

Run: `npm test`
Expected: PASS (todos os testes).

- [ ] **Step 7: Commit**

```bash
git add hooks/
git commit -m "feat: add useReducedMotion and usePointerFine hooks"
```

---

### Task 5: `useReveal` + componente `Reveal`

**Files:**
- Create: `hooks/useReveal.ts`
- Create: `components/Reveal.tsx`
- Create: `styles/reveal.css` (vazio — a classe `[data-reveal]` já está em `styles/base.css`; este arquivo fica reservado caso a Task precise de overrides, senão pode ser descartado no self-review)

**Interfaces:**
- Consumes: nada.
- Produces: `<Reveal delayMs?: number>{children}</Reveal>` — substitui o atributo `data-reveal` usado em quase toda seção (Processes, Services, GarageExperience, BeforeAfterGallery, SFCard).

- [ ] **Step 1: Implementar `hooks/useReveal.ts`**

```ts
"use client";
import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      el.classList.add("in-view");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
```

- [ ] **Step 2: Implementar `components/Reveal.tsx`**

```tsx
"use client";
import { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface RevealProps {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}

export function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();
  const style = { "--d": `${delayMs}ms` } as CSSProperties;

  return (
    <div ref={ref} data-reveal className={className} style={style}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verificar manualmente**

Run: `npm run dev`, adicionar temporariamente `<Reveal>teste</Reveal>` em `app/page.tsx`, rolar a página e confirmar no DevTools que a classe `in-view` é adicionada quando o elemento entra na viewport. Remover o teste temporário antes do commit.

- [ ] **Step 4: Commit**

```bash
git add hooks/useReveal.ts components/Reveal.tsx
git commit -m "feat: add useReveal hook and Reveal wrapper component"
```

---

### Task 6: `CustomCursor`

**Files:**
- Create: `components/CustomCursor.tsx`
- Create: `styles/cursor.css`
- Modify: `app/globals.css` (adicionar `@import "../styles/cursor.css";`)

**Interfaces:**
- Consumes: `usePointerFine` (Task 4), `useReducedMotion` (Task 4).
- Produces: componente `<CustomCursor />` renderizado uma vez em `app/layout.tsx` (Task 18). Convenção: qualquer elemento interativo que deve acionar o hover do cursor recebe a classe `cursor-hover-target` (em vez da lista fixa de seletores do arquivo original — decouple do CustomCursor precisar conhecer cada componente).

- [ ] **Step 1: Criar `styles/cursor.css`** (triângulo, não mais círculo — já é o estado atual do site):

```css
.cursor-dot,.cursor-ring{position:fixed;top:0;left:0;pointer-events:none;z-index:9999;
  transform:translate3d(-50%,-50%,0);will-change:transform;}
.cursor-dot{width:10px;height:9px;background:var(--red);clip-path:polygon(50% 0,100% 100%,0 100%);opacity:0;transition:opacity .2s;}
.cursor-ring{width:38px;height:38px;background:rgba(245,245,240,.55);opacity:0;
  -webkit-mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,6 94,90 6,90' fill='none' stroke='white' stroke-width='3' stroke-linejoin='round'/></svg>") center/100% 100% no-repeat;
  mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,6 94,90 6,90' fill='none' stroke='white' stroke-width='3' stroke-linejoin='round'/></svg>") center/100% 100% no-repeat;
  transition:opacity .2s, width .25s var(--ease), height .25s var(--ease), background-color .25s;}
html.has-cursor .cursor-dot,html.has-cursor .cursor-ring{opacity:1;}
html.has-cursor .cursor-ring.cursor-hover{width:64px;height:64px;background:var(--red);}
html.has-cursor .cursor-ring.cursor-drag{width:88px;height:88px;background:var(--red);}
```

- [ ] **Step 2: Implementar `components/CustomCursor.tsx`**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { usePointerFine } from "@/hooks/usePointerFine";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const hasFinePointer = usePointerFine();
  const prefersReduced = useReducedMotion();
  const enabled = hasFinePointer && !prefersReduced;

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf = 0;

    function onPointerMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      dot!.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    }

    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring!.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(ringLoop);
    }

    function onPointerOver(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (target.closest?.("[data-drag-target]")) return;
      if (target.closest?.(".cursor-hover-target")) ring!.classList.add("cursor-hover");
    }
    function onPointerOut(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (target.closest?.(".cursor-hover-target")) ring!.classList.remove("cursor-hover");
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    raf = requestAnimationFrame(ringLoop);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
```

Nota: elementos que precisam do estado `cursor-drag` (o handle do slider antes/depois, Task 14) usam `data-drag-target` e alternam a classe `cursor-drag` no próprio `pointerenter`/`pointerleave`, dentro do componente do slider — não centralizado aqui, para manter o `CustomCursor` desacoplado.

- [ ] **Step 3: Verificar manualmente**

Run: `npm run dev`. Mover o mouse: o triângulo deve seguir o cursor com atraso suave (o anel) e um triângulo sólido colado ao ponteiro (o dot). Testar em uma página com `prefers-reduced-motion: reduce` ativado no DevTools — o cursor customizado deve sumir e o cursor do sistema voltar.

- [ ] **Step 4: Commit**

```bash
git add components/CustomCursor.tsx styles/cursor.css app/globals.css
git commit -m "feat: port custom triangle cursor"
```

---

### Task 7: `Nav`

**Files:**
- Create: `components/Nav.tsx`
- Create: `styles/nav.css`
- Modify: `app/globals.css` (adicionar `@import "../styles/nav.css";`)

**Interfaces:**
- Consumes: nenhum hook das tasks anteriores.
- Produces: `<Nav />`, usado em `app/page.tsx` (Task 18). Aplica `cursor-hover-target` nos links, conforme convenção da Task 6.

- [ ] **Step 1: Criar `styles/nav.css`** com o conteúdo exato abaixo (o `index.html` original que continha esse CSS já foi removido do working tree na Task 1 — este é o conteúdo literal a copiar, não uma paráfrase):

```css
nav{position:fixed;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;
  padding:22px 6vw;z-index:100;transition:background .4s var(--ease), padding .4s var(--ease), border-color .4s var(--ease), backdrop-filter .4s;
  border-bottom:1px solid transparent;}
nav.is-scrolled{background:rgba(13,13,13,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  padding:14px 6vw;border-bottom-color:var(--line);}
.logo-mark{display:flex;align-items:center;gap:10px;font-family:'Oswald',sans-serif;font-weight:600;font-size:1.15rem;letter-spacing:.06em;position:relative;z-index:2;}
.logo-mark span{color:var(--red);}
.logo-mark-img{width:38px;height:38px;object-fit:contain;display:block;flex-shrink:0;}
.nav-links{display:flex;align-items:center;gap:34px;font-size:.82rem;letter-spacing:.05em;text-transform:uppercase;}
.nav-links a:not(.nav-cta){opacity:.75;transition:opacity .25s;position:relative;}
.nav-links a:not(.nav-cta):hover{opacity:1;}
.nav-links a:not(.nav-cta)::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:1px;background:var(--red);
  transform:scaleX(0);transform-origin:left;transition:transform .3s var(--ease);}
.nav-links a:not(.nav-cta):hover::after{transform:scaleX(1);}
.nav-cta{font-family:'Oswald',sans-serif;font-weight:600;background:var(--red);color:var(--white);padding:10px 20px;letter-spacing:.06em;transition:background .25s;}
.nav-cta:hover{background:var(--red-dark);}
.nav-toggle{display:none;flex-direction:column;justify-content:center;gap:5px;width:32px;height:32px;background:none;border:0;cursor:pointer;z-index:110;}
.nav-toggle span{display:block;width:100%;height:1px;background:var(--white);transition:transform .3s var(--ease), opacity .3s var(--ease);}
html.nav-open .nav-toggle span:nth-child(1){transform:translateY(6px) rotate(45deg);}
html.nav-open .nav-toggle span:nth-child(2){opacity:0;}
html.nav-open .nav-toggle span:nth-child(3){transform:translateY(-6px) rotate(-45deg);}

@media(max-width:840px){
  .nav-toggle{display:flex;}
  .nav-links{position:fixed;inset:0;flex-direction:column;justify-content:center;align-items:flex-start;
    padding:0 8vw;background:rgba(13,13,13,.98);backdrop-filter:blur(14px);gap:26px;
    transform:translateX(100%);transition:transform .45s var(--ease);font-size:1.3rem;}
  html.nav-open .nav-links{transform:translateX(0);}
  .nav-links a{opacity:1 !important;}
  .nav-cta{margin-top:12px;}
}
```

Nota: `.logo-mark` é definido aqui e reaproveitado pelo `Footer` (Task 17), que adiciona só um pequeno override `footer .logo-mark{...}` por cima — é assim que funcionava no CSS original (uma única folha de estilo), e continua funcionando aqui porque `app/globals.css` agrega todos os `styles/*.css` como CSS global.

- [ ] **Step 2: Implementar `components/Nav.tsx`**

```tsx
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
    <nav className={scrolled ? "is-scrolled" : undefined}>
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
```

- [ ] **Step 3: Verificar manualmente**

Run: `npm run dev`. Rolar a página: o nav deve ganhar fundo/blur após 40px. Em viewport mobile (DevTools), abrir/fechar o menu com o botão hamburguer, clicar num link e confirmar que o menu fecha.

- [ ] **Step 4: Commit**

```bash
git add components/Nav.tsx styles/nav.css app/globals.css
git commit -m "feat: port site navigation"
```

---

### Task 8: `useScrubVideo` — motor do vídeo com scroll

**Files:**
- Create: `hooks/useScrubVideo.ts`
- Create: `components/ScrubVideo.tsx`
- Create: `styles/scrub.css`
- Modify: `app/globals.css` (adicionar `@import "../styles/scrub.css";`)

**Interfaces:**
- Consumes: `clamp`, `smoothstep` (Task 3), `useReducedMotion` (Task 4).
- Produces:

```ts
export interface ScrubPhase {
  id: string;
  content: React.ReactNode;
  align?: "left" | "right";
}

export interface ScrubCueConfig {
  label?: string;
  end: number;
  fadeStart: number;
  fadeEnd: number;
  align?: "right";
}

export interface ScrubVideoProps {
  scrollId: string;
  src: string;
  frameCount: number;
  heightVh: number;
  short?: boolean;
  phases: [ScrubPhase, ScrubPhase];
  fadeStart: number;
  fadeEnd: number;
  cue?: ScrubCueConfig;
  endFade?: { start: number; end: number };
  reducedFrame?: number;
  scrimDirection?: "left" | "right";
}
```

`<ScrubVideo>` é consumido por `Hero` (Task 9) e `PrecisionVideo` (Task 10), passando `phases` com o conteúdo específico de cada seção.

- [ ] **Step 1: Criar `styles/scrub.css`** com o conteúdo exato abaixo (o `index.html` original já foi removido do working tree na Task 1 — este é o conteúdo literal a copiar). Note a regra genérica `.accent{color:var(--red);}` perto do fim: no site original essa cor era aplicada listando manualmente cada seletor consumidor (`h1.title .accent, .scrub-content h2 .accent, .garage-title .accent, .cartao-title .accent`) — aqui ela vira uma única regra genérica por `className="accent"`, o que os componentes das Tasks 9, 11, 13 e 16 já usam. É uma simplificação legítima (remove uma fragilidade de manutenção), não uma mudança visual:

```css
.scrub-scroll{position:relative;height:220vh;}
.scrub-scroll.short{height:280vh;}
.scrub{position:sticky;top:0;height:100svh;display:flex;flex-direction:column;justify-content:center;padding:0 6vw;overflow:hidden;background:var(--black);}

.scrub-video-wrap{position:absolute;inset:0;z-index:0;background:linear-gradient(150deg,var(--graphite) 0%,var(--black) 70%);}
.scrub-video-wrap video,.scrub-video-wrap canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.scrub-video-wrap canvas{opacity:0;transition:opacity .6s ease;}
.scrub-video-wrap canvas.is-ready{opacity:1;}
.scrub-video-wrap video{opacity:0;pointer-events:none;}
.scrub-video-wrap.fallback-mode canvas{display:none;}
.scrub-video-wrap.fallback-mode video{transition:opacity .6s ease;}
.scrub-video-wrap.fallback-mode video.is-ready{opacity:1;}
.scrub-video-wrap.video-error video,.scrub-video-wrap.video-error canvas{display:none;}

.phase-anchor{position:absolute;top:44%;left:0;width:1px;height:1px;}

.hero-text-layer{position:relative;z-index:3;height:100%;display:flex;align-items:center;}
.hero-text-layer .scrub-content{position:absolute;left:0;max-width:920px;}
.phase-block{will-change:opacity,transform,filter;pointer-events:none;}
.phase-block.is-active{pointer-events:auto;}

.scrub-scrim{position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(to right, rgba(13,13,13,.94) 0%, rgba(13,13,13,.72) 32%, rgba(13,13,13,.28) 58%, transparent 78%);}
.scrub-scrim.from-right{background:linear-gradient(to left, rgba(13,13,13,.94) 0%, rgba(13,13,13,.72) 32%, rgba(13,13,13,.28) 58%, transparent 78%);}
.scrub-vignette{position:absolute;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(ellipse 80% 70% at 60% 50%, transparent 45%, rgba(13,13,13,.85) 100%);}
.scrub-grain{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  background-size:180px 180px;}
.scrub-endfade{position:absolute;inset:0;z-index:2;pointer-events:none;background:var(--black);opacity:0;}

.scrub-content{position:relative;z-index:3;max-width:920px;}
.scrub-content.align-right{margin-left:auto;text-align:right;}
.scrub-content .eyebrow{margin-bottom:22px;display:flex;align-items:center;gap:10px;}
.scrub-content.align-right .eyebrow{justify-content:flex-end;}
.scrub-content .eyebrow::before{content:"";width:26px;height:1px;background:var(--red);display:inline-block;}
.scrub-content.align-right .eyebrow::after{content:"";width:26px;height:1px;background:var(--red);display:inline-block;}
.scrub-content.align-right .eyebrow::before{display:none;}

h1.title,.scrub-content h2{font-size:clamp(3rem,8vw,6.4rem);font-weight:700;margin-bottom:6px;}
.accent{color:var(--red);}
.hero-tagline{font-family:'JetBrains Mono',monospace;font-size:.82rem;letter-spacing:.22em;text-transform:uppercase;color:var(--gray);
  margin:20px 0 38px;}
.scrub-sub{font-family:'Inter',sans-serif;font-weight:300;font-size:clamp(1rem,1.6vw,1.25rem);color:var(--gray);
  max-width:520px;margin:22px 0 40px;line-height:1.55;}
.scrub-content.align-right .scrub-sub{margin-left:auto;}
.stat-row{display:flex;gap:48px;margin-top:36px;}
.stat b{font-family:'Oswald',sans-serif;font-size:2.4rem;color:var(--red);display:block;}
.stat span{font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.1em;color:var(--gray);text-transform:uppercase;}

.scrub-actions{display:flex;align-items:center;gap:28px;flex-wrap:wrap;}
.scrub-content.align-right .scrub-actions{justify-content:flex-end;}

.reveal-word{font-size:clamp(3.4rem,10vw,8rem);font-weight:700;}
.reveal-hint{font-family:'JetBrains Mono',monospace;font-size:.78rem;letter-spacing:.15em;color:var(--gray);margin-top:26px;display:inline-block;}
.reveal-hint:hover{color:var(--white);}

.scroll-cue{position:absolute;bottom:38px;left:6vw;display:flex;align-items:center;gap:14px;z-index:3;
  font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gray);
  transition:opacity .4s ease;}
.scroll-cue.right{left:auto;right:6vw;flex-direction:row-reverse;}
.cue-line{width:1px;height:44px;background:rgba(245,245,240,.18);position:relative;overflow:hidden;}
.cue-fill{position:absolute;left:0;top:0;width:100%;height:100%;background:var(--red);transform:scaleY(0);transform-origin:top;}
```

- [ ] **Step 2: Implementar `hooks/useScrubVideo.ts`** — porta a função `createVideoScrub` do arquivo original quase 1:1, adaptada para refs em vez de `getElementById`:

```ts
"use client";
import { RefObject, useEffect, useRef } from "react";
import { clamp, smoothstep } from "@/lib/math";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ScrubVideoProps } from "@/components/ScrubVideo";

interface ScrubVideoRefs {
  wrapperRef: RefObject<HTMLDivElement>;
  videoWrapRef: RefObject<HTMLDivElement>;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  phaseRefs: [RefObject<HTMLDivElement>, RefObject<HTMLDivElement>];
  cueRef: RefObject<HTMLDivElement>;
  cueFillRef: RefObject<HTMLDivElement>;
  endFadeRef: RefObject<HTMLDivElement>;
}

export function useScrubVideo(cfg: ScrubVideoProps, refs: ScrubVideoRefs) {
  const prefersReduced = useReducedMotion();
  const lastProgressRef = useRef(0);

  useEffect(() => {
    const wrapper = refs.wrapperRef.current;
    const videoWrap = refs.videoWrapRef.current;
    const video = refs.videoRef.current;
    const canvas = refs.canvasRef.current;
    if (!wrapper || !videoWrap || !video || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let duration = 0;
    let sourceReady = false;
    let inView = true;
    let mode: "frames" | "seek" | null = null;
    let frames: ImageBitmap[] | null = null;
    let currentFrameIndex = -1;
    let targetTime = 0;

    function progress() {
      const rect = wrapper!.getBoundingClientRect();
      const total = wrapper!.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      return clamp(-rect.top / total, 0, 1);
    }

    function crossfade(elA: HTMLElement, elB: HTMLElement, t: number) {
      const te = smoothstep(0, 1, t);
      const opA = 1 - te;
      const opB = te;
      elA.style.opacity = String(opA);
      elA.style.transform = `translateY(${-te * 26}px) scale(${1 + te * 0.03})`;
      elA.style.filter = `blur(${te * 10}px)`;
      elA.classList.toggle("is-active", opA > 0.05);
      elB.style.opacity = String(opB);
      elB.style.transform = `translateY(${(1 - te) * 30}px) scale(${1 - (1 - te) * 0.02})`;
      elB.style.filter = `blur(${(1 - te) * 10}px)`;
      elB.style.clipPath = `inset(0 0 ${(1 - te) * 22}% 0)`;
      elB.classList.toggle("is-active", opB > 0.05);
    }

    function applyChrome(p: number) {
      const [phaseA, phaseB] = refs.phaseRefs;
      if (phaseA.current && phaseB.current) {
        const t = clamp((p - cfg.fadeStart) / (cfg.fadeEnd - cfg.fadeStart), 0, 1);
        crossfade(phaseA.current, phaseB.current, t);
      }
      if (cfg.cue && refs.cueFillRef.current) {
        refs.cueFillRef.current.style.transform = `scaleY(${clamp(p / (cfg.cue.end || 0.92), 0, 1)})`;
      }
      if (cfg.cue && refs.cueRef.current) {
        refs.cueRef.current.style.opacity = String(
          1 - smoothstep(cfg.cue.fadeStart, cfg.cue.fadeEnd, p)
        );
      }
      if (cfg.endFade && refs.endFadeRef.current) {
        refs.endFadeRef.current.style.opacity = String(
          smoothstep(cfg.endFade.start, cfg.endFade.end, p)
        );
      }
    }

    function drawBitmap(bmp: ImageBitmap | undefined) {
      if (!bmp) return;
      const W = canvas!.clientWidth, H = canvas!.clientHeight;
      if (!W || !H) return;
      const scale = Math.max(W / bmp.width, H / bmp.height);
      const dw = bmp.width * scale, dh = bmp.height * scale;
      ctx!.drawImage(bmp, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas!.clientWidth, h = canvas!.clientHeight;
      if (!w || !h) return;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (frames && currentFrameIndex >= 0) drawBitmap(frames[currentFrameIndex]);
    }

    function renderFrameForProgress(p: number) {
      if (!frames || !frames.length) return;
      const idx = clamp(Math.round(p * (frames.length - 1)), 0, frames.length - 1);
      if (idx !== currentFrameIndex) {
        currentFrameIndex = idx;
        drawBitmap(frames[idx]);
      }
    }

    const hasFrameCallback = typeof video!.requestVideoFrameCallback === "function";

    function primeFramesByPlayback(): Promise<ImageBitmap[]> {
      return new Promise((resolve, reject) => {
        if (!hasFrameCallback || typeof createImageBitmap !== "function" || prefersReduced) {
          reject(new Error("playback priming unsupported"));
          return;
        }
        const w = video!.videoWidth, h = video!.videoHeight;
        if (!w || !h) { reject(new Error("no dimensions")); return; }
        const offscreen = document.createElement("canvas");
        offscreen.width = w; offscreen.height = h;
        const octx = offscreen.getContext("2d", { alpha: false })!;
        const out: ImageBitmap[] = [];
        let finished = false;
        const maxFrames = (cfg.frameCount || 80) * 3;
        const timer = setTimeout(finish, 9000);

        function capture() {
          if (finished) return;
          try { octx.drawImage(video!, 0, 0, w, h); } catch { finish(); return; }
          createImageBitmap(offscreen).then((bmp) => {
            if (finished) return;
            out.push(bmp);
            if (video!.ended || out.length >= maxFrames) { finish(); return; }
            video!.requestVideoFrameCallback(capture);
          }, finish);
        }
        function finish() {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          video!.pause();
          video!.playbackRate = 1;
          video!.removeEventListener("ended", finish);
          if (out.length < 2) { reject(new Error("too few frames captured")); return; }
          resolve(out);
        }

        video!.addEventListener("ended", finish);
        try { video!.currentTime = 0; } catch { /* ignore */ }
        video!.playbackRate = 4;
        video!.requestVideoFrameCallback(capture);
        video!.play()?.catch(finish);
      });
    }

    function seekTo(t: number): Promise<void> {
      return new Promise((resolve) => {
        let settled = false;
        function done() {
          if (settled) return;
          settled = true;
          video!.removeEventListener("seeked", onSeeked);
          clearTimeout(fallback);
          resolve();
        }
        function onSeeked() {
          if (hasFrameCallback) video!.requestVideoFrameCallback(done);
          requestAnimationFrame(() => requestAnimationFrame(done));
        }
        video!.addEventListener("seeked", onSeeked);
        const fallback = setTimeout(done, 220);
        try { video!.currentTime = t; } catch { done(); }
      });
    }

    function primeFramesBySeeking(): Promise<ImageBitmap[]> {
      const w = video!.videoWidth, h = video!.videoHeight;
      if (!w || !h || typeof createImageBitmap !== "function" || prefersReduced) {
        return Promise.reject(new Error("frame-cache unsupported"));
      }
      const offscreen = document.createElement("canvas");
      offscreen.width = w; offscreen.height = h;
      const octx = offscreen.getContext("2d", { alpha: false })!;
      const count = cfg.frameCount || 80;
      const out: ImageBitmap[] = new Array(count);
      let i = 0;
      function next(): Promise<ImageBitmap[]> {
        if (i >= count) return Promise.resolve(out);
        const t = (i / (count - 1)) * Math.max(duration - 0.02, 0);
        return seekTo(t).then(() => {
          octx.drawImage(video!, 0, 0, w, h);
          return createImageBitmap(offscreen);
        }).then((bmp) => {
          out[i] = bmp;
          i++;
          return next();
        });
      }
      const timeout = new Promise<ImageBitmap[]>((_, reject) => {
        setTimeout(() => reject(new Error("prime timeout")), 9000);
      });
      return Promise.race([next(), timeout]);
    }

    function primeFrames() {
      return primeFramesByPlayback().catch(primeFramesBySeeking);
    }

    function enableFallback() {
      mode = "seek";
      videoWrap!.classList.add("fallback-mode");
      video!.classList.add("is-ready");
      function raf() {
        if (sourceReady && inView && !prefersReduced) {
          const cur = video!.currentTime;
          const diff = targetTime - cur;
          if (Math.abs(diff) > 0.004) {
            video!.currentTime = clamp(cur + diff * 0.25, 0, duration);
          }
        }
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    function onLoadedMetadata() {
      duration = video!.duration || 0;
      sourceReady = isFinite(duration) && duration > 0;
      if (prefersReduced) {
        video!.currentTime = duration * (cfg.reducedFrame ?? 0.55);
        videoWrap!.classList.add("fallback-mode");
        video!.classList.add("is-ready");
        return;
      }
      if (!sourceReady) return;
      primeFrames().then(
        (loaded) => {
          frames = loaded;
          mode = "frames";
          canvas!.classList.add("is-ready");
          resizeCanvas();
          renderFrameForProgress(lastProgressRef.current);
        },
        () => enableFallback()
      );
    }
    function onError() {
      videoWrap!.classList.add("video-error");
    }

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);

    function onResize() {
      resizeCanvas();
      onScroll();
    }
    window.addEventListener("resize", onResize);
    const ro = "ResizeObserver" in window ? new ResizeObserver(resizeCanvas) : null;
    ro?.observe(canvas);

    let scrollTicking = false;
    function onScroll() {
      scrollTicking = false;
      const p = progress();
      lastProgressRef.current = p;
      applyChrome(p);
      if (mode === "frames") renderFrameForProgress(p);
      else if (mode === "seek" && sourceReady) targetTime = p * duration;
    }
    function onScrollThrottled() {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(onScroll);
      }
    }
    window.addEventListener("scroll", onScrollThrottled, { passive: true });

    let io: IntersectionObserver | null = null;
    let lazyIO: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { inView = e.isIntersecting; }),
        { threshold: 0 }
      );
      io.observe(wrapper);

      lazyIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            lazyIO!.disconnect();
            const source = document.createElement("source");
            source.src = cfg.src;
            source.type = "video/mp4";
            video!.appendChild(source);
            video!.load();
          });
        },
        { rootMargin: "900px 0px 900px 0px" }
      );
      lazyIO.observe(wrapper);
    } else {
      const source = document.createElement("source");
      source.src = cfg.src;
      source.type = "video/mp4";
      video.appendChild(source);
      video.load();
    }

    if (prefersReduced) {
      const [phaseA, phaseB] = refs.phaseRefs;
      if (phaseA.current && phaseB.current) crossfade(phaseA.current, phaseB.current, 1);
      if (refs.cueFillRef.current) refs.cueFillRef.current.style.transform = "scaleY(1)";
    } else {
      onScroll();
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScrollThrottled);
      io?.disconnect();
      lazyIO?.disconnect();
      ro?.disconnect();
    };
  }, [cfg, prefersReduced, refs]);
}
```

- [ ] **Step 3: Implementar `components/ScrubVideo.tsx`** — monta o DOM e conecta os refs ao hook:

```tsx
"use client";
import { useRef } from "react";
import { useScrubVideo } from "@/hooks/useScrubVideo";

export interface ScrubPhase {
  id: string;
  content: React.ReactNode;
  align?: "left" | "right";
}

export interface ScrubCueConfig {
  label?: string;
  end: number;
  fadeStart: number;
  fadeEnd: number;
  align?: "right";
}

export interface ScrubVideoProps {
  scrollId: string;
  src: string;
  frameCount: number;
  heightVh: number;
  short?: boolean;
  phases: [ScrubPhase, ScrubPhase];
  fadeStart: number;
  fadeEnd: number;
  cue?: ScrubCueConfig;
  endFade?: { start: number; end: number };
  reducedFrame?: number;
  scrimDirection?: "left" | "right";
  anchorId?: string;
  children?: React.ReactNode;
}

export function ScrubVideo(props: ScrubVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseARef = useRef<HTMLDivElement>(null);
  const phaseBRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const cueFillRef = useRef<HTMLDivElement>(null);
  const endFadeRef = useRef<HTMLDivElement>(null);

  useScrubVideo(props, {
    wrapperRef,
    videoWrapRef,
    videoRef,
    canvasRef,
    phaseRefs: [phaseARef, phaseBRef],
    cueRef,
    cueFillRef,
    endFadeRef,
  });

  const [phaseA, phaseB] = props.phases;

  return (
    <div className={`scrub-scroll${props.short ? " short" : ""}`} id={props.scrollId} ref={wrapperRef}>
      <section className="scrub">
        <div className="scrub-video-wrap cursor-hover-target" ref={videoWrapRef}>
          <video ref={videoRef} muted playsInline preload="none" aria-hidden="true" />
          <canvas ref={canvasRef} aria-hidden="true" />
        </div>
        <div className="scrub-vignette" />
        <div className={`scrub-scrim${props.scrimDirection === "right" ? " from-right" : ""}`} />
        <div className="scrub-grain" />
        {props.endFade && <div className="scrub-endfade" ref={endFadeRef} />}
        {props.anchorId && <span id={props.anchorId} className="phase-anchor" />}

        <div className="hero-text-layer">
          <div className={`scrub-content phase-block is-active${phaseA.align === "right" ? " align-right" : ""}`} ref={phaseARef}>
            {phaseA.content}
          </div>
          <div className={`scrub-content phase-block${phaseB.align === "right" ? " align-right" : ""}`} ref={phaseBRef}>
            {phaseB.content}
          </div>
        </div>

        {props.cue && (
          <div className={`scroll-cue${props.cue.align === "right" ? " right" : ""}`} ref={cueRef}>
            <span>{props.cue.label ?? "Scroll to explore"}</span>
            <span className="cue-line"><i className="cue-fill" ref={cueFillRef} /></span>
          </div>
        )}
        {props.children}
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Verificar manualmente**

Run: `npm run dev`. Montar temporariamente `<ScrubVideo>` em `app/page.tsx` com `src="/video/moto.mp4"`, `frameCount={90}`, duas fases simples de texto, e rolar a página: o vídeo deve trocar de frame suavemente e o texto deve fazer crossfade sem travar. Confirmar no DevTools → Performance que não há warnings de "forced reflow" excessivos. Remover a montagem temporária (o uso real vem na Task 9).

- [ ] **Step 5: Commit**

```bash
git add hooks/useScrubVideo.ts components/ScrubVideo.tsx styles/scrub.css app/globals.css
git commit -m "feat: port scroll-scrubbed video engine (useScrubVideo + ScrubVideo)"
```

---

### Task 9: `Hero`

**Files:**
- Create: `components/Hero.tsx`
- Create: `styles/hero.css` (só o que for específico do Hero e não já coberto por `scrub.css`, ex.: `.stat-row`/`.stat` já estão em `scrub.css` — este arquivo pode ficar vazio/mínimo; remover no self-review se não sobrar nada específico)

**Interfaces:**
- Consumes: `ScrubVideo`, `ScrubPhase` (Task 8).
- Produces: `<Hero />`, primeiro componente montado em `app/page.tsx` (Task 18). Renderiza `<span id="about">` (âncora usada pelo nav "Oficina").

- [ ] **Step 1: Implementar `components/Hero.tsx`**

```tsx
import { ScrubVideo } from "@/components/ScrubVideo";

export function Hero() {
  return (
    <ScrubVideo
      scrollId="heroScroll"
      src="/video/moto.mp4"
      frameCount={90}
      heightVh={220}
      anchorId="about"
      fadeStart={0.34}
      fadeEnd={0.5}
      cue={{ label: "Scroll to explore", end: 0.5, fadeStart: 0.86, fadeEnd: 0.97 }}
      endFade={{ start: 0.86, end: 1 }}
      reducedFrame={0.55}
      phases={[
        {
          id: "heroPhase",
          content: (
            <>
              <div className="eyebrow">Oficina de alta performance em Resende, RJ</div>
              <h1 className="title">SF<br /><span className="accent">MOTOS</span></h1>
              <p className="hero-tagline">Manutenção · Performance · Customização</p>
              <div className="scrub-actions">
                <a href="#contact" className="btn-primary cursor-hover-target">Agendar revisão</a>
                <a href="#location" className="btn-ghost cursor-hover-target">Como chegar →</a>
              </div>
            </>
          ),
        },
        {
          id: "historiaPhase",
          content: (
            <>
              <span className="eyebrow">A oficina</span>
              <h2 style={{ marginTop: 14 }}>
                Precisão de pista<br /><span className="accent">no dia a dia</span>
              </h2>
              <p className="scrub-sub" style={{ maxWidth: 560 }}>
                Fundada em 2026, a SF Motos Alta Performance nasceu com um objetivo claro:
                atender motos de alta cilindrada e alto padrão em Resende com a tecnologia e o
                rigor técnico que esse tipo de máquina exige.
              </p>
              <p className="scrub-sub" style={{ maxWidth: 560 }}>
                Trabalhamos com honestidade e transparência em cada orçamento, comprometidos
                com o cliente do início ao fim — é isso que nos coloca como referência em
                oficina de moto de alta performance na cidade.
              </p>
              <div className="stat-row">
                <div className="stat"><b>2026</b><span>Ano de fundação</span></div>
                <div className="stat"><b>5.0</b><span>Avaliação média</span></div>
              </div>
            </>
          ),
        },
      ]}
    />
  );
}
```

- [ ] **Step 2: Montar temporariamente em `app/page.tsx`, verificar visualmente, reverter**

Comparar lado a lado com `thaian-lq.github.io/sf-motos`: título, tagline, botões, crossfade para a segunda fase ao rolar, stats "2026" / "5.0", scroll cue. Depois de verificar, reverta a montagem temporária em `app/page.tsx` — a montagem definitiva de todas as seções acontece de uma vez só na Task 18, não seção por seção.

- [ ] **Step 3: Commit**

```bash
git add components/Hero.tsx styles/hero.css app/globals.css
git commit -m "feat: port Hero section"
```

---

### Task 10: `Processes`

**Files:**
- Create: `components/Processes.tsx`
- Create: `styles/processes.css`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `Reveal` (Task 5).
- Produces: `<Processes />`, seção `#process`.

- [ ] **Step 1: Criar `styles/processes.css`** com o conteúdo exato abaixo (o `index.html` original já foi removido do working tree na Task 1 — este é o conteúdo literal, não uma paráfrase):

```css
.process-timeline{position:relative;z-index:2;display:grid;gap:0;max-width:920px;}
.timeline-track{position:absolute;left:29px;top:10px;bottom:10px;width:1px;background:var(--line-strong);z-index:0;}
@media(min-width:720px){.timeline-track{left:53px;}}
.timeline-fill{position:absolute;left:0;top:0;width:100%;height:100%;background:var(--red);transform:scaleY(0);transform-origin:top;
  transition:transform .1s linear;}
.process-step{position:relative;z-index:1;display:grid;grid-template-columns:60px 1fr;gap:22px;align-items:start;
  padding:38px 0;border-bottom:1px solid var(--line);transition:padding-left .35s var(--ease);}
@media(min-width:720px){.process-step{grid-template-columns:108px 1fr;gap:36px;}}
.process-step:last-child{border-bottom:0;}
.process-step:hover{padding-left:14px;}
.step-num{font-family:'Oswald',sans-serif;font-weight:700;font-size:clamp(2.4rem,4.5vw,3.6rem);color:var(--graphite-2);
  -webkit-text-stroke:1px var(--line-strong);transition:color .35s, -webkit-text-stroke-color .35s, transform .35s var(--ease);
  line-height:1;}
.process-step:hover .step-num,.process-step.in-view .step-num{color:transparent;-webkit-text-stroke-color:var(--red);}
.process-step:hover .step-num{transform:scale(1.08);}
.step-body h3{font-size:clamp(1.3rem,2.2vw,1.9rem);margin-bottom:10px;letter-spacing:.02em;position:relative;padding-left:18px;}
.step-body h3::before{content:"";position:absolute;left:0;top:.35em;width:8px;height:8px;background:var(--graphite-2);
  transition:background .3s;}
.process-step:hover .step-body h3::before{background:var(--red);}
.step-body p{color:var(--gray);font-weight:300;line-height:1.6;font-size:1rem;max-width:560px;padding-left:18px;}
```

- [ ] **Step 2: Implementar `components/Processes.tsx`** com a lógica do preenchimento vermelho da timeline (porta o listener de scroll `updateTimeline` do arquivo original) e o hover/in-view de cada `step-num` via `IntersectionObserver`:

```tsx
"use client";
import { useEffect, useRef } from "react";
import { clamp } from "@/lib/math";
import { Reveal } from "@/components/Reveal";

const STEPS = [
  { num: "01", title: "Recepção", body: "Anotamos o histórico e o que você percebeu de diferente na moto." },
  { num: "02", title: "Diagnóstico", body: "Inspeção técnica completa antes de qualquer orçamento fechado." },
  { num: "03", title: "Execução", body: "Serviço feito com peças certas e prazo combinado." },
  { num: "04", title: "Entrega", body: "Teste final e explicação do que foi feito, sem letra miúda." },
];

export function Processes() {
  const sectionRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const fill = fillRef.current;
    if (!section || !fill) return;

    let ticking = false;
    function update() {
      ticking = false;
      const rect = section!.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.6;
      const scrolled = vh * 0.8 - rect.top;
      const p = clamp(scrolled / total, 0, 1);
      fill!.style.transform = `scaleY(${p})`;
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();

    const io = "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); }),
          { threshold: 0.5 }
        )
      : null;
    stepRefs.current.forEach((el) => io?.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      io?.disconnect();
    };
  }, []);

  return (
    <section className="section" id="process" ref={sectionRef}>
      <div className="tech-corner tl" /><div className="tech-corner tr" />
      <div className="section-head">
        <h2>Processos</h2>
        <span className="eyebrow">Do check-in à entrega</span>
      </div>
      <div className="process-timeline">
        <div className="timeline-track"><i className="timeline-fill" ref={fillRef} /></div>
        {STEPS.map((step, i) => (
          <Reveal key={step.num} delayMs={i * 80}>
            <div
              className="process-step cursor-hover-target"
              ref={(el) => { if (el) stepRefs.current[i] = el; }}
            >
              <span className="step-num">{step.num}</span>
              <div className="step-body"><h3>{step.title}</h3><p>{step.body}</p></div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verificar manualmente**

Comparar com o site atual: a linha vermelha da timeline deve preencher progressivamente ao rolar, e cada número deve "acender" (stroke vermelho) ao entrar na viewport ou no hover.

- [ ] **Step 4: Commit**

```bash
git add components/Processes.tsx styles/processes.css app/globals.css
git commit -m "feat: port Processes timeline section"
```

---

### Task 11: `PrecisionVideo`

**Files:**
- Create: `components/PrecisionVideo.tsx`

**Interfaces:**
- Consumes: `ScrubVideo` (Task 8).
- Produces: `<PrecisionVideo />`, seção "Precisão que se nota" → reveal da palavra "Serviços".

- [ ] **Step 1: Implementar `components/PrecisionVideo.tsx`**

```tsx
import { ScrubVideo } from "@/components/ScrubVideo";

export function PrecisionVideo() {
  return (
    <ScrubVideo
      scrollId="motorScroll"
      short
      src="/video/motor.mp4"
      frameCount={72}
      heightVh={280}
      fadeStart={0.55}
      fadeEnd={0.74}
      scrimDirection="right"
      cue={{ label: "Scroll", end: 0.6, fadeStart: 0.82, fadeEnd: 0.95, align: "right" }}
      reducedFrame={0.5}
      phases={[
        {
          id: "motorPhaseA",
          align: "right",
          content: (
            <>
              <div className="eyebrow">Diagnóstico de verdade</div>
              <h2>Precisão que<br /><span className="accent">se nota</span></h2>
              <p className="scrub-sub">
                Vamos a fundo em cada detalhe do motor pra encontrar a causa real e dar a
                tratativa certa. Nem sempre é preciso desmontar tudo — mas vamos até onde for
                necessário.
              </p>
              <div className="scrub-actions">
                <a href="#contact" className="btn-primary cursor-hover-target">Falar com a oficina</a>
              </div>
            </>
          ),
        },
        {
          id: "motorPhaseB",
          align: "right",
          content: (
            <>
              <span className="eyebrow">O que fazemos</span>
              <h2 className="reveal-word" style={{ marginTop: 14 }}>Serviços</h2>
              <a href="#services" className="reveal-hint cursor-hover-target">Ver todos ↓</a>
            </>
          ),
        },
      ]}
    />
  );
}
```

- [ ] **Step 2: Verificar manualmente**

Comparar com o site atual: texto alinhado à direita, scrim vindo da direita, crossfade para a palavra "Serviços" com link "Ver todos ↓".

- [ ] **Step 3: Commit**

```bash
git add components/PrecisionVideo.tsx
git commit -m "feat: port PrecisionVideo (second scrub video) section"
```

---

### Task 12: `data/services.tsx` + `Services`

**Files:**
- Create: `data/services.tsx`
- Create: `components/Services.tsx`
- Create: `styles/services.css`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `interface Service { num: string; title: string; description: string; icon: ReactNode; featured?: boolean; wide?: boolean; seal?: { image: string; title: string; subtitle: string } }`, `export const services: Service[]` (8 itens) — consumido só por `Services.tsx`.

- [ ] **Step 1: Criar `styles/services.css`** com o conteúdo exato abaixo:

```css
.services-grid{position:relative;z-index:2;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
  grid-auto-rows:minmax(210px,auto);gap:1px;background:var(--line);border:1px solid var(--line);}
.service-card{background:var(--black);padding:34px 30px;position:relative;overflow:hidden;
  display:flex;flex-direction:column;justify-content:space-between;transition:background .35s;}
.service-card:hover{background:var(--graphite-2);}
.service-card::before{content:"";position:absolute;left:0;top:0;width:2px;height:0;background:var(--red);transition:height .35s var(--ease);}
.service-card:hover::before{height:100%;}
.service-card .num-bg{position:absolute;right:18px;top:-6px;font-family:'Oswald',sans-serif;font-weight:700;
  font-size:clamp(4rem,7vw,6.4rem);line-height:1;color:transparent;-webkit-text-stroke:1px var(--line-strong);
  transition:-webkit-text-stroke-color .4s;pointer-events:none;}
.service-card:hover .num-bg{-webkit-text-stroke-color:rgba(196,30,30,.45);}
.service-card .icon{width:30px;height:30px;color:var(--red);opacity:.9;margin-bottom:auto;}
.service-card .icon svg{width:100%;height:100%;}
.service-card .num{font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--red);letter-spacing:.1em;margin-bottom:18px;display:block;}
.service-card h3{font-size:1.18rem;margin-bottom:10px;letter-spacing:.02em;position:relative;z-index:1;}
.service-card p{color:var(--gray);font-size:.88rem;font-weight:300;line-height:1.55;position:relative;z-index:1;max-width:32ch;}
.service-card.featured{grid-column:span 2;grid-row:span 2;background:linear-gradient(155deg, rgba(196,30,30,.10), var(--black) 55%);}
.service-card.featured h3{font-size:clamp(1.5rem,2.4vw,2rem);}
.service-card.featured .icon{width:42px;height:42px;}
.service-card.wide{grid-column:span 2;}
.service-seal{display:flex;align-items:center;gap:14px;margin-top:22px;padding-top:18px;border-top:1px solid var(--line);position:relative;z-index:1;}
.service-seal img{width:56px;height:56px;border-radius:50%;flex-shrink:0;object-fit:cover;background:var(--graphite-2);}
.service-seal-text{display:flex;flex-direction:column;gap:3px;}
.service-seal-text b{font-family:'Oswald',sans-serif;font-weight:600;font-size:.86rem;letter-spacing:.02em;text-transform:uppercase;color:var(--white);}
.service-seal-text span{font-family:'JetBrains Mono',monospace;font-size:.66rem;letter-spacing:.05em;color:var(--red);text-transform:uppercase;}
@media(max-width:900px){
  .services-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
  .service-card.featured,.service-card.wide{grid-column:1/-1;grid-row:auto;}
}
@media(max-width:560px){.services-grid{grid-template-columns:1fr;}}
```

- [ ] **Step 2: Criar `data/services.tsx`** com os 8 serviços e seus ícones SVG (path data idêntico ao arquivo original):

```tsx
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
```

- [ ] **Step 3: Implementar `components/Services.tsx`**

```tsx
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
```

- [ ] **Step 4: Verificar manualmente**

Comparar com o site atual: grid assimétrico (card "Motor & performance" 2×2 com selo TEXA, "Socorro & guincho" ocupando 2 colunas), responsivo em 900px (2 colunas) e 560px (1 coluna).

- [ ] **Step 5: Commit**

```bash
git add data/services.tsx components/Services.tsx styles/services.css app/globals.css
git commit -m "feat: port Services grid with TEXA seal"
```

---

### Task 13: `data/gallery.ts` + `GarageExperience`

**Files:**
- Create: `data/gallery.ts`
- Create: `hooks/useGarageVideo.ts`
- Create: `components/GarageExperience.tsx`
- Create: `styles/garage.css`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `interface GalleryPhoto { src: string; alt: string; tag: string; size: "hero" | "normal" }`, `export const galleryPhotos: GalleryPhoto[]` (5 itens); `useGarageVideo()` hook para o player play/pause/duração/lazy/pausa-ao-sair-da-viewport.

- [ ] **Step 1: Criar `styles/garage.css`** com o conteúdo exato abaixo (a galeria tem só 5 fotos, sem placeholder de foto 6 — reflete o estado atual do site):

```css
.garage-compose{position:relative;z-index:2;display:grid;
  grid-template-columns:1fr 1.5fr;grid-template-rows:auto auto;
  column-gap:56px;row-gap:44px;}

.garage-intro{grid-column:1;grid-row:1;max-width:420px;}
.garage-intro .eyebrow{margin-bottom:18px;}
.garage-title{font-size:clamp(2.4rem,4.4vw,3.8rem);margin-bottom:22px;}
.garage-sub{color:var(--gray);font-weight:300;line-height:1.6;font-size:1rem;max-width:36ch;}

.garage-grid{grid-column:1;grid-row:2;display:grid;grid-template-columns:repeat(2,1fr);gap:18px;align-content:start;}
.garage-photo{position:relative;overflow:hidden;margin:0;background:var(--graphite);aspect-ratio:4/3;}
.garage-photo.g-hero{grid-column:1/-1;aspect-ratio:16/10;}
.garage-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s var(--ease);}
.garage-photo:hover img{transform:scale(1.03);}
.garage-photo::before{content:"";position:absolute;left:0;right:0;bottom:0;height:46%;z-index:1;
  background:linear-gradient(to top, rgba(13,13,13,.65) 0%, transparent 100%);pointer-events:none;}
.garage-photo::after{content:"";position:absolute;left:0;bottom:0;width:0;height:2px;background:var(--red);
  transition:width .4s var(--ease);z-index:2;}
.garage-photo:hover::after{width:100%;}
.garage-photo-tag{position:absolute;left:14px;bottom:12px;z-index:2;font-family:'JetBrains Mono',monospace;
  font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--white);text-shadow:0 1px 6px rgba(13,13,13,.9);}

.garage-video{grid-column:2;grid-row:1/3;position:relative;border:1px solid var(--line);background:var(--graphite-2);
  overflow:hidden;min-height:560px;}
.garage-video-media{position:absolute;inset:0;}
.garage-video-media video{width:100%;height:100%;object-fit:cover;display:block;}
.garage-video-scrim{position:absolute;inset:0;z-index:1;pointer-events:none;transition:opacity .4s var(--ease);
  background:linear-gradient(180deg, rgba(13,13,13,.45) 0%, rgba(13,13,13,.05) 30%, rgba(13,13,13,.15) 60%, rgba(13,13,13,.6) 100%);}
.garage-video-label{position:absolute;top:26px;left:26px;z-index:3;font-family:'JetBrains Mono',monospace;font-size:.7rem;
  letter-spacing:.15em;text-transform:uppercase;color:var(--gray);display:flex;flex-direction:column;gap:8px;pointer-events:none;
  transition:opacity .3s;}
.garage-video-label b{color:var(--white);font-family:'Oswald',sans-serif;font-weight:600;font-size:1rem;letter-spacing:.04em;text-transform:none;}
.garage-video-duration{position:absolute;top:26px;right:26px;z-index:3;font-family:'JetBrains Mono',monospace;font-size:.7rem;
  letter-spacing:.1em;color:var(--gray);background:rgba(13,13,13,.5);padding:5px 10px;opacity:0;transition:opacity .3s;}
.garage-video-duration.is-ready{opacity:1;}
.garage-video-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:3;width:80px;height:80px;border-radius:50%;
  background:var(--red);border:0;color:var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:transform .3s var(--ease), background .25s, opacity .3s;}
.garage-video-btn:hover{transform:translate(-50%,-50%) scale(1.08);background:var(--red-dark);}
.garage-video-btn svg{width:26px;height:26px;margin-left:3px;}
.garage-video-cta{position:absolute;left:26px;bottom:26px;z-index:3;font-family:'JetBrains Mono',monospace;font-size:.72rem;
  letter-spacing:.15em;text-transform:uppercase;color:var(--white);display:flex;align-items:center;gap:10px;
  pointer-events:none;transition:opacity .3s;}
.garage-video-cta::before{content:"";width:22px;height:1px;background:var(--red);display:inline-block;}
.garage-video.is-playing .garage-video-btn,.garage-video.is-playing .garage-video-cta,
.garage-video.is-playing .garage-video-label{opacity:0;pointer-events:none;}
.garage-video.is-playing .garage-video-scrim{opacity:0;}
.garage-video-error-msg{position:absolute;inset:0;z-index:3;display:none;align-items:center;justify-content:center;
  font-family:'JetBrains Mono',monospace;font-size:.78rem;color:var(--gray);text-align:center;padding:0 30px;line-height:1.6;}
.garage-video.video-error .garage-video-error-msg{display:flex;}
.garage-video.video-error .garage-video-btn,.garage-video.video-error .garage-video-media,
.garage-video.video-error .garage-video-cta{display:none;}

@media(max-width:1000px){
  .garage-compose{grid-template-columns:1fr;grid-template-rows:auto auto auto;row-gap:36px;}
  .garage-intro{grid-column:1;grid-row:1;max-width:none;}
  .garage-video{grid-column:1;grid-row:2;min-height:0;aspect-ratio:16/10;}
  .garage-grid{grid-column:1;grid-row:3;}
}
@media(max-width:560px){
  .garage-grid{gap:12px;}
  .garage-video-btn{width:64px;height:64px;}
  .garage-video-label,.garage-video-duration,.garage-video-cta{font-size:.62rem;}
}
```

- [ ] **Step 2: Criar `data/gallery.ts`**

```ts
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
```

- [ ] **Step 3: Implementar `hooks/useGarageVideo.ts`** (porta a IIFE "GARAGE VIDEO" do arquivo original):

```ts
"use client";
import { RefObject, useEffect, useRef, useState } from "react";

interface GarageVideoRefs {
  wrapRef: RefObject<HTMLDivElement>;
  videoRef: RefObject<HTMLVideoElement>;
}

export function useGarageVideo({ wrapRef, videoRef }: GarageVideoRefs) {
  const [duration, setDuration] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);
  const [playing, setPlaying] = useState(false);
  const sourceLoadedRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    function loadSource() {
      if (sourceLoadedRef.current) return;
      sourceLoadedRef.current = true;
      const source = document.createElement("source");
      source.src = "/video/amostração.mp4";
      source.type = "video/mp4";
      video!.appendChild(source);
      video!.load();
    }

    function onLoadedMetadata() {
      const d = video!.duration;
      if (isFinite(d) && d > 0) {
        const m = Math.floor(d / 60), s = Math.round(d % 60);
        setDuration(`${m}:${s < 10 ? "0" : ""}${s}`);
      }
    }
    function onError() { setErrored(true); }
    function onPlay() { setPlaying(true); }
    function onPause() { setPlaying(false); }
    function onEnded() { setPlaying(false); }

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    let lazyIO: IntersectionObserver | null = null;
    let pauseIO: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      lazyIO = new IntersectionObserver(
        (entries) => entries.forEach((entry) => { if (entry.isIntersecting) { loadSource(); lazyIO!.disconnect(); } }),
        { rootMargin: "600px 0px 600px 0px" }
      );
      lazyIO.observe(wrap);

      pauseIO = new IntersectionObserver(
        (entries) => entries.forEach((entry) => { if (!entry.isIntersecting && !video!.paused) video!.pause(); }),
        { threshold: 0 }
      );
      pauseIO.observe(wrap);
    } else {
      loadSource();
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      lazyIO?.disconnect();
      pauseIO?.disconnect();
    };
  }, [wrapRef, videoRef]);

  function play() {
    const video = videoRef.current;
    if (!video) return;
    if (!sourceLoadedRef.current) {
      const source = document.createElement("source");
      source.src = "/video/amostração.mp4";
      source.type = "video/mp4";
      video.appendChild(source);
      video.load();
      sourceLoadedRef.current = true;
    }
    video.muted = false;
    video.setAttribute("controls", "");
    video.play()?.catch(() => {
      video.muted = true;
      video.play()?.catch(() => {});
    });
  }

  return { duration, errored, playing, play };
}
```

- [ ] **Step 4: Implementar `components/GarageExperience.tsx`**

```tsx
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
            <Reveal key={photo.src} delayMs={80 + i * 60} className={`garage-photo cursor-hover-target${photo.size === "hero" ? " g-hero" : ""}`}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1000px) 50vw, 25vw" style={{ objectFit: "cover" }} />
              <span className="garage-photo-tag">{photo.tag}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Nota: `next/image` com `fill` exige o container (`.garage-photo`) com `position: relative` — já garantido em `styles/garage.css` (portado do original).

- [ ] **Step 5: Verificar manualmente**

Comparar com o site atual: composição 40% galeria / 60% vídeo no desktop, ordem título→vídeo→galeria no mobile, play do vídeo (desmuta, mostra controles), duração exibida após `loadedmetadata`, pausa ao rolar para fora da viewport, sem o placeholder "Oficina/06" (já removido do site atual).

- [ ] **Step 6: Commit**

```bash
git add data/gallery.ts hooks/useGarageVideo.ts components/GarageExperience.tsx styles/garage.css app/globals.css
git commit -m "feat: port GarageExperience section (photo wall + garage video)"
```

---

### Task 14: `useBeforeAfterSlider` + `BeforeAfterGallery`

**Files:**
- Create: `hooks/useBeforeAfterSlider.ts`
- Create: `hooks/useBeforeAfterSlider.test.ts`
- Create: `components/BeforeAfterGallery.tsx`
- Create: `styles/trabalhos.css`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `clamp` (Task 3).
- Produces: `computeClampedPercent(pct: number): number` (função pura extraída e testada), `useBeforeAfterSlider(): { percent, dragging, containerRef, handlers }`.

- [ ] **Step 1: Escrever o teste que falha (`hooks/useBeforeAfterSlider.test.ts`)** — testa só a função pura de clamp usada pelo slider (a mesma faixa 4–96% do arquivo original):

```ts
import { describe, expect, it } from "vitest";
import { computeClampedPercent } from "./useBeforeAfterSlider";

describe("computeClampedPercent", () => {
  it("clamps to the 4-96 range used by the before/after handle", () => {
    expect(computeClampedPercent(-10)).toBe(4);
    expect(computeClampedPercent(150)).toBe(96);
    expect(computeClampedPercent(50)).toBe(50);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar `hooks/useBeforeAfterSlider.ts`**

```ts
"use client";
import { KeyboardEvent, PointerEvent, useRef, useState } from "react";
import { clamp } from "@/lib/math";

export function computeClampedPercent(pct: number): number {
  return clamp(pct, 4, 96);
}

export function useBeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [interacted, setInteracted] = useState(false);

  function percentFromEvent(e: PointerEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * 100;
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    containerRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    setInteracted(true);
    setPercent(computeClampedPercent(percentFromEvent(e)));
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    setPercent(computeClampedPercent(percentFromEvent(e)));
  }
  function onPointerUp() { setDragging(false); }
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") { setInteracted(true); setPercent((p) => computeClampedPercent(p - 4)); e.preventDefault(); }
    if (e.key === "ArrowRight") { setInteracted(true); setPercent((p) => computeClampedPercent(p + 4)); e.preventDefault(); }
  }

  return {
    containerRef,
    percent,
    dragging,
    interacted,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onKeyDown },
  };
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Criar `styles/trabalhos.css`** com o conteúdo exato abaixo:

```css
.trabalhos-grid{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:28px;}
.work-card.featured{grid-column:1/-1;}
@media(max-width:860px){.trabalhos-grid{grid-template-columns:1fr;}}
.work-card{border:1px solid var(--line);background:var(--black);}

.before-after{position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;touch-action:pan-y;cursor:ew-resize;user-select:none;}
.work-card.featured .before-after{aspect-ratio:21/9;}
.ba-media{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
.ba-before{background:repeating-linear-gradient(135deg, #161616, #161616 10px, #1c1c1c 10px, #1c1c1c 20px);filter:grayscale(.4) brightness(.85);}
.ba-after{background:repeating-linear-gradient(135deg, #1a1010, #1a1010 10px, #241414 10px, #241414 20px);
  clip-path:inset(0 0 0 50%);will-change:clip-path;}
.ba-media span{font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gray);}
.ba-tag{position:absolute;top:16px;font-family:'JetBrains Mono',monospace;font-size:.62rem;letter-spacing:.18em;
  text-transform:uppercase;color:var(--white);background:rgba(13,13,13,.55);padding:6px 10px;z-index:2;pointer-events:none;}
.ba-tag-before{left:16px;}
.ba-tag-after{right:16px;}
.ba-handle{position:absolute;top:0;bottom:0;left:50%;width:0;display:flex;align-items:center;justify-content:center;
  transform:translateX(-50%);z-index:3;cursor:ew-resize;}
.ba-handle::before{content:"";position:absolute;top:0;bottom:0;left:0;width:1px;background:var(--red);
  box-shadow:0 0 14px rgba(196,30,30,.7);}
.ba-handle-icon{width:44px;height:44px;border-radius:50%;background:var(--red);color:var(--white);display:flex;
  align-items:center;justify-content:center;font-size:1rem;letter-spacing:0;box-shadow:0 4px 18px rgba(0,0,0,.4);
  transition:transform .25s var(--ease);}
.before-after:hover .ba-handle-icon{transform:scale(1.1);}
.before-after.dragging .ba-handle-icon{transform:scale(1.15);}
.ba-handle-icon svg{width:20px;height:20px;}
.before-after:not(.interacted) .ba-handle-icon{animation:baPulse 2.4s ease-in-out infinite;}
@keyframes baPulse{0%,100%{box-shadow:0 4px 18px rgba(0,0,0,.4),0 0 0 0 rgba(196,30,30,.5);}50%{box-shadow:0 4px 18px rgba(0,0,0,.4),0 0 0 14px rgba(196,30,30,0);}}

.work-caption{padding:22px 24px 26px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 20px;align-items:baseline;}
.work-caption b{font-family:'Oswald',sans-serif;font-size:1.05rem;letter-spacing:.02em;text-transform:uppercase;}
.work-caption p{color:var(--gray);font-size:.85rem;width:100%;order:3;margin-top:2px;}
.work-cat{font-family:'JetBrains Mono',monospace;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--red);}
```

- [ ] **Step 6: Implementar `components/BeforeAfterGallery.tsx`** (3 cards, mesmos placeholders "Antes/Depois" do arquivo original — nenhuma foto real ainda):

```tsx
"use client";
import { useBeforeAfterSlider } from "@/hooks/useBeforeAfterSlider";
import { Reveal } from "@/components/Reveal";

const CARDS = [
  { label: "Placeholder 01", featured: true },
  { label: "Placeholder 02", featured: false },
  { label: "Placeholder 03", featured: false },
];

function BeforeAfterCard({ label, featured, delayMs }: { label: string; featured: boolean; delayMs: number }) {
  const { containerRef, percent, dragging, interacted, handlers } = useBeforeAfterSlider();

  return (
    <Reveal delayMs={delayMs} className={`work-card cursor-hover-target${featured ? " featured" : ""}`}>
      <div
        className={`before-after cursor-hover-target${dragging ? " dragging" : ""}${interacted ? " interacted" : ""}`}
        ref={containerRef}
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={handlers.onPointerUp}
        onPointerCancel={handlers.onPointerCancel}
        data-drag-target
      >
        <div className="ba-media ba-before"><span>Antes</span></div>
        <div className="ba-media ba-after" style={{ clipPath: `inset(0 0 0 ${percent}%)` }}><span>Depois</span></div>
        <span className="ba-tag ba-tag-before">Antes</span>
        <span className="ba-tag ba-tag-after">Depois</span>
        <div
          className="ba-handle"
          style={{ left: `${percent}%` }}
          tabIndex={0}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          aria-label={`Arraste para comparar antes e depois — ${label}`}
          onKeyDown={handlers.onKeyDown}
        >
          <span className="ba-handle-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
          </span>
        </div>
      </div>
      <div className="work-caption">
        <b>{label}</b>
        <span className="work-cat">Categoria — a definir</span>
        <p>Substituir por foto real do trabalho</p>
      </div>
    </Reveal>
  );
}

export function BeforeAfterGallery() {
  return (
    <section className="section tone-graphite" id="trabalhos">
      <div className="section-fade top" />
      <div className="section-fade bottom" />
      <div className="section-head">
        <h2>Trabalhos</h2>
        <span className="eyebrow">Antes / depois</span>
      </div>
      <div className="trabalhos-grid">
        {CARDS.map((card, i) => (
          <BeforeAfterCard key={card.label} label={card.label} featured={card.featured} delayMs={i * 80} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Verificar manualmente**

Comparar com o site atual: arrastar o handle com mouse e touch, setas do teclado movem 4% por vez, `aria-valuenow` atualiza, pulso vermelho no handle até a primeira interação.

- [ ] **Step 8: Commit**

```bash
git add hooks/useBeforeAfterSlider.ts hooks/useBeforeAfterSlider.test.ts components/BeforeAfterGallery.tsx styles/trabalhos.css app/globals.css
git commit -m "feat: port before/after slider and Trabalhos section"
```

---

### Task 15: `Location`

**Files:**
- Create: `components/Location.tsx`
- Create: `styles/location.css`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `<Location />`, seção `#location`, com o link de WhatsApp `https://wa.me/5524999170017`.

- [ ] **Step 1: Criar `styles/location.css`** com o conteúdo exato abaixo:

```css
.location-compose{position:relative;z-index:2;min-height:640px;border:1px solid var(--line);}
.location-map{position:absolute;inset:0;}
.location-map iframe{width:100%;height:100%;border:0;filter:grayscale(1) invert(92%) contrast(88%) brightness(94%);}
.location-panel{position:relative;z-index:2;max-width:440px;margin:48px;padding:44px 40px;
  background:rgba(13,13,13,.86);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  border-left:2px solid var(--red);}
.location-panel h2{font-size:clamp(2rem,3.6vw,2.8rem);margin:14px 0 30px;}
.location-detail{margin-bottom:24px;}
.location-detail .label{display:block;font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.15em;
  text-transform:uppercase;color:var(--red);margin-bottom:8px;}
.location-detail p{color:var(--gray);font-weight:300;line-height:1.6;font-size:1rem;}
.location-actions{display:flex;align-items:center;gap:26px;flex-wrap:wrap;margin-top:30px;}
@media(max-width:860px){
  .location-compose{min-height:auto;display:flex;flex-direction:column;}
  .location-map{position:relative;height:340px;}
  .location-panel{margin:0;max-width:none;border-left:0;border-top:2px solid var(--red);backdrop-filter:none;background:var(--graphite);}
}
```

- [ ] **Step 2: Implementar `components/Location.tsx`**

```tsx
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
```

- [ ] **Step 3: Verificar manualmente**

Comparar com o site atual: mapa embutido, painel sobreposto no desktop / empilhado no mobile, número de WhatsApp visível, os dois botões funcionando.

- [ ] **Step 4: Commit**

```bash
git add components/Location.tsx styles/location.css app/globals.css
git commit -m "feat: port Location section with WhatsApp number"
```

---

### Task 16: `useCardTilt` + `SFCard`

**Files:**
- Create: `hooks/useCardTilt.ts`
- Create: `hooks/useCardTilt.test.ts`
- Create: `components/SFCard.tsx`
- Create: `styles/cartao.css`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `clamp` (Task 3), `usePointerFine`, `useReducedMotion` (Task 4).
- Produces: `computeTilt(px: number, py: number): { rotateX: number; rotateY: number }` (função pura testada), `useCardTilt()` hook.

- [ ] **Step 1: Escrever o teste que falha (`hooks/useCardTilt.test.ts`)**

```ts
import { describe, expect, it } from "vitest";
import { computeTilt } from "./useCardTilt";

describe("computeTilt", () => {
  it("returns the resting tilt at the center of the stage", () => {
    const { rotateX, rotateY } = computeTilt(0.5, 0.5);
    expect(rotateX).toBeCloseTo(8, 5);
    expect(rotateY).toBeCloseTo(-14, 5);
  });

  it("tilts up and right when the pointer is top-right", () => {
    const { rotateX, rotateY } = computeTilt(1, 0);
    expect(rotateX).toBeGreaterThan(8);
    expect(rotateY).toBeGreaterThan(-14);
  });

  it("tilts down and left when the pointer is bottom-left", () => {
    const { rotateX, rotateY } = computeTilt(0, 1);
    expect(rotateX).toBeLessThan(8);
    expect(rotateY).toBeLessThan(-14);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar `hooks/useCardTilt.ts`**

```ts
"use client";
import { RefObject, useEffect } from "react";
import { clamp } from "@/lib/math";
import { usePointerFine } from "@/hooks/usePointerFine";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function computeTilt(px: number, py: number): { rotateX: number; rotateY: number } {
  const rotateX = (0.5 - py) * 22 + 8;
  const rotateY = (px - 0.5) * 28 - 14;
  return { rotateX, rotateY };
}

const BASE_TRANSFORM = "rotateX(8deg) rotateY(-14deg) rotateZ(-2deg)";

export function useCardTilt(stageRef: RefObject<HTMLDivElement>, cardRef: RefObject<HTMLDivElement>) {
  const hasFinePointer = usePointerFine();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!hasFinePointer || prefersReduced) return;
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;

    let raf = 0;
    function onMove(e: PointerEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = stage!.getBoundingClientRect();
        const px = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        const py = clamp((e.clientY - rect.top) / rect.height, 0, 1);
        const { rotateX, rotateY } = computeTilt(px, py);
        card!.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(-2deg)`;
        card!.style.setProperty("--sheen-x", `${px * 100}%`);
        card!.style.setProperty("--sheen-y", `${py * 100}%`);
      });
    }
    function onLeave() {
      card!.style.transform = BASE_TRANSFORM;
      card!.style.setProperty("--sheen-x", "20%");
      card!.style.setProperty("--sheen-y", "20%");
    }
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [hasFinePointer, prefersReduced, stageRef, cardRef]);
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Criar `styles/cartao.css`** com o conteúdo exato abaixo:

```css
.cartao-head{position:relative;z-index:2;max-width:720px;margin:0 auto 8px;text-align:center;}
.cartao-title{font-size:clamp(2.6rem,5.5vw,4.2rem);margin:18px 0 22px;}
.cartao-sub{color:var(--gray);font-weight:300;font-size:clamp(1.05rem,1.8vw,1.3rem);line-height:1.55;max-width:640px;margin:0 auto;}

.cartao-stage{position:relative;z-index:2;display:flex;justify-content:center;align-items:center;
  padding:64px 0 56px;perspective:1400px;}
.cartao-stage::before{content:"";position:absolute;left:50%;top:50%;width:min(640px,90vw);height:min(640px,90vw);
  transform:translate(-50%,-50%);background:radial-gradient(circle, rgba(196,30,30,.18) 0%, transparent 68%);
  z-index:0;pointer-events:none;}

.sfcard{position:relative;z-index:1;width:min(460px,86vw);aspect-ratio:1.55/1;border-radius:18px;cursor:pointer;
  background:linear-gradient(155deg, var(--graphite-2) 0%, var(--black) 72%);
  border:1px solid rgba(196,30,30,.35);
  box-shadow:0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(196,30,30,.08) inset, 0 0 42px rgba(196,30,30,.14);
  transform-style:preserve-3d;transform:rotateX(8deg) rotateY(-14deg) rotateZ(-2deg);
  transition:transform .5s var(--ease);
  padding:30px 34px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;
  --sheen-x:20%;--sheen-y:20%;}
.sfcard-sheen{position:absolute;inset:0;pointer-events:none;z-index:2;
  background:radial-gradient(circle at var(--sheen-x) var(--sheen-y), rgba(245,245,240,.16) 0%, rgba(196,30,30,.16) 22%, transparent 46%);
  transition:background-position .5s var(--ease);mix-blend-mode:screen;}
.sfcard-pattern{position:absolute;right:-64px;bottom:-64px;width:220px;height:220px;border-radius:50%;
  border:22px dashed rgba(196,30,30,.14);z-index:0;pointer-events:none;}
.sfcard-top{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;}
.sfcard-logo{width:46px;height:46px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5));}
.sfcard-medal{width:28px;height:28px;color:var(--red);opacity:.85;}
.sfcard-medal svg{width:100%;height:100%;}
.sfcard-body{position:relative;z-index:3;display:flex;flex-direction:column;gap:6px;}
.sfcard-body b{font-family:'Oswald',sans-serif;font-weight:700;font-size:clamp(1.6rem,3vw,2.1rem);letter-spacing:.05em;color:var(--white);}
.sfcard-body span{font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gray);}
.sfcard-bottom{position:relative;z-index:3;}
.sfcard-bottom .eyebrow{font-size:.66rem;}

.cartao-support{position:relative;z-index:2;max-width:620px;margin:0 auto 70px;text-align:center;
  color:var(--gray);font-weight:300;line-height:1.65;font-size:1rem;}

.cartao-cats{position:relative;z-index:2;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
  gap:1px;background:var(--line);border:1px solid var(--line);margin-bottom:64px;}
.cartao-cat{background:var(--black);padding:34px 24px;text-align:center;display:flex;flex-direction:column;
  align-items:center;gap:14px;transition:background .3s;}
.cartao-cat:hover{background:var(--graphite-2);}
.cartao-cat .icon{width:32px;height:32px;color:var(--white);}
.cartao-cat .icon svg{width:100%;height:100%;}
.cartao-cat b{font-family:'Oswald',sans-serif;font-size:1rem;letter-spacing:.02em;text-transform:uppercase;color:var(--white);}
.cartao-cat p{color:var(--gray);font-size:.86rem;font-weight:300;line-height:1.5;max-width:24ch;}

.cartao-cta-wrap{position:relative;z-index:2;text-align:center;}

@media(max-width:780px){.cartao-cats{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:640px){
  .sfcard{transform:rotateX(4deg) rotateY(-6deg) rotateZ(-1deg);}
  .cartao-stage{padding:44px 0 48px;}
}
```

- [ ] **Step 6: Implementar `components/SFCard.tsx`** (4 categorias com os mesmos ícones/textos já definidos nesta conversa: Oficina, Chopp gelado & petiscos, Itens para moto, Acessórios):

```tsx
"use client";
import Image from "next/image";
import { useRef } from "react";
import { useCardTilt } from "@/hooks/useCardTilt";
import { Reveal } from "@/components/Reveal";

const CATEGORIES = [
  {
    title: "Oficina",
    description: "Serviço técnico e cuidado com sua moto.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M14.5 6.5a3.5 3.5 0 10-4.9 4.9L4 17l3 3 6.4-6.4a3.5 3.5 0 004.9-4.9l-2.3 2.3-2-.5-.5-2 2.3-2.3z" />
        <circle cx="12" cy="12" r="1.1" style={{ fill: "var(--red)", stroke: "none" }} />
      </svg>
    ),
  },
  {
    title: "Chopp gelado & petiscos",
    description: "Boa companhia enquanto sua moto é atendida.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M6 8h10v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" />
        <path d="M16 10h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
        <path d="M6 8c0-2 1.2-3 1.2-4.4M9.4 8c0-2 1.2-3 1.2-4.4" style={{ stroke: "var(--red)" }} />
      </svg>
    ),
  },
  {
    title: "Itens para moto",
    description: "Produtos e itens para sua moto.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M4 14a8 8 0 0116 0v2a2 2 0 01-2 2h-1v-3a1 1 0 00-1-1H8a1 1 0 00-1 1v3H6a2 2 0 01-2-2v-2z" />
        <path d="M9 12h6" style={{ stroke: "var(--red)" }} />
      </svg>
    ),
  },
  {
    title: "Acessórios",
    description: "Praticidade e estilo para sua moto.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <circle cx="7" cy="13" r="3.2" />
        <circle cx="17" cy="13" r="3.2" />
        <path d="M10.2 12h3.6" />
        <path d="M3.8 12L2 10M20.2 12L22 10" style={{ stroke: "var(--red)" }} />
      </svg>
    ),
  },
];

export function SFCard() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  useCardTilt(stageRef, cardRef);

  return (
    <section className="section" id="cartao">
      <Reveal className="cartao-head">
        <span className="eyebrow">SF Motos / Lifestyle</span>
        <h2 className="cartao-title">Cartão <span className="accent">SF Motos</span></h2>
        <p className="cartao-sub">
          Tudo o que você precisa para sua moto e para curtir o momento, em um só lugar.
        </p>
      </Reveal>

      <div className="cartao-stage" ref={stageRef}>
        <div className="sfcard cursor-hover-target" ref={cardRef}>
          <div className="sfcard-sheen" />
          <div className="sfcard-pattern" aria-hidden="true" />
          <div className="sfcard-top">
            <Image src="/imgs/logo-sf.png" alt="" className="sfcard-logo" width={46} height={46} />
            <span className="sfcard-medal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
                <circle cx="12" cy="12" r="3.4" />
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
              </svg>
            </span>
          </div>
          <div className="sfcard-body">
            <b>SF · MOTOS</b>
            <span>Oficina · Lifestyle · Motos</span>
          </div>
          <div className="sfcard-bottom">
            <span className="eyebrow">Cartão SF Motos</span>
          </div>
        </div>
      </div>

      <Reveal className="cartao-support">
        Na SF Motos, você encontra muito mais do que uma oficina. Tenha por perto tudo o que faz
        parte da experiência de quem vive o mundo das duas rodas.
      </Reveal>

      <div className="cartao-cats">
        {CATEGORIES.map((cat, i) => (
          <Reveal key={cat.title} delayMs={i * 80} className="cartao-cat">
            <span className="icon" aria-hidden="true">{cat.icon}</span>
            <b>{cat.title}</b>
            <p>{cat.description}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="cartao-cta-wrap">
        <a href="#contact" className="btn-primary cursor-hover-target">Conheça o Cartão SF Motos</a>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 7: Verificar manualmente**

Comparar com o site atual: tilt seguindo o mouse, reflexo (`--sheen-x/y`), inclinação reduzida no mobile, grid 2×2 no mobile.

- [ ] **Step 8: Commit**

```bash
git add hooks/useCardTilt.ts hooks/useCardTilt.test.ts components/SFCard.tsx styles/cartao.css app/globals.css
git commit -m "feat: port Cartão SF Motos 3D tilt section"
```

---

### Task 17: `CtaFinal` + `Footer`

**Files:**
- Create: `components/CtaFinal.tsx`
- Create: `components/Footer.tsx`
- Create: `styles/cta-footer.css`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `<CtaFinal />` (seção `#contact`), `<Footer />`.

- [ ] **Step 1: Criar `styles/cta-footer.css`** com o conteúdo exato abaixo (`.btn-dark` já existe em `styles/base.css`, Task 2 — não repetir aqui):

```css
.cta-band{background:radial-gradient(ellipse 120% 100% at 25% 0%, var(--red) 0%, var(--red-dark) 100%);
  color:var(--black);padding:130px 6vw;text-align:center;position:relative;overflow:hidden;}
.cta-band .section-fade.top{background:linear-gradient(to bottom, var(--black), var(--red));}
.cta-band .section-fade.bottom{background:linear-gradient(to bottom, var(--red-dark), var(--black));}
.cta-watermark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:'Oswald',sans-serif;
  font-weight:700;font-size:min(46vw,620px);color:rgba(13,13,13,.06);letter-spacing:.02em;pointer-events:none;
  white-space:nowrap;line-height:1;z-index:0;}
.cta-inner{position:relative;z-index:2;max-width:760px;margin:0 auto;}
.cta-band .eyebrow{color:rgba(13,13,13,.6);justify-content:center;}
.cta-band .eyebrow::before{background:var(--black);}
.cta-band h2{color:var(--black);font-size:clamp(2.2rem,5.4vw,3.8rem);margin:18px 0 18px;}
.cta-band p{font-weight:400;color:rgba(13,13,13,.75);margin-bottom:36px;font-size:1.05rem;}

footer{padding:60px 6vw 40px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:24px;
  font-family:'JetBrains Mono',monospace;font-size:.75rem;color:var(--gray);border-top:1px solid var(--line);}
footer .logo-mark{margin-bottom:8px;font-family:'Oswald',sans-serif;font-weight:600;font-size:1.15rem;letter-spacing:.06em;color:var(--white);}
footer .foot-links{display:flex;gap:22px;}
footer .foot-links a{opacity:.7;transition:opacity .2s;}
footer .foot-links a:hover{opacity:1;color:var(--red);}
```

- [ ] **Step 2: Implementar `components/CtaFinal.tsx`**

```tsx
const WHATSAPP_URL = "https://wa.me/5524999170017?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20SF%20Motos.";

export function CtaFinal() {
  return (
    <section className="cta-band" id="contact">
      <div className="section-fade top" />
      <div className="section-fade bottom" />
      <span className="cta-watermark" aria-hidden="true">SF</span>
      <div className="cta-inner">
        <span className="eyebrow">Fale com a oficina</span>
        <h2>Sua moto merece<br />manutenção de verdade</h2>
        <p>Fale com a oficina agora pelo WhatsApp</p>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-dark cursor-hover-target">
          Chamar no WhatsApp
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Implementar `components/Footer.tsx`**

```tsx
import Image from "next/image";

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
      <div>&copy; {new Date().getFullYear()} SF Motos Alta Performance</div>
    </footer>
  );
}
```

- [ ] **Step 4: Verificar manualmente**

Comparar com o site atual: faixa vermelha do CTA, watermark "SF" de fundo, botão de WhatsApp funcionando, footer com logo, links e ano atual.

- [ ] **Step 5: Commit**

```bash
git add components/CtaFinal.tsx components/Footer.tsx styles/cta-footer.css app/globals.css
git commit -m "feat: port CTA final and footer"
```

---

### Task 18: `app/layout.tsx` + `app/page.tsx` — integração final

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: todos os componentes das Tasks 6–17.

- [ ] **Step 1: Implementar `app/layout.tsx`** (fontes via `next/font/google`, metadata, JSON-LD, `CustomCursor` montado uma vez):

```tsx
import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import { CustomCursor } from "@/components/CustomCursor";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-oswald" });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "SF Motos Alta Performance | Oficina de Moto de Alta Performance em Resende - RJ",
  description:
    "SF Motos Alta Performance: oficina especializada em motos de alta cilindrada em Resende, RJ. Tecnologia, honestidade e transparência em cada atendimento.",
  themeColor: "#0D0D0D",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: "SF Motos Alta Performance",
  description: "Oficina especializada em motos de alta performance e alto padrão em Resende, RJ. Tecnologia, honestidade e transparência.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "R. Dalva Menandro, 34 - Comercial",
    addressLocality: "Resende",
    addressRegion: "RJ",
    postalCode: "27541-180",
    addressCountry: "BR",
  },
  openingHours: "Mo-Sa 08:00-18:00",
  aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", bestRating: "5" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
```

Ajustar `styles/base.css` (Task 2) para usar as variáveis de fonte do Next em vez do link do Google Fonts:

```css
body{font-family: var(--font-inter), sans-serif; /* ...resto igual */ }
h1,h2,h3{font-family: var(--font-oswald), sans-serif; /* ...resto igual */ }
.eyebrow{font-family: var(--font-jetbrains), monospace; /* ...resto igual */ }
```//E repetir a troca de `font-family` em todo lugar do CSS portado que hoje referencia `'Oswald'`, `'Inter'` ou `'JetBrains Mono'` diretamente (busca e substitui nos arquivos de `styles/`).

- [ ] **Step 2: Implementar `app/page.tsx`**

```tsx
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Processes } from "@/components/Processes";
import { PrecisionVideo } from "@/components/PrecisionVideo";
import { Services } from "@/components/Services";
import { GarageExperience } from "@/components/GarageExperience";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { Location } from "@/components/Location";
import { SFCard } from "@/components/SFCard";
import { CtaFinal } from "@/components/CtaFinal";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Processes />
      <PrecisionVideo />
      <Services />
      <GarageExperience />
      <BeforeAfterGallery />
      <Location />
      <SFCard />
      <CtaFinal />
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Build de produção**

Run: `npm run build && npm run start`
Expected: build sem erros, site funcional em `http://localhost:3000`.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx styles/
git commit -m "feat: assemble full page and wire up fonts/metadata in root layout"
```

---

### Task 19: Verificação completa lado a lado

**Files:** nenhum arquivo novo — task de QA manual.

- [ ] **Step 1: Rodar `npm run build && npm run start`** e abrir `http://localhost:3000` ao lado de `https://thaian-lq.github.io/sf-motos/` em outra aba.

- [ ] **Step 2: Percorrer o checklist do spec, em desktop (1440px), tablet (834px) e mobile (390px):**
  - Visual de cada seção idêntico ao original.
  - Cursor customizado (triângulo) segue o mouse e reage a hover; some com `prefers-reduced-motion`.
  - Hero: crossfade de texto e frames do vídeo acompanham o scroll sem travar; scroll cue e end-fade funcionam.
  - "Precisão que se nota": mesmo comportamento, texto alinhado à direita.
  - Timeline de Processos preenche progressivamente.
  - Grid de Serviços: card featured com selo TEXA, card "Socorro & guincho" largo, responsivo em 900px/560px.
  - Galeria da oficina: composição 40/60, vídeo com play/pause/duração/pausa-ao-sair-da-viewport.
  - Slider antes/depois: mouse, touch e teclado.
  - Localização: mapa, número de WhatsApp, botões.
  - Cartão SF Motos: tilt 3D, sheen, categorias, CTA.
  - CTA final e footer.
  - Sem scroll horizontal em nenhuma largura.
  - Sem erros no console.

- [ ] **Step 3: Rodar Lighthouse** (Chrome DevTools) na build de produção local e registrar as notas de Performance/SEO/Acessibilidade para comparação futura.

- [ ] **Step 4: Corrigir qualquer divergência encontrada**, cada correção com seu próprio commit pequeno (não acumular tudo num commit único).

---

### Task 20: Deploy na Vercel e desativação do GitHub Pages

**Files:** nenhum arquivo de código — configuração de infraestrutura.

**Interfaces:** nenhuma — task final de infraestrutura.

- [ ] **Step 1: Fazer push da branch `main`**

```bash
git push origin main
```

- [ ] **Step 2: Criar o projeto na Vercel** apontando para `Thaian-lq/sf-motos`, framework preset "Next.js" (detectado automaticamente), branch de produção `main`. Aguardar o primeiro deploy e anotar a URL `*.vercel.app` gerada.

- [ ] **Step 3: Verificar o deploy de produção** com o mesmo checklist da Task 19, agora contra a URL pública da Vercel (inclusive o vídeo `amostração.mp4` com acento no nome do arquivo).

- [ ] **Step 4: Desativar o GitHub Pages** (só depois que o Step 3 confirmar que está tudo certo):

```bash
git rm .nojekyll
git commit -m "chore: remove .nojekyll now that the site is served from Vercel"
git push origin main
```

Em GitHub → Settings → Pages, mudar "Source" para "None" (ou deixar como está se o usuário pediu para manter os dois ativos por um tempo — confirmar com ele antes deste step).

- [ ] **Step 5: Reportar ao usuário** a URL final da Vercel para ele repassar ao proprietário.

---

## Self-Review

**Cobertura do spec:** estrutura de projeto (Task 1), CSS/tokens (Task 2), cada componente listado no spec tem sua task (Hero→9, Processes→10, PrecisionVideo→11, Services→12, GarageExperience→13, BeforeAfterGallery→14, Location→15, SFCard→16, CtaFinal/Footer→17, Nav→7, CustomCursor→6), motor de vídeo com scroll isolado e testado primeiro (Task 8, antes de qualquer seção que o consome), verificação lado a lado (Task 19), deploy + desativação do Pages (Task 20). Renomear `amostração.mp4` ficou como decisão em aberto no spec — mantido como está (Task 13 usa o nome original) já que o usuário não pediu a renomeação explicitamente; se preferir, é uma troca de uma linha antes da Task 20.

**Placeholders:** nenhum "TBD"/"implementar depois" restante — todo código é real e completo.

**Consistência de tipos:** `ScrubVideoProps`/`ScrubPhase` definidos uma vez em `components/ScrubVideo.tsx` e importados por `hooks/useScrubVideo.ts` (via `import type`), `Hero.tsx` e `PrecisionVideo.tsx` — mesmo formato em todo lugar. `Service` (Task 12) e `GalleryPhoto` (Task 13) usados só dentro do próprio componente que os consome. `computeClampedPercent`, `computeTilt` exportados das mesmas hooks que os usam internamente, nomes usados de forma consistente entre teste e implementação.
