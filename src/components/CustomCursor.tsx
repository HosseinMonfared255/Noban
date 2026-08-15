"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Variant = "default" | "hover";

/**
 * A lightweight glowing medical-cross cursor.
 * PERFORMANCE OPTIMIZED:
 * - Replaced 6 framer-motion springs with direct style updates via rAF
 * - Removed 3D tilt computation (saved useMotionValueEvent + 2 springs)
 * - Removed click ripples (saved motion elements per click)
 * - Throttled mousemove with requestAnimationFrame
 * - Uses CSS transitions for smooth follow instead of JS springs
 */
export default function CustomCursor() {
  const [variant, setVariant] = useState<Variant>("default");
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const isTouch =
      window.matchMedia("(hover: none)").matches ||
      "ontouchstart" in window;
    if (isTouch) return;

    // Use rAF-throttled mousemove for smooth 60fps without JS spring overhead
    const move = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      setVisible(true);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updatePositions);
      }

      const el = e.target as HTMLElement | null;
      const interactive = el?.closest(
        'a, button, [role="button"], input, textarea, select, label, [data-cursor]'
      ) as HTMLElement | null;
      setVariant(interactive ? "hover" : "default");
    };

    const updatePositions = () => {
      rafRef.current = 0;
      // Ring follows with lag (lerp)
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.18;

      if (crossRef.current) {
        crossRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Continue rAF if ring hasn't caught up
      const dx = Math.abs(pos.current.x - ringPos.current.x);
      const dy = Math.abs(pos.current.y - ringPos.current.y);
      if (dx > 0.5 || dy > 0.5) {
        rafRef.current = requestAnimationFrame(updatePositions);
      }
    };

    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isHover = variant === "hover";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity .25s",
      }}
    >
      {/* Outer lazy ring */}
      <div
        ref={ringRef}
        style={{
          transform: "translate3d(-100px, -100px, 0)",
          willChange: "transform",
        }}
        className="absolute left-0 top-0"
      >
        <div
          className="relative h-10 w-10 rounded-full border border-cyan-300/60 transition-transform duration-200"
          style={{
            transform: isHover ? "scale(1.7)" : "scale(1)",
            boxShadow: "0 0 18px rgba(34,211,238,.4) inset",
          }}
        />
      </div>

      {/* Inner medical cross */}
      <div
        ref={crossRef}
        style={{
          transform: "translate3d(-100px, -100px, 0)",
          willChange: "transform",
        }}
        className="absolute left-0 top-0"
      >
        <div
          className="relative h-7 w-7 drop-glow transition-transform duration-150"
          style={{
            transform: isHover ? "scale(0.6)" : "scale(1)",
          }}
        >
          {/* soft glow halo */}
          <div
            className="absolute inset-0 -z-10 scale-150 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(8,145,178,.4) 0%, rgba(8,145,178,0) 70%)",
            }}
          />
          {/* the cross */}
          <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
            <defs>
              <linearGradient id="crossFace" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="45%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0e7490" />
              </linearGradient>
            </defs>
            <rect x="38" y="8" width="30" height="84" rx="9" fill="url(#crossFace)" />
            <rect x="8" y="38" width="84" height="30" rx="9" fill="url(#crossFace)" />
            <rect x="42" y="12" width="9" height="78" rx="4.5" fill="#ffffff" opacity="0.35" />
            <rect x="12" y="42" width="78" height="9" rx="4.5" fill="#ffffff" opacity="0.18" />
          </svg>
        </div>
      </div>
    </div>
  );
}
