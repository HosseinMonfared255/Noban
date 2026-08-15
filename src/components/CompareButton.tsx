"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCompare } from "../store/compare";
import { toast } from "sonner";

/**
 * A "compare" toggle button — adds/removes a doctor from the comparison tray.
 */
export default function CompareButton({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const ids = useCompare((s) => s.ids);
  const toggle = useCompare((s) => s.toggle);
  const active = ids.includes(name);

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!active && ids.length >= 3) {
          toast.error("حداکثر ۳ پزشک قابل مقایسه است", {
            description: "ابتدا یک پزشک را از لیست مقایسه حذف کنید.",
            icon: "⚠️",
          });
          return;
        }
        toggle(name);
        toast(active ? "از مقایسه حذف شد" : "به مقایسه اضافه شد", {
          description: name,
          icon: active ? "➖" : "⚖️",
        });
      }}
      data-cursor="hover"
      aria-label={active ? "حذف از مقایسه" : "افزودن به مقایسه"}
      className={`grid place-items-center rounded-full backdrop-blur transition ${
        active
          ? "bg-violet-500 text-white shadow-lg shadow-violet-500/40"
          : "bg-white/85 text-slate-400 hover:text-violet-500 dark:bg-slate-800/85"
      } ${className}`}
    >
      <AnimatePresence mode="wait">
        {active ? (
          <motion.svg
            key="filled"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            viewBox="0 0 24 24"
            className="h-full w-full p-1"
            fill="currentColor"
          >
            <path d="M9 3v2H7v14h2v2H5V3h4zm10 0v18h-4v-2h2V5h-2V3h4z" />
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
            <path d="M9 3v2H7v14h2v2H5V3h4zm10 0v18h-4v-2h2V5h-2V3h4z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
