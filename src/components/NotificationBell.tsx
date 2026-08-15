"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppointments } from "../store/appointments";
import type { Nav } from "../nav";
import Icon from "./Icon";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

export default function NotificationBell({
  navigate,
  className = "",
}: {
  navigate: Nav;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const items = useAppointments((s) => s.items);
  const upcoming = useMemo(
    () => items.filter((x) => x.status === "upcoming"),
    [items]
  );

  // Derive "reminders" — for demo, all upcoming appointments are reminders
  const reminders = upcoming.slice(0, 5);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        data-cursor="hover"
        aria-label="اعلان‌ها"
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-600 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/70"
      >
        <Icon name="bell" className="h-5 w-5" />
        {reminders.length > 0 && (
          <motion.span
            key={reminders.length}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 px-1 text-[10px] font-black text-white shadow-md"
          >
            {toFa(reminders.length)}
          </motion.span>
        )}
        {reminders.length > 0 && (
          <span className="absolute -right-0.5 top-1.5 h-2 w-2 animate-ping rounded-full bg-amber-400" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 w-80 pt-2"
          >
            <div className="overflow-hidden rounded-2xl glass shadow-2xl">
              {/* header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Icon name="bell" className="h-4 w-4 text-cyan-600" />
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                    اعلان‌ها
                  </span>
                </div>
                {reminders.length > 0 && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-900/20">
                    {toFa(reminders.length)} جدید
                  </span>
                )}
              </div>

              {/* body */}
              {reminders.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-300 dark:bg-slate-700">
                    <Icon name="bell" className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                    اعلانی وجود ندارد
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    نوبت‌های پیش‌رو اینجا نمایش داده می‌شوند
                  </p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto p-2">
                  {reminders.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => {
                        setOpen(false);
                        navigate("appointments");
                      }}
                      data-cursor="hover"
                      className="flex w-full items-start gap-3 rounded-xl p-2.5 text-right transition hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                        <Icon name="calendar" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          یادآوری نوبت
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {apt.doctorName}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-cyan-600">
                          <Icon name="clock" className="h-3 w-3" />
                          {apt.dayName} · {apt.date} ساعت {toFa(apt.slot)}
                        </div>
                      </div>
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* footer */}
              {reminders.length > 0 && (
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("appointments");
                  }}
                  data-cursor="hover"
                  className="block w-full border-t border-slate-100 py-2.5 text-center text-xs font-bold text-cyan-700 transition hover:bg-cyan-50 dark:border-slate-700 dark:hover:bg-cyan-900/20"
                >
                  مشاهده همه نوبت‌ها
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
