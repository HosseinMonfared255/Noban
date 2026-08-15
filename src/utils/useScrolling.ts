"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` while the user is actively scrolling, and `false` a short time
 * after scrolling stops. Used to pause expensive effects (lens backdrop,
 * WebGL canvas) during scroll for a smooth 60fps experience.
 */
export function useScrolling(delay = 140): boolean {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(t);
      t = setTimeout(() => setScrolling(false), delay);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, [delay]);

  return scrolling;
}
