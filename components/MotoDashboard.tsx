"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { usePointerFine } from "@/hooks/usePointerFine";
import { dialPoint, rpmToAngle, TACH_MAX_RPM, TACH_REDLINE_RPM, TACH_SWEEP } from "@/lib/tach";

interface Indicator {
  name: string;
  description: string;
  icon: ReactNode;
}

// Cada luz-espia do painel é uma coisa que o cliente encontra na SF Motos;
// a posição na fileira é a marcha que ela engata no display.
const INDICATORS: Indicator[] = [
  {
    name: "Oficina",
    description: "Manutenção e cuidados para sua moto.",
    icon: (
      <path d="M14.5 6.5a3.5 3.5 0 10-4.9 4.9L4 17l3 3 6.4-6.4a3.5 3.5 0 004.9-4.9l-2.3 2.3-2-.5-.5-2 2.3-2.3z" />
    ),
  },
  {
    name: "Cerveja",
    description: "Um espaço para parar, relaxar e aproveitar.",
    icon: (
      <>
        <path d="M6 8h10v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" />
        <path d="M16 10h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
        <path d="M6 8c0-2 1.2-3 1.2-4.4M9.4 8c0-2 1.2-3 1.2-4.4" />
      </>
    ),
  },
  {
    name: "Petiscos",
    description: "Para acompanhar a resenha.",
    icon: (
      <>
        <path d="M3 16h18" />
        <path d="M5 16a7 7 0 0114 0" />
        <path d="M12 7v2" />
        <path d="M5 19h14" />
      </>
    ),
  },
  {
    name: "Itens para moto",
    description: "Produtos e itens para sua moto.",
    icon: (
      <>
        <path d="M4 10h9l3 3v6H4z" />
        <path d="M16 13l4-3" />
        <path d="M8 10V7h3v3" />
        <path d="M20 16.5c0 .8-.5 1.5-1 1.5s-1-.7-1-1.5.5-1.5 1-2c.5.5 1 1.2 1 2z" />
      </>
    ),
  },
  {
    name: "Acessórios",
    description: "Estilo e praticidade para sua moto.",
    icon: (
      <>
        <path d="M4 14a8 8 0 0116 0v2a2 2 0 01-2 2h-1v-3a1 1 0 00-1-1H8a1 1 0 00-1 1v3H6a2 2 0 01-2-2v-2z" />
        <path d="M9 11h7" />
      </>
    ),
  },
];

const IDLE_RPM = 1200;
/** Cada marcha engatada sobe o giro um pouco; a quinta encosta na faixa vermelha. */
const rpmForGear = (gear: number) => (gear === 0 ? IDLE_RPM : 2200 + gear * 1500);
/** Amplitude do “respiro” do ponteiro com o mouse, em rpm. */
const WOBBLE_RPM = 350;

function Tachometer({ needleRef }: { needleRef: React.RefObject<SVGGElement | null> }) {
  const cx = 150, cy = 150;
  const ticks = [];
  for (let rpm = 0; rpm <= TACH_MAX_RPM; rpm += 500) {
    const major = rpm % 1000 === 0;
    const a = rpmToAngle(rpm);
    const [x1, y1] = dialPoint(cx, cy, major ? 104 : 110, a);
    const [x2, y2] = dialPoint(cx, cy, 120, a);
    const red = rpm >= TACH_REDLINE_RPM;
    ticks.push(
      <line key={`t${rpm}`} x1={x1} y1={y1} x2={x2} y2={y2}
        className={`tach-tick${major ? " major" : ""}${red ? " red" : ""}`} />
    );
    if (major) {
      const [tx, ty] = dialPoint(cx, cy, 86, a);
      ticks.push(
        <text key={`n${rpm}`} x={tx} y={ty} className={`tach-num${red ? " red" : ""}`}
          textAnchor="middle" dominantBaseline="central">{rpm / 1000}</text>
      );
    }
  }
  const [rx1, ry1] = dialPoint(cx, cy, 127, rpmToAngle(TACH_REDLINE_RPM));
  const [rx2, ry2] = dialPoint(cx, cy, 127, rpmToAngle(TACH_MAX_RPM));
  const [ax1, ay1] = dialPoint(cx, cy, 127, -TACH_SWEEP / 2);

  return (
    <svg className="dash-tach" viewBox="0 0 300 300" aria-hidden="true">
      <defs>
        <radialGradient id="tachFace" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#232323" />
          <stop offset="100%" stopColor="#0D0D0D" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r="142" className="tach-bezel" />
      <circle cx={cx} cy={cy} r="134" fill="url(#tachFace)" className="tach-face" />
      <path d={`M ${ax1} ${ay1} A 127 127 0 1 1 ${rx2} ${ry2}`} className="tach-arc" />
      <path d={`M ${rx1} ${ry1} A 127 127 0 0 1 ${rx2} ${ry2}`} className="tach-redline" />
      {ticks}
      <text x={cx} y="206" textAnchor="middle" className="tach-unit">x1000 r/min</text>
      <g ref={needleRef} className="tach-needle" style={{ transform: `rotate(${rpmToAngle(IDLE_RPM)}deg)` }}>
        <path d={`M ${cx - 3} ${cy + 18} L ${cx - 1.2} ${cy - 112} L ${cx + 1.2} ${cy - 112} L ${cx + 3} ${cy + 18} Z`} />
      </g>
      <circle cx={cx} cy={cy} r="15" className="tach-hub" />
      <circle cx={cx} cy={cy} r="4" className="tach-hub-dot" />
    </svg>
  );
}

function BikeBlueprint() {
  return (
    <svg className="dash-blueprint" viewBox="0 0 1200 640" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <g className="bp-lines">
        {[300, 960].map((x) => (
          <g key={x}>
            <circle cx={x} cy="430" r="150" />
            <circle cx={x} cy="430" r="126" />
            <circle cx={x} cy="430" r="72" className="bp-dash" />
            <circle cx={x} cy="430" r="18" />
            <line x1={x - 175} y1="430" x2={x + 175} y2="430" className="bp-center" />
            <line x1={x} y1="255" x2={x} y2="605" className="bp-center" />
          </g>
        ))}
        <path d="M300 430 L548 382 L560 350" />
        <path d="M530 300 L712 300 L735 350 L716 440 L560 446 L520 392 Z" />
        <path d="M600 222 Q700 168 822 196 L806 272 L616 282 Z" />
        <path d="M612 236 L420 250 L330 226 L352 258 L440 284 L610 270" />
        <path d="M566 300 L822 210 M760 232 L706 420" />
        <path d="M818 176 L962 430 M834 170 L978 426" />
        <path d="M800 170 L850 150 L872 158" />
        <path d="M852 176 Q934 162 954 236 L886 262 Z" />
        <path d="M600 448 Q520 432 392 404 L374 380 L396 372 L520 398" />
      </g>
      <g className="bp-dims">
        <line x1="300" y1="612" x2="960" y2="612" />
        <line x1="300" y1="598" x2="300" y2="626" />
        <line x1="960" y1="598" x2="960" y2="626" />
        <text x="630" y="604" textAnchor="middle">1.460 mm</text>
        <line x1="1110" y1="150" x2="1110" y2="580" />
        <line x1="1096" y1="150" x2="1124" y2="150" />
        <line x1="1096" y1="580" x2="1124" y2="580" />
        <text x="1122" y="370" transform="rotate(-90 1122 370)" textAnchor="middle">1.120 mm</text>
        <text x="300" y="250" textAnchor="middle">R 190/55</text>
        <text x="960" y="250" textAnchor="middle">F 120/70</text>
      </g>
    </svg>
  );
}

export function MotoDashboard() {
  const [active, setActive] = useState<number | null>(null);
  const gear = active === null ? 0 : active + 1;
  const needleRef = useRef<SVGGElement>(null);
  const wobbleRef = useRef(0);
  const gearRef = useRef(gear);
  const hasFinePointer = usePointerFine();

  function applyNeedle() {
    const needle = needleRef.current;
    if (!needle) return;
    const rpm = rpmForGear(gearRef.current) + wobbleRef.current;
    needle.style.transform = `rotate(${rpmToAngle(rpm)}deg)`;
  }

  useEffect(() => {
    gearRef.current = gear;
    applyNeedle();
  }, [gear]);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!hasFinePointer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - rect.left) / rect.width - 0.5;
    wobbleRef.current = t * 2 * WOBBLE_RPM;
    applyNeedle();
  }

  function onPointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    wobbleRef.current = 0;
    // No toque, o navegador dispara pointerleave ao levantar o dedo: manter a luz tocada acesa.
    if (e.pointerType !== "touch") setActive(null);
    applyNeedle();
  }

  function onBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null);
  }

  const current = active === null ? null : INDICATORS[active];

  return (
    <section className="section dash-section" id="experiencia">
      <BikeBlueprint />

      <Reveal className="dash-head">
        <span className="eyebrow">SF Motos / Experiência</span>
        <h2 className="dash-title">Muito mais que uma oficina.</h2>
        <p className="dash-sub">Tudo para sua moto. E tudo para você.</p>
        <p className="dash-support">
          Na SF Motos, a experiência vai além da manutenção. Cuide da sua moto, encontre o que
          precisa e aproveite o ambiente.
        </p>
      </Reveal>

      <div className="dash-stage">
        <div
          className="dash-cluster"
          data-testid="cluster"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onBlur={onBlur}
        >
          <div className="dash-telltales" role="group" aria-label="Indicadores do painel">
            {INDICATORS.map((ind, i) => (
              <button
                key={ind.name}
                type="button"
                className="dash-telltale cursor-hover-target"
                aria-label={ind.name}
                aria-pressed={active === i}
                aria-controls="dash-display"
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ind.icon}
                </svg>
                <span aria-hidden="true">{ind.name}</span>
              </button>
            ))}
          </div>

          <div className="dash-body">
            <div className="dash-tach-wrap">
              <Tachometer needleRef={needleRef} />
            </div>

            <div className="dash-tft" id="dash-display">
              <div className="tft-bar">
                <span>SF MOTOS</span>
                <span>Resende RJ</span>
              </div>
              <div className="tft-main">
                <div className="tft-info" role="status" aria-live="polite" key={active ?? "idle"}>
                  {current ? (
                    <>
                      <b className="tft-title">{current.name}</b>
                      <p className="tft-text">{current.description}</p>
                    </>
                  ) : (
                    <>
                      <b className="tft-title idle">Ignição ligada</b>
                      <p className="tft-text">Escolha um indicador para ver o que te espera na SF Motos.</p>
                    </>
                  )}
                </div>
                <div className={`tft-gear${gear ? " engaged" : ""}`}>
                  <span className="tft-gear-label">Marcha</span>
                  <span className="tft-gear-value" data-testid="gear">{gear ? gear : "N"}</span>
                </div>
              </div>
              <div className="tft-bar">
                <span>ODO 002026 km</span>
                <span>Seg a sáb, 08h às 18h</span>
              </div>
            </div>

            <div className="dash-fuel" aria-hidden="true">
              <span className="fuel-mark">F</span>
              <div className="fuel-bars">
                {Array.from({ length: 6 }, (_, i) => <i key={i} />)}
              </div>
              <span className="fuel-mark">E</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="fuel-icon">
                <path d="M5 20V5a1 1 0 011-1h7a1 1 0 011 1v15M4 20h11M14 9h2a2 2 0 012 2v5a1.5 1.5 0 003 0V9l-3-3" />
                <path d="M7 8h5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-cta">
        <a href="#location" className="btn-primary cursor-hover-target">Conheça a SF Motos</a>
      </div>
    </section>
  );
}
