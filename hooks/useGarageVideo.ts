"use client";
import { RefObject, useEffect, useRef, useState } from "react";

interface GarageVideoRefs {
  wrapRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
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
