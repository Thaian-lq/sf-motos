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
