"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Nav, PageName } from "../nav";
import Icon from "./Icon";

type PanelKind = "panel" | "secretary" | "admin";

const CONFIG: Record<PanelKind, { title: string; sub: string; icon: string; grad: string }> = {
  panel: { title: "پنل پزشک", sub: "بخش پزشک", icon: "chart", grad: "from-cyan-500 to-blue-600" },
  secretary: { title: "پنل منشی", sub: "بخش منشی مطب", icon: "user", grad: "from-teal-500 to-emerald-600" },
  admin: { title: "پنل مدیر سیستم", sub: "مدیریت سامانه", icon: "shield", grad: "from-slate-700 to-slate-900" },
};

const SWITCH: { p: PanelKind; icon: string; label: string }[] = [
  { p: "panel", icon: "chart", label: "پنل پزشک" },
  { p: "secretary", icon: "user", label: "پنل منشی" },
  { p: "admin", icon: "shield", label: "پنل مدیر سیستم" },
];

export default function PanelHeader({ page, navigate }: { page: PageName; navigate: Nav }) {
  const kind = (["panel", "secretary", "admin"].includes(page) ? page : "panel") as PanelKind;
  const cfg = CONFIG[kind];
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`bg-gradient-to-l ${cfg.grad} text-white shadow-lg`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          {/* brand */}
          <button onClick={() => navigate("home")} data-cursor="hover" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white">
                <path fill="currentColor" d="M10.5 2h3a1 1 0 0 1 1 1V8h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5v8a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-8h-5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1z" />
              </svg>
            </span>
            <div className="text-right leading-tight">
              <div className="text-base font-extrabold">نوبان</div>
              <div className="text-[10px] text-white/80">{cfg.title}</div>
            </div>
          </button>

          {/* center title (desktop) */}
          <div className="hidden items-center gap-2 lg:flex">
            <Icon name={cfg.icon} className="h-5 w-5 text-white/90" />
            <span className="text-sm font-bold">{cfg.sub}</span>
          </div>

          {/* actions */}
          <div className="flex items-center gap-2">
            <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
              <button onClick={() => setOpen((o) => !o)} data-cursor="hover" className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/30">
                <Icon name="grid" className="h-4 w-4" />
                <span className="hidden sm:inline">پنل‌ها</span>
                <Icon name="arrow" className={`h-3 w-3 rotate-90 transition ${open ? "-rotate-90" : ""}`} />
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }} className="absolute left-0 top-full z-50 w-48 pt-2">
                    <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-200">
                      {SWITCH.map((it) => (
                        <button key={it.p} onClick={() => { navigate(it.p); setOpen(false); }} data-cursor="hover" className={`flex w-full items-center gap-2.5 rounded-xl p-2.5 text-right transition ${kind === it.p ? "bg-cyan-50" : "hover:bg-slate-50"}`}>
                          <span className={`grid h-8 w-8 place-items-center rounded-lg text-white ${it.p === "panel" ? "bg-gradient-to-br from-cyan-500 to-blue-600" : it.p === "secretary" ? "bg-gradient-to-br from-teal-500 to-emerald-600" : "bg-gradient-to-br from-slate-700 to-slate-900"}`}><Icon name={it.icon} className="h-4 w-4" /></span>
                          <span className="text-sm font-bold text-slate-700">{it.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => navigate("home")} data-cursor="hover" className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/30">
              <Icon name="logout" className="h-4 w-4" />
              <span className="hidden sm:inline">بازگشت به سایت</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
