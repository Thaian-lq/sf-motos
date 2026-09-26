# Migração do site SF Motos para Next.js + TypeScript

Data: 2026-09-26

## Contexto

O site da SF Motos Alta Performance hoje é um único arquivo `index.html` (~1500
linhas: HTML + CSS + JavaScript vanilla inline) publicado no GitHub Pages
(`thaian-lq.github.io/sf-motos`). O site já tem toda a identidade visual e o
conteúdo definidos: hero com vídeo scroll-scrubbed, timeline de processos,
segundo vídeo scroll-scrubbed, grid de 8 serviços (com selo TEXA), seção
"experiência da oficina" (galeria + vídeo), "trabalhos" com slider
antes/depois, localização (mapa + WhatsApp), seção "Cartão SF Motos" (cartão
3D com tilt), CTA final e footer. Também tem um cursor customizado (bolinha +
anel triangular) e revelação de elementos ao rolar a página.

## Objetivo

Migrar esse site para uma stack moderna e escalável — **Next.js (App Router)
+ TypeScript**, publicada na **Vercel** — preservando exatamente a aparência
e o comportamento atuais. Esta é uma migração 1:1, não uma reforma: nenhuma
seção nova, nenhum texto ou preço inventado, nenhuma mudança de design.
Crescimento futuro (novas páginas, CMS, etc.) fica para projetos seguintes.

## Decisões já tomadas com o usuário

- Stack: Next.js 15 (App Router) + TypeScript, escolhida sobre Vite+React SPA
  e Astro por causa do SEO (o site já usa `schema.org/AutoRepair`) e da
  integração nativa com a Vercel.
- Deploy: Vercel, conectada ao mesmo repositório GitHub
  (`Thaian-lq/sf-motos`). Sem domínio próprio por enquanto — usa o
  subdomínio `*.vercel.app`.
- Conteúdo continua editado só via código (sem CMS, sem painel para o
  proprietário).
- Escopo: só migração fiel do que já existe, sem novas seções/páginas.
- O GitHub Pages atual é desligado depois que o novo site estiver no ar na
  Vercel (a menos que o usuário peça para manter os dois ativos por um
  tempo, para comparação).

## Estrutura do projeto

```
app/
  layout.tsx        # <html>, fontes via next/font, <head> (title, meta, JSON-LD)
  page.tsx           # monta as seções na ordem atual
  globals.css        # tokens (:root), reset, utilitários compartilhados (.eyebrow, .btn-primary, etc.)
components/
  Nav.tsx
  CustomCursor.tsx
  Hero.tsx
  Processes.tsx
  PrecisionVideo.tsx
  Services.tsx
  GarageExperience.tsx
  BeforeAfterGallery.tsx
  Location.tsx
  SFCard.tsx
  CtaFinal.tsx
  Footer.tsx
  ScrubVideo.tsx
hooks/
  useScrubVideo.ts
  useReveal.ts
  usePointerFine.ts
  useReducedMotion.ts
data/
  services.ts
  gallery.ts
public/
  imgs/, video/
```

Cada seção vira um componente isolado. Conteúdo repetitivo (os 8 serviços,
as 5 fotos da galeria) vira array tipado em `data/`, renderizado via
`.map()`, em vez de HTML copiado várias vezes.

## Assets

- `imgs/` → `public/imgs/`, `video/` → `public/video/`, mesmos arquivos.
- Sugestão (a confirmar): renomear `video/amostração.mp4` para
  `video/oficina.mp4` (sem acento), por segurança de portabilidade — não é
  obrigatório, já funciona hoje no GitHub Pages.

## CSS

Port quase literal do CSS já existente (tokens em `:root`, classes como
`.section`, `.service-card`, `.sfcard`), como CSS global do Next.js,
reorganizado em arquivos por seção (`styles/hero.css`,
`styles/services.css`, etc.) em vez de um arquivo único. Sem reescrita em
Tailwind ou CSS-in-JS nesta migração — isso ficaria registrado como possível
melhoria futura, não agora, para não arriscar mudar a aparência.

## O motor de vídeo com scroll (`useScrubVideo`)

Peça de maior risco da migração. Hoje: o vídeo é decodificado uma vez em
frames (`ImageBitmap`) desenhados num `<canvas>`; o scroll escolhe o frame a
mostrar (sem seek ao vivo, sem travar). Há um modo de fallback por seek
direto para navegadores sem `requestVideoFrameCallback`, tratamento de erro,
e lazy-load do `<source>` via `IntersectionObserver`.

Port planejado: mesma lógica, adaptada para `useEffect`/`useRef` em vez de
`document.getElementById`. Um componente `<ScrubVideo>` reutilizável recebe
a configuração (src, número de frames, textos de cada fase) como props —
Hero e "Precisão que se nota" reaproveitam o mesmo hook, como hoje
reaproveitam a mesma função `createVideoScrub`.

## Outras peças interativas a portar

- Cursor customizado (bolinha vermelha + anel triangular, reage a
  hover/drag).
- Reveal genérico ao rolar (`[data-reveal]` → hook `useReveal` baseado em
  `IntersectionObserver`).
- Slider antes/depois (Trabalhos): pointer events, teclado (setas),
  `aria-valuenow`.
- Vídeo da oficina (garagem): play/pause manual, duração lida do próprio
  arquivo, pausa ao sair da viewport, sem autoplay com áudio.
- Tilt 3D + reflexo de luz do Cartão SF Motos, seguindo o mouse.
- Nav: estado "scrolled", menu mobile.
- `prefers-reduced-motion`: desativa reveals, tilt e crossfade de vídeo,
  igual a hoje.

## Verificação

Depois de cada seção portada, comparação lado a lado com o site atual
(`thaian-lq.github.io/sf-motos`) em desktop, tablet e mobile: visual,
cursor customizado, os dois vídeos com scroll, vídeo da oficina, slider
antes/depois, tilt do cartão, `prefers-reduced-motion`, links de WhatsApp,
sem erros de console, sem scroll horizontal. O motor de vídeo
(`useScrubVideo`) é testado isoladamente primeiro, antes de seguir para o
resto, por ser a parte mais delicada.

## Deploy

Projeto Vercel novo, conectado ao repositório `Thaian-lq/sf-motos` (branch
`main`). Vercel builda a cada push. URL inicial: subdomínio
`*.vercel.app`. Domínio próprio fica para quando o usuário tiver um.

O `index.html` estático sai da raiz do repo (continua no histórico do Git).
O GitHub Pages é desligado (remoção do `.nojekyll` e da configuração em
Settings → Pages) depois que o site novo estiver confirmado no ar — a menos
que o usuário peça para manter os dois no ar por um tempo.

## Fora de escopo (para depois, não agora)

- Novas páginas ou seções.
- CMS ou painel de edição para o proprietário.
- Domínio próprio.
- Reescrita do CSS em Tailwind/CSS-in-JS.
- Formulário de contato com backend real (hoje é só link de WhatsApp).
