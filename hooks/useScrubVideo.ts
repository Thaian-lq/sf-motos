"use client";
import { RefObject, useEffect, useRef } from "react";
import { clamp, smoothstep } from "@/lib/math";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ScrubVideoProps } from "@/components/ScrubVideo";

interface ScrubVideoRefs {
  wrapperRef: RefObject<HTMLDivElement | null>;
  videoWrapRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  phaseRefs: [RefObject<HTMLDivElement | null>, RefObject<HTMLDivElement | null>];
  cueRef: RefObject<HTMLDivElement | null>;
  cueFillRef: RefObject<HTMLDivElement | null>;
  endFadeRef: RefObject<HTMLDivElement | null>;
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
