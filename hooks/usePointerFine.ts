"use client";
import { useEffect, useState } from "react";

export function usePointerFine(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);

  return fine;
}
