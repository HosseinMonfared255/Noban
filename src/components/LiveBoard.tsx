"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { doctors, specialties } from "../data";
import type { Nav } from "../nav";
import Icon from "./Icon";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const DAY_NAMES = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

function startSaturday(): Date {
  const t = new Date();
  const d = t.getDay();
  const add = (6 - d + 7) % 7;
  const s = new Date(t);
  s.setDate(t.getDate() + add);
  return s;
}
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long" }).format(d);

const WEEK = DAY_NAMES.map((name, i) => {
  const d = startSaturday();
  d.setDate(d.getDate() + i);
  return { name, date: fmtDate(d), isFriday: name === "جمعه" };
});

export default function LiveBoard({ navigate }: { navigate: Nav }) {
  const [step, setStep] = useState<"select" | "results">("select");
  const [spec, setSpec] = useState("همه");
  const [day, setDay] = useState<number>(1);

  const allSpecs = useMemo(
    () => ["همه", ...specialties.map((s) => s.name)],
    []
  );

  const results = useMemo(() => {
    let list = doctors;
    if (spec !== "همه") list = list.filter((d) => d.specialty === spec);
    return list.slice(0, 4);
  }, [spec]);

  const selectedDay = WEEK[day];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative w-full max-w-full overflow-hidden rounded-3xl glass p-4 shadow-2xl shadow-cyan-500/10 sm:p-5"
    >
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-blue-400/15 blur-3xl" />
      </div>

      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30">
            <Icon name="calendar" className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-black text-slate-900 dark:text-slate-100">
              رزرو سریع نوبت
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              در ۲ گام ساده نوبت بگیرید
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-600 dark:bg-cyan-900/20">
          <Icon name="clock" className="h-3 w-3" />
          کمتر از ۱ دقیقه
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === "select" ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Specialty picker */}
            <div className="mt-3 min-w-0 sm:mt-4">
              <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                تخصص پزشک
              </label>
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                {allSpecs.slice(0, 8).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpec(s)}
                    data-cursor="hover"
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      spec === s
                        ? "border-transparent bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow"
                        : "border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-300 dark:border-slate-600 dark:bg-slate-800/70"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Day picker */}
            <div className="mt-2 min-w-0 sm:mt-3">
              <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">
                روز مورد نظر
              </label>
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                {WEEK.map((d, i) => {
                  const sel = i === day;
                  const disabled = d.isFriday;
                  return (
                    <button
                      key={i}
                      disabled={disabled}
                      onClick={() => setDay(i)}
                      data-cursor={disabled ? undefined : "hover"}
                      className={`flex w-12 shrink-0 flex-col items-center rounded-lg border px-1 py-1 transition sm:w-14 sm:py-1.5 ${
                        disabled
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-700 dark:bg-slate-800"
                          : sel
                          ? "border-transparent bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow"
                          : "border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-300 dark:border-slate-600 dark:bg-slate-800/70"
                      }`}
                    >
                      <span className="text-[10px] font-bold">{d.name}</span>
                      <span className="text-[9px] opacity-70">{d.date}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={() => {
                if (results.length === 0) {
                  toast.error("پزشکی با این مشخصات یافت نشد", {
                    description: "لطفاً فیلتر دیگری امتحان کنید",
                    icon: "🔍",
                  });
                  return;
                }
                setStep("results");
              }}
              data-cursor="hover"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02] sm:mt-4 sm:py-3"
            >
              <Icon name="search" className="h-4 w-4" />
              جستجوی پزشک
            </button>

            {/* Trust badges */}
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 sm:mt-3 sm:text-[10px]">
              <span className="flex items-center gap-1">
                <Icon name="shield" className="h-3.5 w-3.5 text-emerald-600" />
                پرداخت امن
              </span>
              <span className="flex items-center gap-1">
                <Icon name="bell" className="h-3.5 w-3.5 text-cyan-600" />
                یادآور پیامکی
              </span>
              <span className="flex items-center gap-1 font-bold text-amber-500">
                ★ {toFa("۴٫۹")}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Results header */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {toFa(results.length)} پزشک یافت شد
              </div>
              <button
                onClick={() => setStep("select")}
                data-cursor="hover"
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 hover:underline"
              >
                <Icon name="arrow" className="h-3 w-3 rotate-180" />
                تغییر فیلتر
              </button>
            </div>

            {/* Doctor list */}
            <div className="mt-2 min-w-0 space-y-2">
              {results.map((d, i) => (
                <motion.button
                  key={d.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate("doctor", undefined, d.name)}
                  data-cursor="hover"
                  className="flex w-full items-center gap-2.5 rounded-xl border border-slate-100 bg-white/70 p-2 text-right transition hover:border-cyan-300 hover:bg-cyan-50/50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-cyan-900/20"
                >
                  <img
                    src={d.photo}
                    alt={d.name}
                    loading="lazy"
                    className="h-10 w-10 shrink-0 rounded-lg object-cover object-top"
                  />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                      {d.name}
                    </div>
                    <div className="truncate text-[10px] text-cyan-600">
                      {d.specialty} · {d.location}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                      <Icon name="star" className="h-2.5 w-2.5 fill-amber-500" />
                      {toFa(d.rating.toLocaleString("fa-IR"))}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {toFa(d.fee.toLocaleString("fa-IR"))} ت
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate("doctors")}
              data-cursor="hover"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50/50 py-2.5 text-xs font-bold text-cyan-700 transition hover:bg-cyan-50 dark:bg-cyan-900/20"
            >
              مشاهده همه پزشکان
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* selected filters summary */}
      {step === "select" && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-700">
          {spec !== "همه" && (
            <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-900/20">
              {spec}
            </span>
          )}
          <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-900/20">
            {selectedDay.name} · {selectedDay.date}
          </span>
        </div>
      )}
    </motion.div>
  );
}
