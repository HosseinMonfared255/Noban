"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFavorites } from "../store/favorites";
import { toast } from "sonner";

/**
 * A heart-shaped favorite toggle button.
 * Uses the Zustand favorites store (persisted to localStorage).
 */
export default function FavoriteButton({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const ids = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const active = ids.includes(name);

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggle(name);
        toast(active ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد", {
          description: name,
          icon: active ? "💔" : "❤️",
        });
      }}
      data-cursor="hover"
      aria-label={active ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      className={`grid place-items-center rounded-full backdrop-blur transition ${
        active
          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40"
          : "bg-white/85 text-slate-400 hover:text-rose-500"
      } ${className}`}
    >
      <AnimatePresence mode="wait">
        {active ? (
          <motion.svg
            key="filled"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            viewBox="0 0 24 24"
            className="h-full w-full p-1"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </motion.svg>
        ) : (
          <motion.svg
            key="outline"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            viewBox="0 0 24 24"
            className="h-full w-full p-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
