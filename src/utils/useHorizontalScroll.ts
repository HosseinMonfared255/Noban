"use client";

import { useEffect, useRef } from "react";

/**
 * Returns a ref that converts vertical wheel scrolling into horizontal
 * scrolling while the pointer is over the element — great for horizontal
 * carousels on desktop (hover + scroll).
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  return ref;
}
