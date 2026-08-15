"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doctors, specialties, healthTips } from "../data";
import type { Nav } from "../nav";
import Icon from "./Icon";
import { useFocusTrap } from "../utils/useFocusTrap";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

type Result = {
  type: "doctor" | "specialty" | "article";
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
};

export default function SearchOverlay({
  open,
  onClose,
  navigate,
}: {
  open: boolean;
  onClose: () => void;
  navigate: Nav;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global "/" shortcut to open (handled by parent, but Esc closes here)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo<Result[]>(() => {
    const needle = q.trim().toLowerCase();
    const out: Result[] = [];
    if (!needle) {
      // Show suggestions: top doctors + specialties
      doctors.slice(0, 4).forEach((d) =>
        out.push({
          type: "doctor",
          title: d.name,
          subtitle: `${d.specialty} • ${d.location}`,
          icon: "user",
          action: () => {
            navigate("doctor", undefined, d.name);
            onClose();
          },
        })
      );
      specialties.slice(0, 3).forEach((s) =>
        out.push({
          type: "specialty",
          title: s.name,
          subtitle: `${toFa(s.count)} پزشک متخصص`,
          icon: "stethoscope",
          action: () => {
            navigate("home", "#booking");
            onClose();
          },
        })
      );
      return out;
    }
    // Filter doctors
    doctors
      .filter(
        (d) =>
          d.name.toLowerCase().includes(needle) ||
          d.specialty.toLowerCase().includes(needle) ||
          d.location.toLowerCase().includes(needle)
      )
      .forEach((d) =>
        out.push({
          type: "doctor",
          title: d.name,
          subtitle: `${d.specialty} • ${d.location}`,
          icon: "user",
          action: () => {
            navigate("doctor", undefined, d.name);
            onClose();
          },
        })
      );
    // Filter specialties
    specialties
      .filter((s) => s.name.toLowerCase().includes(needle))
      .forEach((s) =>
        out.push({
          type: "specialty",
          title: s.name,
          subtitle: `${toFa(s.count)} پزشک متخصص`,
          icon: "stethoscope",
          action: () => {
            navigate("home", "#booking");
            onClose();
          },
        })
      );
    // Filter articles
    healthTips
      .filter(
        (t) =>
          t.title.toLowerCase().includes(needle) ||
          t.category.toLowerCase().includes(needle)
      )
      .forEach((t) =>
        out.push({
          type: "article",
          title: t.title,
          subtitle: `مجله سلامت • ${t.category}`,
          icon: "spark",
          action: () => {
            navigate("article", undefined, String(t.id));
            onClose();
          },
        })
      );
    return out;
  }, [q, navigate, onClose]);

  const typeLabel = (t: Result["type"]) =>
    t === "doctor" ? "پزشک" : t === "specialty" ? "تخصص" : "مقاله";

  const typeColor = (t: Result["type"]) =>
    t === "doctor"
      ? "bg-cyan-50 text-cyan-700"
      : t === "specialty"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-violet-50 text-violet-700";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-900/50 p-4 pt-[10vh] backdrop-blur-sm"
          aria-hidden={!open}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="جستجوی پزشک، تخصص یا مقاله"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-700">
              <Icon name="search" className="h-5 w-5 text-cyan-600" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter" && results[active]) {
                    results[active].action();
                  }
                }}
                placeholder="جستجوی پزشک، تخصص یا مقاله..."
                className="flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                data-cursor="text"
              />
              <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400 dark:border-slate-600 dark:bg-slate-700">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-700">
                    <Icon name="search" className="h-7 w-7" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                    نتیجه‌ای یافت نشد
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    عبارت دیگری را امتحان کنید
                  </p>
                </div>
              ) : (
                <>
                  {!q.trim() && (
                    <div className="px-3 py-2 text-[11px] font-bold text-slate-400">
                      پیشنهادهای سریع
                    </div>
                  )}
                  {results.map((r, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={r.action}
                      data-cursor="hover"
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-right transition ${
                        active === i
                          ? "bg-cyan-50 dark:bg-cyan-900/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
                      }`}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                        <Icon name={r.icon} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                          {r.title}
                        </div>
                        <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {r.subtitle}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${typeColor(
                          r.type
                        )}`}
                      >
                        {typeLabel(r.type)}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-400 dark:border-slate-700">
              <span className="flex items-center gap-2">
                <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 dark:border-slate-600 dark:bg-slate-700">↑↓</kbd>
                جابه‌جایی
                <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 dark:border-slate-600 dark:bg-slate-700">↵</kbd>
                انتخاب
              </span>
              <span>{toFa(results.length)} نتیجه</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
