"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../store/theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Ensure class is applied on mount
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const isDark = mounted && theme === "dark";

  return (
    <button
      onClick={toggle}
      data-cursor="hover"
      aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تیره"}
      className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white/70 backdrop-blur transition hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800/70 ${className}`}
    >
      <motion.div
        key={isDark ? "moon" : "sun"}
        initial={{ y: 20, opacity: 0, rotate: -90 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: -20, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        {isDark ? (
          // Moon icon
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-cyan-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          // Sun icon
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-amber-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </motion.div>
    </button>
  );
}
